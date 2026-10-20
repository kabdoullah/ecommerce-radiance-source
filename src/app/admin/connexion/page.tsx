import type { Metadata } from "next";
import { LogoMark } from "@/components/brand/logo";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = { title: "Connexion" };

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <LogoMark className="size-10 text-cocoa" />
        <h1 className="mt-6 font-display text-3xl">Administration de la boutique</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Connectez-vous avec le compte administrateur qui vous a été attribué.
        </p>
        <div className="mt-8 rounded-card bg-surface p-6 shadow-sm">
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
