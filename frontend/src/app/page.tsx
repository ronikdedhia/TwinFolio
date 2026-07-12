"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

type ProjectionPoint = { year: number; p10: number; median: number; p90: number };

type SimulateResponse = {
  projection: ProjectionPoint[];
  finalBalance: { p10: number; median: number; p90: number };
  probabilityOfReachingGoal?: number;
};

function formatLakhs(value: number) {
  return `₹${(value / 100000).toFixed(1)}L`;
}

export default function Home() {
  const [currentSavings, setCurrentSavings] = useState(100000);
  const [monthlyContribution, setMonthlyContribution] = useState(5000);
  const [years, setYears] = useState(10);
  const [goalAmount, setGoalAmount] = useState(1500000);
  const [result, setResult] = useState<SimulateResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runSimulation() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentSavings,
          monthlyContribution,
          years,
          goalAmount,
          annualReturnMean: 0.1,
          annualReturnStdDev: 0.15,
          simulations: 2000,
        }),
      });
      if (!res.ok) {
        const body = await res.json();
        throw new Error(body.error || "Simulation failed");
      }
      const data: SimulateResponse = await res.json();
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <main className="mx-auto w-full max-w-2xl px-6 py-16">
        <h1 className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Twinfolio — Goal Dashboard
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Ask your twin a &quot;what if&quot; — see your projected future.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
            Current savings (₹)
            <input
              type="number"
              value={currentSavings}
              onChange={(e) => setCurrentSavings(Number(e.target.value))}
              className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
            Monthly contribution (₹)
            <input
              type="number"
              value={monthlyContribution}
              onChange={(e) => setMonthlyContribution(Number(e.target.value))}
              className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
            Years
            <input
              type="number"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
            Goal amount (₹)
            <input
              type="number"
              value={goalAmount}
              onChange={(e) => setGoalAmount(Number(e.target.value))}
              className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
        </div>

        <button
          onClick={runSimulation}
          disabled={loading}
          className="mt-6 rounded-full bg-emerald-600 px-6 py-2.5 font-medium text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? "Simulating..." : "What if?"}
        </button>

        {error && <p className="mt-4 text-red-600">{error}</p>}

        {result && (
          <div className="mt-10">
            <p className="text-zinc-700 dark:text-zinc-300">
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
          </div>
        )}
      </main>
    </div>
  );
}
