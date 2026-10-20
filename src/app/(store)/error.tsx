"use client";

import { ErrorState } from "@/components/shared/error-state";

export default function StoreError({ reset }: { error: Error; reset: () => void }) {
  return <ErrorState reset={reset} />;
}
