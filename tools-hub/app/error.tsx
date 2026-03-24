"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Next.js Server Action IDs change on every new deployment.
    // When the browser has cached the old JS bundle, it sends the old action ID
    // and the server can't find it → this error. The fix is a hard reload so
    // the browser fetches the latest bundle.
    if (error.message?.includes("Failed to find Server Action")) {
      window.location.reload();
      return;
    }

    console.error(error);
  }, [error]);

  if (error.message?.includes("Failed to find Server Action")) {
    return null; // Will reload before rendering anything
  }

  return (
    <html>
      <body className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-xl font-semibold">Algo salió mal</h2>
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <button
            onClick={reset}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90"
          >
            Intentar de nuevo
          </button>
        </div>
      </body>
    </html>
  );
}
