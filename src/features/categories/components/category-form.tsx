"use client";

import { useEffect, useRef } from "react";
import { ActionFeedback } from "@/components/admin/action-feedback";
import { Button } from "@/components/ui/button";
import { Field, fieldA11y, inputStyles } from "@/components/ui/field";
import { IDLE } from "@/lib/action-result";
import { useActionForm } from "@/lib/use-action-form";
import { saveCategory } from "../admin-actions";
import { CATEGORY_ICONS } from "../icons";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  icon: string;
};

export function CategoryForm({ category }: { category?: Category }) {
  const [state, action, pending] = useActionForm(saveCategory, IDLE);
  const formRef = useRef<HTMLFormElement>(null);
  // Le formulaire de création se vide après succès, pour enchaîner une autre catégorie.
  useEffect(() => {
    if (!category && state.status === "success") formRef.current?.reset();
  }, [category, state]);
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  // Identifiants uniques : plusieurs formulaires coexistent sur la page.
  const prefix = category ? `cat-${category.id}` : "cat-new";

  return (
    <form ref={formRef} onSubmit={action} className="space-y-4" noValidate>
      {category && <input type="hidden" name="id" value={category.id} />}
      <div className="grid gap-4 sm:grid-cols-[1fr_1fr_8rem]">
        <Field id={`${prefix}-name`} label="Nom" error={errors.name}>
          <input
            {...fieldA11y(`${prefix}-name`, errors.name)}
            name="name"
            defaultValue={category?.name}
            required
            maxLength={80}
            className={inputStyles}
          />
        </Field>
        <Field
          id={`${prefix}-slug`}
          label="Adresse"
          optional
          hint="Générée depuis le nom si vide."
          error={errors.slug}
        >
          <input
            {...fieldA11y(`${prefix}-slug`, errors.slug, "hint")}
            name="slug"
            defaultValue={category?.slug}
            maxLength={80}
            className={inputStyles}
          />
        </Field>
        <Field id={`${prefix}-order`} label="Ordre" hint="1 = en premier" error={errors.sortOrder}>
          <input
            {...fieldA11y(`${prefix}-order`, errors.sortOrder, "hint")}
            name="sortOrder"
            type="number"
            min={0}
            max={9999}
            defaultValue={category?.sort_order ?? 0}
            className={inputStyles}
          />
        </Field>
      </div>
      <Field
        id={`${prefix}-description`}
        label="Description"
        optional
        error={errors.description}
      >
        <textarea
          {...fieldA11y(`${prefix}-description`, errors.description)}
          name="description"
          rows={2}
          maxLength={500}
          defaultValue={category?.description ?? ""}
          className={inputStyles}
        />
      </Field>
      <Field id={`${prefix}-icon`} label="Icône affichée sur la page d'accueil">
        <select
          id={`${prefix}-icon`}
          name="icon"
          defaultValue={category?.icon ?? "leaf"}
          className={inputStyles}
        >
          {Object.entries(CATEGORY_ICONS).map(([value, { label }]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </Field>
      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={category?.is_active ?? true}
          className="size-4 accent-cocoa"
        />
        Visible sur la boutique
      </label>
      <ActionFeedback state={state} />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Enregistrement…" : category ? "Enregistrer" : "Créer la catégorie"}
      </Button>
    </form>
  );
}
