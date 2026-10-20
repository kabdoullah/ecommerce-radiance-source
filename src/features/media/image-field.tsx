"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ACCEPTED_IMAGE_TYPES, mediaUrl } from "@/lib/media";
import { UploadError, uploadImage } from "./upload-image";

/**
 * Champ image d'un formulaire : envoie la photo choisie puis place son chemin
 * dans un champ caché, enregistré avec le reste du formulaire.
 */
export function ImageField({
  name,
  label,
  hint,
  folder,
  initialPath,
}: {
  name: string;
  label: string;
  hint?: string;
  folder: string;
  initialPath: string | null;
}) {
  const [path, setPath] = useState(initialPath ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      setPath(await uploadImage(file, folder));
    } catch (uploadError) {
      setError(uploadError instanceof UploadError ? uploadError.message : "L'envoi a échoué.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold">{label}</p>
      <input type="hidden" name={name} value={path} />
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative size-24 overflow-hidden rounded-card border border-line bg-mist">
          {path && (
            <Image src={mediaUrl(path)} alt="" fill sizes="96px" className="object-contain" />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <label
            className={`inline-flex h-9 cursor-pointer items-center rounded-full border border-ink/25 bg-surface px-4 text-sm font-semibold hover:border-ink/60 has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-3 has-[input:focus-visible]:outline-cocoa ${
              uploading ? "pointer-events-none opacity-60" : ""
            }`}
          >
            {uploading ? "Envoi…" : path ? "Changer l'image" : "Choisir une image"}
            <input
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              className="sr-only"
              disabled={uploading}
              onChange={(event) => {
                void onFile(event.target.files?.[0]);
                event.target.value = "";
              }}
            />
          </label>
          {path && (
            <Button variant="ghost" size="sm" onClick={() => setPath("")}>
              Retirer
            </Button>
          )}
        </div>
      </div>
      {hint && <p className="text-xs text-ink-soft">{hint}</p>}
      {path !== (initialPath ?? "") && !error && (
        <p className="text-xs font-medium">Pensez à enregistrer pour appliquer ce changement.</p>
      )}
      {error && (
        <p role="alert" className="text-sm text-clay">
          {error}
        </p>
      )}
    </div>
  );
}
