"use client";

import type { ReactNode } from "react";
import { useActionForm } from "@/lib/use-action-form";
import { ActionFeedback } from "@/components/admin/action-feedback";
import { Button } from "@/components/ui/button";
import { Field, fieldA11y, inputStyles } from "@/components/ui/field";
import { ImageField } from "@/features/media/image-field";
import { IDLE } from "@/lib/action-result";
import { saveSettings } from "../admin-actions";
import type { StoreSettings } from "../queries";

type TextKey = {
  [K in keyof StoreSettings]: StoreSettings[K] extends string | number | null ? K : never;
}[keyof StoreSettings];

type FieldOptions = {
  hint?: string;
  optional?: boolean;
  type?: string;
  inputMode?: "numeric" | "tel";
};

export function SettingsForm({ settings }: { settings: StoreSettings }) {
  const [state, action, pending] = useActionForm(saveSettings, IDLE);
  const errors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
  const valueOf = (key: TextKey) => (settings[key] === null ? "" : String(settings[key]));

  const input = (key: TextKey, label: string, options: FieldOptions = {}) => (
    <Field
      id={key}
      label={label}
      hint={options.hint}
      optional={options.optional}
      error={errors[key]}
    >
      <input
        {...fieldA11y(key, errors[key], options.hint)}
        type={options.type ?? "text"}
        inputMode={options.inputMode}
        defaultValue={valueOf(key)}
        className={inputStyles}
      />
    </Field>
  );

  const textarea = (key: TextKey, label: string, rows: number, options: FieldOptions = {}) => (
    <Field
      id={key}
      label={label}
      hint={options.hint}
      optional={options.optional ?? true}
      error={errors[key]}
    >
      <textarea
        {...fieldA11y(key, errors[key], options.hint)}
        rows={rows}
        defaultValue={valueOf(key)}
        className={inputStyles}
      />
    </Field>
  );

  return (
    <form onSubmit={action} className="space-y-8" noValidate>
      <Section
        title="Commandes WhatsApp"
        description="Les commandes de la boutique sont envoyées à ce numéro."
      >
        {input("whatsapp_number", "Numéro WhatsApp de la boutique", {
          hint: "Avec l'indicatif du pays, par exemple +225 07 00 00 00 00. Sans numéro, les clients sont recontactés par téléphone.",
          optional: true,
          type: "tel",
          inputMode: "tel",
        })}
        {textarea("order_message_intro", "Début du message de commande", 2, {
          hint: "Phrase placée avant le récapitulatif envoyé sur WhatsApp.",
          optional: false,
        })}
        {input("delivery_fee", "Frais de livraison fixes (FCFA)", {
          hint: "Ajoutés au total de chaque commande. Laissez vide s'ils sont convenus au cas par cas.",
          optional: true,
          inputMode: "numeric",
        })}
        {textarea("delivery_info", "Informations de livraison", 3, {
          hint: "Zones, délais, conditions : affichées sur l'accueil, les fiches produits et à la commande.",
        })}
        {textarea("payment_info", "Moyens de paiement", 2, {
          hint: "Ex. : À la livraison ou via Mobile Money (MTN, Orange).",
        })}
      </Section>

      <Section
        title="Bandeau du haut de page"
        description="Messages courts affichés au-dessus du menu, avec le téléphone du service client."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {input("delivery_summary", "Message livraison", {
            optional: true,
            hint: "Ex. : Livraison partout en Côte d'Ivoire",
          })}
          {input("payment_summary", "Message paiement", {
            optional: true,
            hint: "Ex. : Paiement à la livraison ou mobile money",
          })}
        </div>
      </Section>

      <Section title="Identité">
        {input("store_name", "Nom de la boutique")}
        {input("tagline", "Ligne sous le nom", {
          optional: true,
          hint: "Ex. : Beauté • Soin • Éclat",
        })}
        <ImageField
          name="logo_path"
          label="Logo"
          folder="settings"
          initialPath={settings.logo_path}
          hint="Facultatif : sans logo, le nom de la boutique est affiché avec l'emblème."
        />
      </Section>

      <Section title="Coordonnées">
        <div className="grid gap-5 sm:grid-cols-2">
          {input("contact_phone", "Téléphone affiché", { optional: true, type: "tel" })}
          {input("contact_email", "E-mail de contact", { optional: true, type: "email" })}
        </div>
        {input("address", "Adresse", { optional: true })}
        {input("opening_hours", "Horaires", {
          optional: true,
          hint: "Par exemple : Lun – Sam, 9h – 19h",
        })}
      </Section>

      <Section title="Page d'accueil">
        {input("hero_title", "Titre principal", {
          optional: true,
          hint: "Vide : le nom de la boutique est utilisé.",
        })}
        {input("hero_script", "Phrase manuscrite sous le titre", {
          optional: true,
          hint: "Ex. : Votre beauté, notre passion.",
        })}
        {textarea("hero_subtitle", "Texte sous le titre", 2)}
        {textarea("hero_side_quote", "Citation à droite de l'image", 2, {
          hint: "Affichée sur ordinateur uniquement.",
        })}
        <ImageField
          name="hero_image_path"
          label="Grande image d'accueil"
          folder="settings"
          initialPath={settings.hero_image_path}
          hint="Format paysage large (ex. 1600 × 700). Le texte s'affiche sur la partie gauche."
        />
        {input("about_title", "Titre de la présentation", {
          optional: true,
          hint: "Vide : « À propos de » suivi du nom de la boutique.",
        })}
        {textarea("about_text", "Texte de présentation", 6, {
          hint: "Laissez une ligne vide entre deux paragraphes.",
        })}
        {textarea("about_highlights", "Engagements", 3, {
          hint: "Un par ligne, 3 maximum. Ex. : Qualité assurée",
        })}
        <ImageField
          name="about_image_path"
          label="Image de la présentation"
          folder="settings"
          initialPath={settings.about_image_path}
        />
      </Section>

      <Section title="Réseaux sociaux et pied de page">
        <div className="grid gap-5 sm:grid-cols-3">
          {input("instagram_url", "Instagram", {
            optional: true,
            type: "url",
            hint: "Adresse complète, https://…",
          })}
          {input("facebook_url", "Facebook", { optional: true, type: "url" })}
          {input("tiktok_url", "TikTok", { optional: true, type: "url" })}
        </div>
        {textarea("footer_text", "Texte du pied de page", 2)}
      </Section>

      <div className="sticky bottom-0 -mx-4 space-y-3 border-t border-line bg-paper/95 px-4 py-4 backdrop-blur sm:-mx-8 sm:px-8">
        <ActionFeedback state={state} />
        <Button type="submit" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer les paramètres"}
        </Button>
      </div>
    </form>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="space-y-5 rounded-card border border-line bg-surface p-5 sm:p-6">
      <legend className="px-1 text-lg font-semibold">{title}</legend>
      {description && <p className="-mt-2 text-sm text-ink-soft">{description}</p>}
      {children}
    </fieldset>
  );
}
