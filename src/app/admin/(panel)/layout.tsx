import { LogOut } from "lucide-react";
import { Suspense, type ReactNode } from "react";
import { AdminNav, AdminNavLinks } from "@/components/admin/admin-nav";
import { logout } from "@/features/auth/actions";
import { requireAdmin } from "@/features/auth/session";

// Données privées lues à chaque requête : la navigation dans l'admin attend le serveur.
export const instant = false;

export default function AdminPanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="flex-1 lg:grid lg:grid-cols-[15rem_1fr]">
      <Suspense fallback={<AdminNavLinks pathname={null} />}>
        <AdminNav />
      </Suspense>
      <div className="min-w-0">
        <Suspense fallback={<PanelSkeleton />}>
          <AdminGate>{children}</AdminGate>
        </Suspense>
      </div>
    </div>
  );
}

/** Vérifie la session et les droits administrateur avant d'afficher la page. */
async function AdminGate({ children }: { children: ReactNode }) {
  const { user } = await requireAdmin();
  return (
    <>
      <div className="flex items-center justify-end gap-3 border-b border-line px-4 py-3 text-sm sm:px-8">
        <span className="truncate text-ink-soft">{user.displayName}</span>
        <form action={logout}>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-medium hover:bg-mist"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Se déconnecter
          </button>
        </form>
      </div>
      <main className="px-4 py-8 sm:px-8">{children}</main>
    </>
  );
}

function PanelSkeleton() {
  return (
    <div className="space-y-4 px-4 py-14 sm:px-8" aria-busy="true" aria-label="Chargement">
      <div className="h-10 w-64 rounded bg-mist" />
      <div className="h-48 rounded-card bg-mist" />
    </div>
  );
}
