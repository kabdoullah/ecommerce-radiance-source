import { Badge } from "@/components/admin/page-header";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  type OrderStatus,
  type PaymentStatus,
} from "../status";

const TONES = {
  pending: "warning",
  confirmed: "info",
  preparing: "info",
  shipping: "info",
  completed: "success",
  cancelled: "danger",
} as const satisfies Record<OrderStatus, string>;

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <Badge tone={TONES[status]}>{ORDER_STATUS_LABELS[status]}</Badge>;
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  return (
    <Badge tone={status === "paid" ? "success" : "neutral"}>{PAYMENT_STATUS_LABELS[status]}</Badge>
  );
}
