"use client";

import type { InputHTMLAttributes } from "react";

/**
 * Champ de recherche qui resoumet son formulaire quand on le vide (croix native, ou texte
 * effacé) : sans cela, les résultats de la recherche précédente restent affichés.
 */
export function SearchInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, "type">) {
  return (
    <input
      {...props}
      type="search"
      onInput={(event) => {
        if (event.currentTarget.value === "" && props.defaultValue) {
          event.currentTarget.form?.requestSubmit();
        }
      }}
    />
  );
}
