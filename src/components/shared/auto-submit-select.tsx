"use client";

import type { SelectHTMLAttributes } from "react";

/** Liste déroulante qui soumet son formulaire dès qu'on change de valeur. */
export function AutoSubmitSelect(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} onChange={(event) => event.currentTarget.form?.requestSubmit()} />;
}
