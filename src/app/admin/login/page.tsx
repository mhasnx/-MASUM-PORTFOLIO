import type { Metadata } from "next";
import { Suspense } from "react";
import { Notification } from "@/components/ui/notification";
import { getSupabasePublicConfig } from "@/lib/supabase/config";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Admin sign in | Mahmudul Hassan Masum",
  robots: { index: false, follow: false },
};

type AdminLoginPageProps = {
  searchParams: Promise<{ reason?: string }>;
};

export default function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const isSupabaseConfigured = Boolean(getSupabasePublicConfig());

  return (
    <main className="auth-page">
      <section aria-labelledby="admin-login-title" className="auth-card">
        <p className="eyebrow">
          <span className="eyebrow-line" />
          Private area
        </p>
        <h1 id="admin-login-title">Admin sign in</h1>
        <p>Sign in with an administrator account for this portfolio.</p>
        <Suspense fallback={null}>
          <SessionNotice searchParams={searchParams} />
        </Suspense>
        {!isSupabaseConfigured ? (
          <Notification>
            Configure Supabase environment variables before signing in.
          </Notification>
        ) : null}
        <LoginForm enabled={isSupabaseConfigured} />
      </section>
    </main>
  );
}

async function SessionNotice({
  searchParams,
}: AdminLoginPageProps) {
  const { reason } = await searchParams;

  return reason === "session" ? (
    <Notification>Your session ended. Please sign in again.</Notification>
  ) : null;
}
