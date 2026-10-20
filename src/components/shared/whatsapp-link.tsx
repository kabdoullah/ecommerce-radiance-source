"use client";

import type { AnchorHTMLAttributes } from "react";
import { toAndroidIntentUrl } from "@/features/orders/whatsapp";

/** Lien wa.me qui, sur Android, ouvre directement l'application WhatsApp (voir toAndroidIntentUrl). */
export function WhatsAppLink({
  href,
  onClick,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <a
      {...props}
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || !/Android/i.test(navigator.userAgent)) return;
        event.preventDefault();
        window.location.href = toAndroidIntentUrl(href);
      }}
    />
  );
}
