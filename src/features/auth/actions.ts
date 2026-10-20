"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSessionClient } from "@/lib/supabase/server";

export type LoginState = { error: string | null };

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1).max(200),
});

export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: "Saisissez une adresse e-mail valide et votre mot de passe." };
  }

  const supabase = await createSessionClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    if (error.status === 429) {
      return { error: "Trop de tentatives. Patientez quelques minutes avant de réessayer." };
    }
    if (error.status === 400 || error.status === 401 || error.code === "invalid_credentials") {
      return { error: "E-mail ou mot de passe incorrect." };
    }
    return { error: "Connexion impossible pour le moment. Réessayez dans quelques instants." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("admin_profiles")
    .select("id")
    .eq("id", data.user.id)
    .maybeSingle();

  if (profileError) {
    // Table absente (migrations non appliquées) ou base injoignable : ne pas confondre
    // avec un compte sans droits.
    console.error("admin_profiles lookup failed", profileError.code, profileError.message);
    await supabase.auth.signOut();
    return {
      error:
        "Impossible de vérifier les droits administrateur : la base de données n'est pas prête (migrations à appliquer) ou ne répond pas.",
    };
  }

  if (!profile) {
    await supabase.auth.signOut();
    return { error: "Ce compte n'a pas accès à l'administration de la boutique." };
  }

  redirect("/admin");
}

export async function logout() {
  const supabase = await createSessionClient();
  await supabase.auth.signOut();
  redirect("/admin/connexion");
}
