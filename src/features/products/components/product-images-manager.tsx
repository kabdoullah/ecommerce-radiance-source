"use client";

import { ArrowDown, ArrowUp, ImagePlus } from "lucide-react";
import Image from "next/image";
import { useState, useTransition } from "react";
import { useActionForm } from "@/lib/use-action-form";
import { ActionFeedback } from "@/components/admin/action-feedback";
import { ConfirmAction } from "@/components/admin/confirm-action";
import { Button } from "@/components/ui/button";
import { inputStyles } from "@/components/ui/field";
import { UploadError, uploadImage } from "@/features/media/upload-image";
import { IDLE, type ActionResult } from "@/lib/action-result";
import { ACCEPTED_IMAGE_TYPES, mediaUrl } from "@/lib/media";
import {
  addProductImage,
  deleteProductImage,
  moveProductImage,
  updateImageAlt,
} from "../admin-actions";

type ImageRow = { id: string; storage_path: string; alt_text: string };

export function ProductImagesManager({
  productId,
  images,
}: {
  productId: string;
  images: ImageRow[];
}) {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<ActionResult>(IDLE);
  const [pending, startTransition] = useTransition();

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setResult(IDLE);
    const errors: string[] = [];
    let added = 0;
    for (const file of Array.from(files)) {
      try {
        const path = await uploadImage(file, `products/${productId}`);
        const outcome = await addProductImage(productId, path);
        if (outcome.status === "error") errors.push(outcome.message);
        else added += 1;
      } catch (error) {
        errors.push(
          error instanceof UploadError ? error.message : `« ${file.name} » n'a pas pu être envoyée.`,
        );
      }
    }
    setUploading(false);
    setResult(
      errors.length > 0
        ? { status: "error", message: errors.join(" ") }
        : { status: "success", message: added > 1 ? `${added} photos ajoutées.` : "Photo ajoutée." },
    );
  }

  const move = (imageId: string, direction: "up" | "down") =>
    startTransition(async () => setResult(await moveProductImage(imageId, direction)));

  return (
    <div className="space-y-5">
      {images.length === 0 ? (
        <p className="text-sm text-ink-soft">
          Aucune photo. Ajoutez au moins une photo nette, de préférence au format portrait.
        </p>
      ) : (
        <ol className="space-y-3">
          {images.map((image, index) => (
            <li
              key={image.id}
              className="flex flex-wrap items-center gap-4 rounded-card border border-line p-3"
            >
              <div className="relative size-20 shrink-0 overflow-hidden rounded bg-mist">
                <Image
                  src={mediaUrl(image.storage_path)}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-48 flex-1 space-y-2">
                <p className="text-xs font-semibold text-ink-soft">
                  {index === 0 ? "Photo principale" : `Photo ${index + 1}`}
                </p>
                <AltTextForm image={image} />
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Monter la photo"
                  disabled={index === 0 || pending}
                  onClick={() => move(image.id, "up")}
                >
                  <ArrowUp className="size-4" aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label="Descendre la photo"
                  disabled={index === images.length - 1 || pending}
                  onClick={() => move(image.id, "down")}
                >
                  <ArrowDown className="size-4" aria-hidden="true" />
                </Button>
                <ConfirmAction
                  label="Supprimer"
                  title="Supprimer cette photo ?"
                  description="La photo sera retirée du produit et définitivement effacée du stockage."
                  confirmLabel="Supprimer la photo"
                  action={() => deleteProductImage(image.id)}
                />
              </div>
            </li>
          ))}
        </ol>
      )}

      <div>
        <label
          className={`inline-flex cursor-pointer items-center gap-2 rounded-full border border-dashed border-cocoa px-5 py-3 text-sm font-semibold text-cocoa hover:bg-cocoa/5 ${
            uploading ? "pointer-events-none opacity-60" : ""
          }`}
        >
          <ImagePlus className="size-4" aria-hidden="true" />
          {uploading ? "Envoi en cours…" : "Ajouter des photos"}
          <input
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            multiple
            className="sr-only"
            disabled={uploading}
            onChange={(event) => {
              void onFiles(event.target.files);
              event.target.value = "";
            }}
          />
        </label>
        <p className="mt-2 text-xs text-ink-soft">
          JPG, PNG ou WebP. Les photos sont automatiquement redimensionnées et allégées avant
          l&apos;envoi.
        </p>
      </div>

      <ActionFeedback state={result} />
    </div>
  );
}

function AltTextForm({ image }: { image: ImageRow }) {
  const [state, action, pending] = useActionForm(updateImageAlt, IDLE);
  return (
    <form onSubmit={action} className="space-y-1">
      <input type="hidden" name="id" value={image.id} />
      <div className="flex gap-2">
        <label htmlFor={`alt-${image.id}`} className="sr-only">
          Description de la photo
        </label>
        <input
          id={`alt-${image.id}`}
          name="alt"
          defaultValue={image.alt_text}
          maxLength={200}
          placeholder="Description (ex. : flacon de 30 ml, vue de face)"
          className={`${inputStyles} py-1.5`}
        />
        <Button type="submit" size="sm" variant="secondary" disabled={pending}>
          OK
        </Button>
      </div>
      {state.status !== "idle" && (
        <p
          role="status"
          className={`text-xs ${state.status === "error" ? "text-clay" : "text-success"}`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
