"use client";

import { useEffect, useState } from "react";
import { useAuth, SignIn, Show } from "@clerk/nextjs";
import { apiFetch, ApiError } from "@/lib/api";
import Nav from "@/components/Nav";

type Customer = {
  profile: {
    userId: string;
    currentSavings: number;
    monthlyContribution: number;
    years: number;
    goalAmount: number;
  };
  latestRisk: { riskTolerance: string; reasoning: string } | null;
  latestNudge: { type: string; message: string } | null;
};

function formatRupees(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export default function StaffPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Show when="signed-out">
        <div className="flex min-h-screen items-center justify-center">
          <SignIn routing="hash" />
        </div>
      </Show>
      <Show when="signed-in">
        <StaffDashboard />
      </Show>
    </div>
  );
}

function StaffDashboard() {
  const { getToken } = useAuth();
  const [customers, setCustomers] = useState<Customer[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch<{ customers: Customer[] }>("/api/admin/customers", getToken);
        setCustomers(data.customers);
      } catch (e) {
        if (e instanceof ApiError && e.status === 403) {
          setForbidden(true);
        } else {
          setError(e instanceof Error ? e.message : "Failed to load customers");
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Nav active="staff" />
      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50 sm:text-3xl">
          Staff view
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Every customer&apos;s twin, at a glance — plan, risk read, and latest nudge.
        </p>

        {!customers && !forbidden && !error && (
          <p className="mt-8 text-sm text-zinc-500">Loading customers…</p>
        )}

        {forbidden && (
          <p className="mt-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            You don&apos;t have staff access. Ask an admin to add your user ID to ADMIN_USER_IDS.
          </p>
        )}
        {error && <p className="mt-8 text-sm text-red-600">{error}</p>}

        {customers && customers.length === 0 && (
          <p className="mt-8 text-zinc-500">No customer profiles yet.</p>
        )}

        {customers && customers.length > 0 && (
          <div className="mt-8 overflow-x-auto rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <table className="w-full text-left text-sm">
              <thead className="bg-zinc-50 text-zinc-600 dark:bg-zinc-950 dark:text-zinc-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Savings</th>
                  <th className="px-4 py-3 font-medium">Monthly</th>
                  <th className="px-4 py-3 font-medium">Years</th>
                  <th className="px-4 py-3 font-medium">Goal</th>
                  <th className="px-4 py-3 font-medium">Risk</th>
                  <th className="px-4 py-3 font-medium">Latest nudge</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr
                    key={c.profile.userId}
                    className="border-t border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800/50"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-zinc-500">{c.profile.userId}</td>
                    <td className="px-4 py-3">{formatRupees(c.profile.currentSavings)}</td>
                    <td className="px-4 py-3">{formatRupees(c.profile.monthlyContribution)}</td>
                    <td className="px-4 py-3">{c.profile.years}</td>
                    <td className="px-4 py-3">{formatRupees(c.profile.goalAmount)}</td>
                    <td className="px-4 py-3">
                      {c.latestRisk ? (
                        <span className="capitalize">{c.latestRisk.riskTolerance}</span>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="max-w-xs px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {c.latestNudge ? c.latestNudge.message : <span className="text-zinc-400">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </>
  );
}
