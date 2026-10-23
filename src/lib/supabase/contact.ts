import "server-only";

import { createHmac } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import type { z } from "zod";
import { contactMessageSchema } from "@/lib/validation";
import type { Database } from "@/types/database";

type ContactMessage = z.output<typeof contactMessageSchema>;

export function isContactSubmissionConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export async function submitContactMessage(
  message: ContactMessage,
  clientAddress: string,
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error("Contact submission is not configured on the server.");
  }

  const requestIdentityHash = createHmac("sha256", serviceRoleKey)
    .update(`${clientAddress}|${message.email.toLowerCase()}`)
    .digest("hex");
  const supabase = createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return supabase.rpc("submit_contact_message", {
    p_name: message.name,
    p_email: message.email,
    p_subject: message.subject,
    p_message: message.message,
    p_request_identity_hash: requestIdentityHash,
  });
}
