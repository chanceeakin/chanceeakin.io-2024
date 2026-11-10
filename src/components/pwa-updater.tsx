"use client";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

const CHECK_EVERY_MS = 60 * 60 * 1000;

// Registers the service worker and, when a new build is waiting, offers a
// refresh. Nothing reloads until the user agrees.
export default function PwaUpdater() {
  const t = useTranslations("Pwa");
  const [waiting, setWaiting] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;

    let interval: ReturnType<typeof setInterval> | undefined;
    let reloading = false;

    const onControllerChange = () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    };

    const track = (reg: ServiceWorkerRegistration) => {
      // A waiting worker only counts as an update if a page is already controlled.
      if (reg.waiting && navigator.serviceWorker.controller) setWaiting(reg.waiting);
      reg.addEventListener("updatefound", () => {
        const sw = reg.installing;
        sw?.addEventListener("statechange", () => {
          if (sw.state === "installed" && navigator.serviceWorker.controller) setWaiting(sw);
        });
      });
    };

    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    navigator.serviceWorker
      .register("/sw.js", { scope: "/", updateViaCache: "none" })
      .then((reg) => {
        track(reg);
        const check = () => reg.update().catch(() => {});
        interval = setInterval(check, CHECK_EVERY_MS);
        document.addEventListener("visibilitychange", () => {
          if (document.visibilityState === "visible") check();
        });
      })
      .catch(() => {});

    return () => {
      clearInterval(interval);
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  if (!waiting) return null;

  return (
    <div
      role="status"
      className="fixed bottom-20 left-4 right-4 z-50 mx-auto flex max-w-md items-center justify-between gap-4 rounded-2xl border border-line-strong bg-paper p-4 shadow-xl sm:bottom-6 sm:left-auto sm:right-6 sm:mx-0"
    >
      <span className="text-sm">{t("updateAvailable")}</span>
      <span className="flex shrink-0 gap-2">
        <button
          type="button"
          onClick={() => setWaiting(null)}
          className="rounded-full px-3 py-1.5 text-sm text-muted hover:text-ink"
        >
          {t("later")}
        </button>
        <button
          type="button"
          onClick={() => waiting.postMessage({ type: "SKIP_WAITING" })}
          className="on-fill rounded-full bg-mustard px-4 py-1.5 text-sm font-medium text-on-mustard"
        >
          {t("refresh")}
        </button>
      </span>
    </div>
  );
}
