"use client";

import { useEffect, useState } from "react";
import { useAuth, useUser, SignIn, Show } from "@clerk/nextjs";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { apiFetch, ApiError } from "@/lib/api";
import Chat from "@/components/Chat";
import Nudges from "@/components/Nudges";
import Nav from "@/components/Nav";

type ProjectionPoint = { year: number; p10: number; median: number; p90: number };

type SimulateResponse = {
  projection: ProjectionPoint[];
  finalBalance: { p10: number; median: number; p90: number };
  probabilityOfReachingGoal?: number;
};

type Profile = {
  currentSavings: number;
  monthlyContribution: number;
  years: number;
  goalAmount: number;
};

const DEFAULT_PROFILE: Profile = {
  currentSavings: 100000,
  monthlyContribution: 5000,
  years: 10,
  goalAmount: 1500000,
};

function formatLakhs(value: number) {
  return `₹${(value / 100000).toFixed(1)}L`;
}

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <Show when="signed-out">
        <div className="flex min-h-screen items-center justify-center">
          <SignIn routing="hash" />
        </div>
      </Show>
      <Show when="signed-in">
        <Dashboard />
      </Show>
    </div>
  );
}

function Dashboard() {
  const { getToken } = useAuth();
  const { user } = useUser();

  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [result, setResult] = useState<SimulateResponse | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [simError, setSimError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await apiFetch<Profile>("/api/profile", getToken);
        setProfile(data);
      } catch (e) {
        if (!(e instanceof ApiError && e.status === 404)) {
          setProfileError(e instanceof Error ? e.message : "Failed to load profile");
        }
        // 404 just means no profile yet — DEFAULT_PROFILE stays as the starting point.
      } finally {
        setProfileLoaded(true);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveProfile() {
    setSavingProfile(true);
    setProfileError(null);
    try {
      const saved = await apiFetch<Profile>("/api/profile", getToken, {
        method: "PUT",
        body: JSON.stringify(profile),
      });
      setProfile(saved);
    } catch (e) {
      setProfileError(e instanceof Error ? e.message : "Failed to save profile");
    } finally {
      setSavingProfile(false);
    }
  }

  async function runSimulation() {
    setSimulating(true);
    setSimError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000"}/api/simulate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...profile,
            annualReturnMean: 0.1,
            annualReturnStdDev: 0.15,
            simulations: 2000,
          }),
        }
      );
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Simulation failed");
      }
      const data: SimulateResponse = await res.json();
      setResult(data);
    } catch (e) {
      setSimError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSimulating(false);
    }
  }

  return (
    <>
      <Nav active="dashboard" />
      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50 sm:text-3xl">
            {user?.firstName ? `Hey ${user.firstName} — ` : "Hey — "}
            here&apos;s your future.
          </h1>
          <p className="mt-2 max-w-xl text-zinc-600 dark:text-zinc-400">
            Ask your twin a &quot;what if&quot; and watch your goal move — every number below is grounded in your own plan.
          </p>
        </div>

        {profileLoaded && <Nudges />}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <section className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Your plan</h2>
              {!profileLoaded && (
                <p className="mt-3 text-sm text-zinc-500">Loading your profile…</p>
              )}

              <div className={`mt-4 grid grid-cols-2 gap-4 ${!profileLoaded ? "opacity-40" : ""}`}>
                <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
                  Current savings (₹)
                  <input
                    type="number"
                    value={profile.currentSavings}
                    onChange={(e) => setProfile((p) => ({ ...p, currentSavings: Number(e.target.value) }))}
                    className="rounded-md border border-zinc-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
                  Monthly contribution (₹)
                  <input
                    type="number"
                    value={profile.monthlyContribution}
                    onChange={(e) =>
                      setProfile((p) => ({ ...p, monthlyContribution: Number(e.target.value) }))
                    }
                    className="rounded-md border border-zinc-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
                  Years
                  <input
                    type="number"
                    value={profile.years}
                    onChange={(e) => setProfile((p) => ({ ...p, years: Number(e.target.value) }))}
                    className="rounded-md border border-zinc-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </label>
                <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
                  Goal amount (₹)
                  <input
                    type="number"
                    value={profile.goalAmount}
                    onChange={(e) => setProfile((p) => ({ ...p, goalAmount: Number(e.target.value) }))}
                    className="rounded-md border border-zinc-300 px-3 py-2 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </label>
              </div>

              {profileError && <p className="mt-4 text-sm text-red-600">{profileError}</p>}

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={runSimulation}
                  disabled={simulating || !profileLoaded}
                  className="rounded-full bg-emerald-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-50"
                >
                  {simulating ? "Simulating..." : "What if?"}
                </button>
                <button
                  onClick={saveProfile}
                  disabled={savingProfile || !profileLoaded}
                  className="rounded-full border border-zinc-300 px-6 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
                >
                  {savingProfile ? "Saving..." : "Save profile"}
                </button>
              </div>
              <p className="mt-2 text-xs text-zinc-500">
                Save your profile so your twin uses these same numbers when you chat with it.
              </p>
            </section>

            {simError && <p className="text-sm text-red-600">{simError}</p>}

            {result && (
              <section className="animate-fade-in-up rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
                <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Projection</h2>
                <p className="mt-2 text-zinc-700 dark:text-zinc-300">
                  Probability of reaching your goal:{" "}
                  <strong className="text-emerald-700 dark:text-emerald-400">
                    {Math.round((result.probabilityOfReachingGoal ?? 0) * 100)}%
                  </strong>
                </p>
                <div className="mt-4 h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={result.projection}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" label={{ value: "Year", position: "insideBottom", offset: -5 }} />
                      <YAxis tickFormatter={formatLakhs} width={70} />
                      <Tooltip formatter={(v) => `₹${Math.round(Number(v)).toLocaleString("en-IN")}`} />
                      <Area type="monotone" dataKey="p90" stroke="#7fd1a8" fill="#7fd1a8" fillOpacity={0.15} />
                      <Area type="monotone" dataKey="median" stroke="#3fae78" fill="#3fae78" fillOpacity={0.35} />
                      <Area type="monotone" dataKey="p10" stroke="#0b1220" fill="#ffffff" fillOpacity={0} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </section>
            )}
          </div>

          <div className="lg:sticky lg:top-6 lg:h-[calc(100vh-3rem)]">
            <Chat />
          </div>
        </div>
      </main>
    </>
  );
}
