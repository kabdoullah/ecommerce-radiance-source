"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";
import { WhatsAppIcon } from "@/components/brand/social-icons";
import { Button, buttonStyles } from "@/components/ui/button";
import { Field, FormMessage, fieldA11y, inputStyles } from "@/components/ui/field";
import { cartSubtotal } from "@/features/cart/cart-math";
import { cartActions } from "@/features/cart/cart-store";
import { lineProblem, useCartDetails } from "@/features/cart/use-cart-details";
import { formatPrice } from "@/lib/utils/format";
import { placeOrder } from "../actions";
import type { CheckoutInput } from "../checkout-schema";
import { saveLastOrder } from "../last-order";

type FieldErrors = Partial<Record<keyof CheckoutInput, string>>;

const PHONE_HINT = "Avec l'indicatif du pays, par exemple +225 07 00 00 00 00.";

export function CheckoutView({
  deliveryFee,
  deliveryInfo,
}: {
  deliveryFee: number | null;
  deliveryInfo: string | null;
}) {
  const router = useRouter();
  const { status, lines, retry } = useCartDetails();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  if (status === "loading") {
    return <div className="mt-8 h-64 animate-pulse rounded-card bg-mist" aria-label="Chargement" />;
  }
  if (status === "error") {
    return (
      <div className="mt-8 space-y-4">
        <FormMessage tone="error">
          Impossible de vérifier votre panier pour le moment. Vérifiez votre connexion.
        </FormMessage>
        <Button variant="secondary" onClick={retry}>
          Réessayer
        </Button>
      </div>
    );
  }
  if (lines.length === 0) {
    return (
      <div className="mt-8 rounded-card bg-mist px-6 py-14 text-center">
        <p className="font-display text-2xl">Votre panier est vide.</p>
        <Link href="/boutique" className={buttonStyles("primary", "md", "mt-6")}>
          Découvrir la boutique
        </Link>
      </div>
    );
  }

  const hasProblem = lines.some((line) => lineProblem(line));
  const subtotal = cartSubtotal(
    lines.flatMap((line) =>
      line.product ? [{ unitPrice: line.product.price, quantity: line.quantity }] : [],
    ),
  );

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const input: CheckoutInput = {
      customerName: String(form.get("customerName") ?? ""),
      customerPhone: String(form.get("customerPhone") ?? ""),
      deliveryAddress: String(form.get("deliveryAddress") ?? ""),
      customerNote: String(form.get("customerNote") ?? ""),
      items: lines.map((line) => ({ productId: line.productId, quantity: line.quantity })),
    };

    setMessage(null);
    startTransition(async () => {
      try {
        const result = await placeOrder(input, String(form.get("website") ?? ""));
        if (!result.ok) {
          setFieldErrors(result.fieldErrors ?? {});
          setMessage(result.message);
          return;
        }
        // La commande est enregistrée : on peut vider le panier puis ouvrir WhatsApp.
        saveLastOrder({ ...result, redirected: false });
        cartActions.clear();
        router.replace("/commande/confirmation");
      } catch {
        setMessage(
          "La connexion a été interrompue : votre commande n'a peut-être pas été enregistrée. Vérifiez votre connexion puis réessayez.",
        );
      }
    });
  }

  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_22rem]">
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <div className="hidden" aria-hidden="true">
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </div>
        <Field id="customerName" label="Nom complet" error={fieldErrors.customerName}>
          <input
            {...fieldA11y("customerName", fieldErrors.customerName)}
            autoComplete="name"
            required
            maxLength={100}
            className={inputStyles}
          />
        </Field>
        <Field
          id="customerPhone"
          label="Téléphone (WhatsApp de préférence)"
          hint={PHONE_HINT}
          error={fieldErrors.customerPhone}
        >
          <input
            {...fieldA11y("customerPhone", fieldErrors.customerPhone, PHONE_HINT)}
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            required
            maxLength={25}
            className={inputStyles}
          />
        </Field>
        <Field
          id="deliveryAddress"
          label="Adresse ou zone de livraison"
          optional
          hint={deliveryInfo ?? undefined}
          error={fieldErrors.deliveryAddress}
        >
          <textarea
            {...fieldA11y("deliveryAddress", fieldErrors.deliveryAddress, deliveryInfo ?? undefined)}
            autoComplete="street-address"
            rows={2}
            maxLength={300}
            className={inputStyles}
          />
        </Field>
        <Field
          id="customerNote"
          label="Précisions pour la commande"
          optional
          error={fieldErrors.customerNote}
        >
          <textarea
            {...fieldA11y("customerNote", fieldErrors.customerNote)}
            rows={3}
            maxLength={500}
            className={inputStyles}
          />
        </Field>

        {message && <FormMessage tone="error">{message}</FormMessage>}
        {hasProblem && (
          <FormMessage tone="error">
            Certains articles ne sont plus disponibles dans la quantité demandée.{" "}
            <Link href="/panier" className="underline">
              Modifier le panier
            </Link>
          </FormMessage>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full sm:w-auto"
          disabled={pending || hasProblem}
        >
          <WhatsAppIcon className="size-5" />
          {pending ? "Enregistrement de la commande…" : "Valider et envoyer sur WhatsApp"}
        </Button>
        <p className="text-xs text-ink-soft">
          Votre commande est d&apos;abord enregistrée, puis WhatsApp s&apos;ouvre avec le
          récapitulatif pour convenir de la livraison et du paiement avec nous. Vos coordonnées
          servent uniquement à traiter cette commande.
        </p>
      </form>

      <aside className="h-fit rounded-card bg-surface p-6" aria-labelledby="checkout-summary">
        <h2 id="checkout-summary" className="font-display text-2xl">
          Votre commande
        </h2>
        <ul className="mt-5 space-y-3 text-sm">
          {lines.map((line) => (
            <li key={line.productId} className="flex justify-between gap-4">
              <span>
                {line.product?.name ?? "Produit indisponible"} × {line.quantity}
              </span>
              {line.product && (
                <span className="shrink-0">{formatPrice(line.product.price * line.quantity)}</span>
              )}
            </li>
          ))}
        </ul>
        <dl className="mt-5 space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between">
            <dt>Sous-total</dt>
            <dd>{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt>Livraison</dt>
            <dd>{deliveryFee ? formatPrice(deliveryFee) : "À convenir"}</dd>
          </div>
          <div className="flex justify-between pt-2 text-base font-semibold">
            <dt>Total</dt>
            <dd>{formatPrice(subtotal + (deliveryFee ?? 0))}</dd>
          </div>
        </dl>
        <Link
          href="/panier"
          className="mt-5 inline-block text-sm font-semibold text-cocoa hover:underline"
        >
          Modifier le panier
        </Link>
      </aside>
    </div>
  );
}
