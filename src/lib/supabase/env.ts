// Les variables NEXT_PUBLIC_* doivent être lues littéralement pour être injectées au build.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export function getSupabaseEnv() {
  if (!url || !publishableKey) {
    throw new Error(
      "Configuration Supabase manquante : définissez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (voir .env.example).",
    );
  }
  return { url, publishableKey };
}
