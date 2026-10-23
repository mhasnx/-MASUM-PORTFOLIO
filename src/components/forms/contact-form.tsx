"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { submitContactMessage } from "@/app/actions/contact";
import { Button } from "@/components/ui/button";
import { InputField, TextareaField } from "@/components/ui/form-fields";
import { Notification } from "@/components/ui/notification";
import type { ContactFormState } from "@/app/actions/contact";

type ContactFormProps = {
  enabled: boolean;
  services: { slug: string; title: string }[];
};

const initialState: ContactFormState = null;

export function ContactForm({ enabled, services }: ContactFormProps) {
  const searchParams = useSearchParams();
  const requestedService = searchParams.get("service");
  const selectedService = services.find(
    (service) => service.slug === requestedService,
  );
  const [state, formAction, isPending] = useActionState(
    submitContactMessage,
    initialState,
  );

  return (
    <div className="contact-form-wrap">
      {!enabled ? (
        <Notification>
          Message delivery will be available after Supabase is configured.
        </Notification>
      ) : null}
      <form action={formAction} className="contact-form">
        <InputField
          autoComplete="name"
          disabled={!enabled || isPending}
          label="Name"
          maxLength={120}
          name="name"
          required
        />
        <InputField
          autoComplete="email"
          disabled={!enabled || isPending}
          label="Email"
          maxLength={254}
          name="email"
          required
          type="email"
        />
        <InputField
          disabled={!enabled || isPending}
          label="Subject"
          maxLength={160}
          name="subject"
          defaultValue={selectedService?.title ?? ""}
          required
        />
        <TextareaField
          disabled={!enabled || isPending}
          label="Message"
          maxLength={5000}
          name="message"
          required
          rows={5}
        />
        {state ? (
          <Notification tone={state.tone}>{state.message}</Notification>
        ) : null}
        <Button disabled={!enabled || isPending} type="submit">
          {isPending ? "Sending…" : "Send message"}
        </Button>
      </form>
    </div>
  );
}
