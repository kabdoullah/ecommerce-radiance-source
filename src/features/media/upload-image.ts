"use client";

import { ACCEPTED_IMAGE_TYPES, MAX_UPLOAD_BYTES, MEDIA_BUCKET } from "@/lib/media";
import { createBrowserSupabase } from "@/lib/supabase/browser";

const MAX_SOURCE_BYTES = 20 * 1024 * 1024;
const MAX_DIMENSION = 1600;

export class UploadError extends Error {}

/**
 * Réduit la photo (1600 px max, WebP) dans le navigateur avant l'envoi :
 * fichiers légers pour rester dans le quota gratuit et pages plus rapides.
 */
async function optimize(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const encode = (type: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.85));
  const webp = await encode("image/webp");
  if (webp?.type === "image/webp") return webp;
  const jpeg = await encode("image/jpeg");
  if (!jpeg) {
    throw new UploadError("Cette image n'a pas pu être préparée. Essayez un autre fichier.");
  }
  return jpeg;
}

/** Envoie une image dans le dossier donné du stockage et renvoie son chemin. */
export async function uploadImage(file: File, folder: string): Promise<string> {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    throw new UploadError(
      `« ${file.name} » : format non accepté. Utilisez une photo JPG, PNG ou WebP.`,
    );
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new UploadError(`« ${file.name} » est trop lourde (20 Mo maximum).`);
  }

  let blob: Blob;
  try {
    blob = await optimize(file);
  } catch (error) {
    if (error instanceof UploadError) throw error;
    throw new UploadError(`« ${file.name} » n'a pas pu être lue. Essayez un autre fichier.`);
  }
  if (blob.size > MAX_UPLOAD_BYTES) {
    throw new UploadError(`« ${file.name} » reste trop lourde après optimisation (5 Mo maximum).`);
  }

  const extension = blob.type === "image/webp" ? "webp" : "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;
  const { error } = await createBrowserSupabase()
    .storage.from(MEDIA_BUCKET)
    .upload(path, blob, { contentType: blob.type, cacheControl: "31536000", upsert: false });
  if (error) {
    throw new UploadError("L'envoi de l'image a échoué. Vérifiez votre connexion et réessayez.");
  }
  return path;
}
