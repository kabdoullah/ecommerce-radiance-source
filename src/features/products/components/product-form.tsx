"use client";

import { useState } from "react";
import { useActionForm } from "@/lib/use-action-form";
import { ActionFeedback } from "@/components/admin/action-feedback";
import { Button } from "@/components/ui/button";
import { Field, fieldA11y, inputStyles } from "@/components/ui/field";
import { IDLE } from "@/lib/action-result";
import { slugify } from "@/lib/utils/slug";
import { saveProduct } from "../admin-actions";
import type { AdminProduct } from "../admin-queries";

export function ProductForm({
  product,
  categories,
}: {
  product?: AdminProduct;
  categories: { id: string; name: string; is_active: boolean }[];
}) {
  const [state, action, pending] = useActionForm(saveProduct, IDLE);
  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugEdited, setSlugEdited] = useState(Boolean(product));
  const [trackStock, setTrackStock] = useState(product ? product.stock_quantity !== null : false);
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};

  return (
    <form onSubmit={action} className="space-y-6" noValidate>
      {product && <input type="hidden" name="id" value={product.id} />}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field id="name" label="Nom du produit" error={errors.name}>
          <input
            {...fieldA11y("name", errors.name)}
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (!slugEdited) setSlug(slugify(event.target.value));
            }}
            required
            maxLength={120}
            className={inputStyles}
          />
        </Field>
        <Field
          id="slug"
          label="Adresse de la page"
          hint={`Page visible sur /produits/${slug || "…"}. La modifier rend invalides les liens déjà partagés.`}
          error={errors.slug}
        >
          <input
            {...fieldA11y("slug", errors.slug, "hint")}
            value={slug}
            onChange={(event) => {
              setSlugEdited(true);
              setSlug(event.target.value);
            }}
            maxLength={80}
            className={inputStyles}
          />
        </Field>
      </div>

      <Field
        id="subtitle"
        label="Accroche courte"
        optional
        hint="Affichée sous le nom, par exemple « Gel douche exfoliant »."
        error={errors.subtitle}
      >
        <input
          {...fieldA11y("subtitle", errors.subtitle, "hint")}
          defaultValue={product?.subtitle ?? ""}
          maxLength={80}
          className={inputStyles}
        />
      </Field>

      <Field id="description" label="Description" optional error={errors.description}>
        <textarea
          {...fieldA11y("description", errors.description)}
          defaultValue={product?.description ?? ""}
          rows={6}
          maxLength={5000}
          className={inputStyles}
        />
      </Field>

      <fieldset className="space-y-5 rounded-card border border-line p-4">
        <legend className="px-1 text-sm font-semibold">Fiche détaillée (facultatif)</legend>
        <Field
          id="highlights"
          label="Points forts"
          hint="Un par ligne, 3 maximum. Ex. : Nettoie en profondeur"
          error={errors.highlights}
        >
          <textarea
            {...fieldA11y("highlights", errors.highlights, "hint")}
            defaultValue={product?.highlights ?? ""}
            rows={3}
            maxLength={300}
            className={inputStyles}
          />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="usageTips" label="Conseils d'utilisation" error={errors.usageTips}>
            <textarea
              {...fieldA11y("usageTips", errors.usageTips)}
              defaultValue={product?.usage_tips ?? ""}
              rows={3}
              maxLength={1000}
              className={inputStyles}
            />
          </Field>
          <Field id="precautions" label="Précautions" error={errors.precautions}>
            <textarea
              {...fieldA11y("precautions", errors.precautions)}
              defaultValue={product?.precautions ?? ""}
              rows={3}
              maxLength={1000}
              className={inputStyles}
            />
          </Field>
          <Field
            id="skinType"
            label="Type de peau ou de cheveux"
            hint="Ex. : Convient à tous types de peau"
            error={errors.skinType}
          >
            <input
              {...fieldA11y("skinType", errors.skinType, "hint")}
              defaultValue={product?.skin_type ?? ""}
              maxLength={80}
              className={inputStyles}
            />
          </Field>
          <Field id="volume" label="Contenance" hint="Ex. : 1 L, 250 ml, 100 g" error={errors.volume}>
            <input
              {...fieldA11y("volume", errors.volume, "hint")}
              defaultValue={product?.volume ?? ""}
              maxLength={40}
              className={inputStyles}
            />
          </Field>
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-3">
        <Field id="price" label="Prix (FCFA)" error={errors.price}>
          <input
            {...fieldA11y("price", errors.price)}
            defaultValue={product?.price ?? ""}
            inputMode="numeric"
            required
            className={inputStyles}
          />
        </Field>
        <Field
          id="compareAtPrice"
          label="Ancien prix (FCFA)"
          optional
          hint="Affiché barré pour une promotion."
          error={errors.compareAtPrice}
        >
          <input
            {...fieldA11y("compareAtPrice", errors.compareAtPrice, "hint")}
            defaultValue={product?.compare_at_price ?? ""}
            inputMode="numeric"
            className={inputStyles}
          />
        </Field>
        <Field id="categoryId" label="Catégorie" optional error={errors.categoryId}>
          <select
            {...fieldA11y("categoryId", errors.categoryId)}
            defaultValue={product?.category_id ?? ""}
            className={inputStyles}
          >
            <option value="">Aucune catégorie</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
                {category.is_active ? "" : " (masquée)"}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <fieldset className="space-y-3 rounded-card border border-line p-4">
        <legend className="px-1 text-sm font-semibold">Disponibilité</legend>
        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            name="trackStock"
            checked={trackStock}
            onChange={(event) => setTrackStock(event.target.checked)}
            className="size-4 accent-bordeaux"
          />
          Suivre le stock (sinon, le produit est toujours disponible)
        </label>
        {trackStock && (
          <Field
            id="stockQuantity"
            label="Quantité en stock"
            hint="Diminue automatiquement à chaque commande ; 0 = épuisé."
            error={errors.stockQuantity}
          >
            <input
              {...fieldA11y("stockQuantity", errors.stockQuantity, "hint")}
              defaultValue={product?.stock_quantity ?? 0}
              inputMode="numeric"
              className={`${inputStyles} max-w-40`}
            />
          </Field>
        )}
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="sr-only">Publication</legend>
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={product?.is_active ?? false}
            className="mt-0.5 size-4 accent-bordeaux"
          />
          <span>
            <span className="font-semibold">Publié sur la boutique</span>
            <span className="block text-ink-soft">
              Décochez pour masquer le produit sans le supprimer.
            </span>
          </span>
        </label>
        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            name="isFeatured"
            defaultChecked={product?.is_featured ?? false}
            className="mt-0.5 size-4 accent-bordeaux"
          />
          <span>
            <span className="font-semibold">Mis en avant sur la page d&apos;accueil</span>
            <span className="block text-ink-soft">Apparaît dans « Nos essentiels ».</span>
          </span>
        </label>
      </fieldset>

      <ActionFeedback state={state} />
      <Button type="submit" disabled={pending}>
        {pending
          ? "Enregistrement…"
          : product
            ? "Enregistrer les modifications"
            : "Créer le produit"}
      </Button>
    </form>
  );
}
