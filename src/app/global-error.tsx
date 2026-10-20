"use client";

// Dernier recours si la mise en page racine elle-même échoue (ex. paramètres illisibles).
export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="fr">
      <body style={{ fontFamily: "system-ui, sans-serif", background: "#fff8f5", color: "#2f1a21" }}>
        <main style={{ maxWidth: 480, margin: "15vh auto", padding: 16, textAlign: "center" }}>
          <h1>Service momentanément indisponible</h1>
          <p>La boutique n&apos;a pas pu être chargée. Réessayez dans quelques instants.</p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 16,
              padding: "10px 20px",
              borderRadius: 999,
              border: 0,
              background: "#c2185b",
              color: "#fff",
            }}
          >
            Réessayer
          </button>
        </main>
      </body>
    </html>
  );
}
