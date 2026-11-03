"use client";

import { useActionState } from "react";
import { Field, Notice, SubmitButton } from "@/components/admin/ui";
import { signIn } from "../actions";

export function LoginForm({ next }: { next: string }) {
  const [state, action] = useActionState(signIn, {});
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="next" value={next} />
      <Field label="Email" name="email" type="email" autoComplete="username" required />
      <Field label="Password" name="password" type="password" autoComplete="current-password" required />
      {state.errors?.form && <Notice tone="error">{state.errors.form}</Notice>}
      <SubmitButton pendingLabel="Signing in" className="btn-primary w-full">
        Sign in
      </SubmitButton>
    </form>
  );
}
