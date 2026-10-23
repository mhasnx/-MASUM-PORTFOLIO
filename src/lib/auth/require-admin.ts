import "server-only";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) {
    console.error("Unable to verify the current administrator session.", userError);
    redirect("/admin/login?reason=session");
  }

  if (!user) {
    redirect("/admin/login");
  }

  const { data: isAdmin, error: adminError } =
    await supabase.rpc("is_admin");

  if (adminError) {
    throw new Error(`Unable to verify administrator access: ${adminError.message}`);
  }

  if (!isAdmin) {
    redirect("/");
  }

  return user;
}
