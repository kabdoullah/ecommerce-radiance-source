"use client";

import { useActionForm } from "@/lib/use-action-form";
import { Button } from "@/components/ui/button";
import { Field, FormMessage, fieldA11y, inputStyles } from "@/components/ui/field";
import { submitReview, type ReviewFormState } from "../actions";

export function ReviewForm({ productId }: { productId: string }) {
  const [state, action, pending] = useActionForm<ReviewFormState>(submitReview, {
    status: "idle",
  });

  if (state.status === "success") {
    return (
      <FormMessage tone="success">
        Merci ! Votre avis a bien été envoyé. Il sera publié après relecture.
      </FormMessage>
    );
  }

  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  return (
    <form onSubmit={action} className="space-y-4" noValidate>
      <input type="hidden" name="productId" value={productId} />
      <div className="hidden" aria-hidden="true">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <Field id="authorName" label="Votre prénom" error={errors.authorName}>
        <input
          {...fieldA11y("authorName", errors.authorName)}
          required
          maxLength={60}
          className={inputStyles}
        />
      </Field>
      <fieldset>
        <legend className="text-sm font-semibold">Votre note</legend>
        <div className="mt-2 flex flex-wrap gap-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <label key={value} className="cursor-pointer">
              <input
                type="radio"
                name="rating"
                value={value}
                className="peer sr-only"
                required
                aria-describedby={errors.rating ? "rating-error" : undefined}
              />
              <span className="flex h-10 min-w-12 items-center justify-center rounded-full border border-line px-3 text-sm peer-checked:border-cocoa peer-checked:bg-cocoa peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-cocoa">
                {value} <span aria-hidden="true">★</span>
                <span className="sr-only">sur 5</span>
              </span>
            </label>
          ))}
        </div>
        {errors.rating && (
          <p id="rating-error" className="mt-1 text-sm text-clay" role="alert">
            {errors.rating}
          </p>
        )}
      </fieldset>
      <Field id="comment" label="Votre avis" error={errors.comment}>
        <textarea
          {...fieldA11y("comment", errors.comment)}
          rows={4}
          required
          maxLength={1000}
          className={inputStyles}
        />
      </Field>
      {state.status === "error" && <FormMessage tone="error">{state.message}</FormMessage>}
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? "Envoi en cours…" : "Envoyer mon avis"}
      </Button>
    </form>
  );
}
