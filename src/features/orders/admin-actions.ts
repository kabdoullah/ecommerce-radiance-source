"use server";

import { refresh, updateTag } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/features/auth/session";
import type { ActionResult } from "@/lib/action-result";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, canTransition, type OrderStatus } from "./status";

const orderId = z.uuid();
const statusSchema = z.enum(ORDER_STATUSES as [OrderStatus, ...OrderStatus[]]);

export async function updateOrderStatus(id: string, nextStatus: string): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsedId = orderId.safeParse(id);
  const parsedStatus = statusSchema.safeParse(nextStatus);
  if (!parsedId.success || !parsedStatus.success) {
    return { status: "error", message: "Statut demandé invalide." };
  }

  const { data: order, error: readError } = await supabase
    .from("orders")
    .select("status")
    .eq("id", parsedId.data)
    .maybeSingle();
  if (readError || !order) return { status: "error", message: "Commande introuvable." };

  if (!canTransition(order.status, parsedStatus.data)) {
    return {
      status: "error",
      message: `Impossible de passer de « ${ORDER_STATUS_LABELS[order.status]} » à « ${ORDER_STATUS_LABELS[parsedStatus.data]} ».`,
    };
  }

  // La base revérifie la transition (trigger) et restitue le stock en cas d'annulation.
  // Le filtre sur l'ancien statut évite d'écraser une modification simultanée.
  const { data: updated, error } = await supabase
    .from("orders")
    .update({ status: parsedStatus.data })
    .eq("id", parsedId.data)
    .eq("status", order.status)
    .select("id");
  if (error || !updated?.length) {
    return {
      status: "error",
      message: "Le statut n'a pas pu être modifié. Rechargez la page et réessayez.",
    };
  }

  if (parsedStatus.data === "cancelled") updateTag(CACHE_TAGS.catalog);
  refresh();
  return {
    status: "success",
    message: `Commande passée au statut « ${ORDER_STATUS_LABELS[parsedStatus.data]} ».`,
  };
}

export async function setOrderPayment(id: string, paid: boolean): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsedId = orderId.safeParse(id);
  if (!parsedId.success) return { status: "error", message: "Commande introuvable." };

  const { error } = await supabase
    .from("orders")
    .update({
      payment_status: paid ? "paid" : "unpaid",
      paid_at: paid ? new Date().toISOString() : null,
    })
    .eq("id", parsedId.data);
  if (error) return { status: "error", message: "Le paiement n'a pas pu être enregistré." };

  refresh();
  return {
    status: "success",
    message: paid ? "Paiement marqué comme vérifié." : "Paiement marqué comme non reçu.",
  };
}

const noteSchema = z.object({
  id: z.uuid(),
  note: z.string().trim().max(1000, "1000 caractères maximum."),
});

export async function saveOrderNote(
  _previous: ActionResult,
  formData: FormData,
): Promise<ActionResult> {
  const { supabase } = await requireAdmin();
  const parsed = noteSchema.safeParse({ id: formData.get("id"), note: formData.get("note") ?? "" });
  if (!parsed.success) return { status: "error", message: parsed.error.issues[0].message };

  const { error } = await supabase
    .from("orders")
    .update({ admin_note: parsed.data.note || null })
    .eq("id", parsed.data.id);
  if (error) return { status: "error", message: "La note n'a pas pu être enregistrée." };

  refresh();
  return { status: "success", message: "Note enregistrée." };
}
