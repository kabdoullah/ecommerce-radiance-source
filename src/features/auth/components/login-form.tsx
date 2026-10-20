"use client";

import { useActionForm } from "@/lib/use-action-form";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, inputStyles } from "@/components/ui/field";
import { login, type LoginState } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionForm<LoginState>(login, { error: null });

  return (
    <form onSubmit={action} className="space-y-4">
      <Field id="email" label="Adresse e-mail">
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          required
          className={inputStyles}
        />
      </Field>
      <Field id="password" label="Mot de passe">
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={inputStyles}
        />
      </Field>
      {state.error && <FormMessage tone="error">{state.error}</FormMessage>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Connexion…" : "Se connecter"}
      </Button>
    </form>
  );
}
