"use client";

import Link from "next/link";
import { UserButton } from "@clerk/nextjs";

export default function Nav({ active }: { active: "dashboard" | "staff" }) {
  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-sm font-semibold text-white shadow-sm">
              T
            </span>
            <span className="text-base font-semibold tracking-tight text-black dark:text-zinc-50">
              Twinfolio
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/"
              className={
                active === "dashboard"
                  ? "font-medium text-emerald-700 dark:text-emerald-400"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }
            >
              Dashboard
            </Link>
            <Link
              href="/staff"
              className={
                active === "staff"
                  ? "font-medium text-emerald-700 dark:text-emerald-400"
                  : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
              }
            >
              Staff view
            </Link>
          </nav>
        </div>
        <UserButton />
      </div>
    </header>
  );
}
