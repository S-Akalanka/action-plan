"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const DEMO_ACCOUNTS = [
  { label: "CEO", username: "seed-ceo-office" },
  { label: "HR Manager (Admin)", username: "seed-hr-manager" },
  { label: "Engineering Lead — in Engineering + BU01", username: "seed-engineering-lead" },
  { label: "BU01 Lead — in BU02", username: "seed-bu01-lead" },
];

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignIn = async (usernameToUse: string) => {
    setLoading(true);
    setError("");

    const result = await signIn("credentials", {
      username: usernameToUse,
      redirect: false,
    });

    if (result?.error) {
      setLoading(false);
      setError("Sign in failed. Try again.");
      return;
    }

    try {
      const res = await fetch("/api/users/current");
      if (res.ok) {
        const user = await res.json();
        if (user.role === "CEO") {
          router.push("/dashboard");
        } else {
          router.push("/my-plan");
        }
      } else {
        router.push("/my-plan");
      }
    } catch {
      router.push("/my-plan");
    }

    setLoading(false);
    router.refresh();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F5F6F8] px-4">
      <div className="w-full max-w-md rounded-xl border border-[#E5E9F0] bg-white p-8 shadow-sm">
        <h1 className="text-center text-2xl font-bold text-[#16233F]">Acentura</h1>
        <p className="mt-1 text-center text-sm text-[#5B6472]">
          Sign in with your account
        </p>

        <div className="mt-6">
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#9AA3B2]">
            Username
          </label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. seed-engineering-lead"
            className="w-full rounded-lg border border-[#E5E9F0] px-3 py-2.5 text-sm outline-none focus:border-[#16233F]"
          />
        </div>

        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

        <button
          onClick={() => handleSignIn(username)}
          disabled={loading || !username.trim()}
          className="mt-4 w-full rounded-lg bg-[#16233F] py-2.5 text-sm font-medium text-white hover:bg-[#0F1A30] disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Sign In"}
        </button>

        <div className="my-6 border-t border-[#E5E9F0]" />

        <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wider text-[#9AA3B2]">
          Quick Demo Accounts
        </p>
        <div className="space-y-2">
          {DEMO_ACCOUNTS.map((acct) => (
            <button
              key={acct.username}
              onClick={() => handleSignIn(acct.username)}
              disabled={loading}
              className="w-full rounded-lg border border-[#E5E9F0] px-3 py-2 text-sm font-medium text-[#16233F] hover:bg-[#F5F6F8] disabled:opacity-50"
            >
              {acct.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
