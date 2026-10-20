"use client";

import { startTransition, useActionState, type FormEvent } from "react";

/**
 * useActionState sans la réinitialisation automatique du formulaire de React 19 :
 * en cas d'erreur, les valeurs saisies restent dans les champs pour être corrigées.
 */
export function useActionForm<State>(
  action: (state: Awaited<State>, formData: FormData) => State | Promise<State>,
  initialState: Awaited<State>,
) {
  const [state, dispatch, pending] = useActionState(action, initialState);
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  };
  return [state, onSubmit, pending] as const;
}
