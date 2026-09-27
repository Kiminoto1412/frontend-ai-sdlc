"use client";

import { useState } from "react";
import { Mail, Lock } from "lucide-react";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("farmart_token", data.token);
      setStatus("success");
      setMessage("Welcome! Your 15% discount has been applied.");
    } else {
      setStatus("error");
      setMessage(data.message ?? "Registration failed. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div className="mt-5 rounded-md bg-white p-4 text-center text-sm font-medium text-green-700">
        {message}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
      <label className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2">
        <Mail size={16} className="shrink-0 text-zinc-400" />
        <input
          type="email"
          placeholder="yourdomain@gmail.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full text-sm outline-none placeholder:text-zinc-400"
          required
        />
      </label>
      <label className="flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2">
        <Lock size={16} className="shrink-0 text-zinc-400" />
        <input
          type="password"
          placeholder="Password (min. 8 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full text-sm outline-none placeholder:text-zinc-400"
          required
          minLength={8}
        />
      </label>
      {status === "error" && (
        <p className="text-xs text-red-600">{message}</p>
      )}
      <button
        type="submit"
        disabled={status === "loading"}
        className="mt-2 rounded-md bg-brand py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-brand-dark disabled:opacity-50"
      >
        {status === "loading" ? "Registering..." : "Register Now"}
      </button>
    </form>
  );
}
