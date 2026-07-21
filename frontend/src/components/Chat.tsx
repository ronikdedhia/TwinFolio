"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { apiFetch } from "@/lib/api";

type ChatMessage = { role: "user" | "twin"; text: string };

export default function Chat() {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: "twin", text: "Hey — I'm your financial twin. Ask me a \"what if\" about your savings." },
  ]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function send() {
    const message = input.trim();
    if (!message || sending) return;

    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setInput("");
    setSending(true);
    setError(null);

    try {
      const data = await apiFetch<{ reply: string }>("/api/chat", getToken, {
        method: "POST",
        body: JSON.stringify({ message }),
      });
      setMessages((prev) => [...prev, { role: "twin", text: data.reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center gap-2 border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-sm dark:bg-emerald-900/40">
          🧑‍💻
        </span>
        <h2 className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">Your twin</h2>
      </div>

      <div ref={scrollRef} className="min-h-64 flex-1 space-y-3 overflow-y-auto p-4">
        {messages.map((m, i) => (
          <div key={i} className={`animate-fade-in-up ${m.role === "user" ? "text-right" : "text-left"}`}>
            <span
              className={`inline-block max-w-[85%] rounded-2xl px-4 py-2 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
              }`}
            >
              {m.text}
            </span>
          </div>
        ))}
        {sending && (
          <div className="flex items-center gap-1 pl-1 text-zinc-400">
            <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-current [animation-delay:0ms]" />
            <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-current [animation-delay:150ms]" />
            <span className="thinking-dot h-1.5 w-1.5 rounded-full bg-current [animation-delay:300ms]" />
          </div>
        )}
      </div>

      {error && <p className="px-4 pb-2 text-sm text-red-600">{error}</p>}

      <div className="flex gap-2 border-t border-zinc-200 p-3 dark:border-zinc-800">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="What if I save ₹500 more each month?"
          className="flex-1 rounded-md border border-zinc-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button
          onClick={send}
          disabled={sending}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
