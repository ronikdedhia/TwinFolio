"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { apiFetch, ApiError } from "@/lib/api";

type Nudge = { type: string; message: string; basis: string };

export default function Nudges() {
  const { getToken } = useAuth();
  const [nudges, setNudges] = useState<Nudge[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch<{ nudges: Nudge[] }>("/api/nudges", getToken);
        setNudges(data.nudges);
      } catch (e) {
        // 404 just means no profile yet — nothing to notice. Anything else, fail quietly;
        // nudges are a bonus, not core to the page working.
        if (!(e instanceof ApiError && e.status === 404)) {
          console.error("Failed to load nudges", e);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (nudges.length === 0) return null;

  return (
    <div className="mb-6 space-y-2">
      {nudges.map((n, i) => (
        <div
          key={i}
          className="animate-fade-in-up rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 shadow-sm dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100"
        >
          <span className="mr-2">🌱</span>
          {n.message}
        </div>
      ))}
    </div>
  );
}
