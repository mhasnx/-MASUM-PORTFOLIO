"use client";

import { useActionState } from "react";
import { signInAction } from "./actions";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/ui/form-fields";
import { Notification } from "@/components/ui/notification";

type LoginFormProps = {
  enabled: boolean;
};

export function LoginForm({ enabled }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(signInAction, {});

  return (
    <form action={formAction} className="auth-form">
      <InputField
        autoComplete="email"
        disabled={!enabled || isPending}
        label="Email"
        name="email"
        required
        type="email"
      />
      <InputField
        autoComplete="current-password"
        disabled={!enabled || isPending}
        label="Password"
        name="password"
        required
        type="password"
      />
      {state.error ? (
        <Notification tone="error">{state.error}</Notification>
      ) : null}
      <Button disabled={!enabled || isPending} type="submit">
        {isPending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
