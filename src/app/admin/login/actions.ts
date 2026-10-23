"use server";

import { redirect } from "next/navigation";
import { adminLoginSchema } from "@/lib/validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type LoginState = {
  error?: string;
};

export async function signInAction(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = adminLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Enter a valid email address and password." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { error: "Sign in failed. Check your credentials and try again." };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      console.error(
        "Unable to clear an unverified administrator session.",
        signOutError,
      );
    }
    console.error("Unable to verify the newly authenticated administrator.");
    return { error: "Sign in failed. Check your credentials and try again." };
  }

  const { data: isAdmin, error: authorizationError } =
    await supabase.rpc("is_admin");

  if (authorizationError || !isAdmin) {
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      console.error("Unable to clear a non-administrator session.", signOutError);
    }

    if (authorizationError) {
      console.error(
        "Unable to verify administrator membership after sign-in.",
        authorizationError,
      );
    }

    return { error: "Sign in failed. Check your credentials and try again." };
  }

  redirect("/admin");
}

export async function signOutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Unable to clear the administrator session.", error);
    throw new Error("The session could not be cleared. Please try again.");
  }

  redirect("/admin/login");
}
