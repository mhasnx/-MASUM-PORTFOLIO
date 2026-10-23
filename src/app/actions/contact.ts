"use server";

import { isIP } from "node:net";
import { headers } from "next/headers";
import { contactMessageSchema } from "@/lib/validation";
import { submitContactMessage as persistContactSubmission } from "@/lib/supabase/contact";

export type ContactFormState = {
  tone: "success" | "error";
  message: string;
} | null;

export async function submitContactMessage(
  _previousState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const parsed = contactMessageSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return {
      tone: "error",
      message: "Check the form fields and make sure each one is complete.",
    };
  }

  const requestHeaders = await headers();
  const forwardedAddresses =
    requestHeaders.get("x-vercel-forwarded-for") ??
    requestHeaders.get("x-forwarded-for") ??
    "";
  const clientAddress =
    forwardedAddresses
      .split(",")
      .map((address) => address.trim())
      .reverse()
      .find((address) => isIP(address) !== 0) ?? "unknown";
  const { error } = await persistContactSubmission(parsed.data, clientAddress);

  if (error) {
    console.error("Unable to submit a contact message.", error);
    return {
      tone: "error",
      message:
        error.code === "P0001"
          ? "Too many messages were sent from this address. Please try again later."
          : "Message delivery is temporarily unavailable. Please try again later.",
    };
  }

  return {
    tone: "success",
    message: "Thank you. Your message has been sent.",
  };
}
