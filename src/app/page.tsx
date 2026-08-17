"use client";

import Link from "next/link";
import { BarChart3, ListChecks, ShieldCheck, ArrowRight } from "lucide-react";
import { LandingHeader } from "@/components/landing-header";
import { SiteFooter } from "@/components/site-footer";

const FEATURES = [
  {
    icon: BarChart3,
    title: "Executive Rollup",
    description:
      "Aggregate cross-departmental progress into a single, high-fidelity strategic canvas. Monitor organizational health at a glance.",
  },
  {
    icon: ListChecks,
    title: "Team Action Plans",
    description:
      "Translate high-level strategy into structured weekly action plans. Maintain clear alignment from the C-suite to the frontline.",
  },
  {
    icon: ShieldCheck,
    title: "Standard Task Management",
    description:
      "Reliable, precise task tracking without the clutter. Ensure accountability and execution velocity with minimal overhead.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <LandingHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative flex min-h-screen items-center overflow-hidden bg-[#0B1424] px-6 py-32">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1591000113933-6bfb60a23b69?q=80&w=2072&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0B1424]/70 via-[#0B1424]/60 to-[#0B1424]/90" />
          <div className="relative mx-auto flex w-full max-w-[820px] flex-col items-center text-center">
            <span className="mb-6 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-wide text-white/90">
              Acentura Strategy Platform
            </span>

            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-6xl">
              Executive Strategy,{" "}
              <span className="text-[#8FA8D9]">Executed.</span>
            </h1>

            <p className="mt-6 max-w-[560px] text-base leading-relaxed text-white/70 sm:text-lg">
              The lightweight platform for high-performance teams to track
              weekly action plans and executive results. Clarity, authority, and
              precision in every initiative.
            </p>

            <Link
              href="/login"
              className="mt-10 inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-semibold text-[#16233F] transition-colors hover:bg-white/90"
            >
              <MicrosoftIcon />
              Sign in with Microsoft
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Feature grid */}
        <section className="bg-[#F7F8FA] px-6 py-20 sm:py-24">
          <div className="mx-auto max-w-[1200px]">
            <div className="max-w-[560px]">
              <h2 className="text-2xl font-bold tracking-tight text-[#16233F] sm:text-3xl">
                Strategic Execution Arsenal
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[#5B6472] sm:text-base">
                High-density information presented with low-cognitive friction.
                Built for C-suite alignment and team accountability.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-xl border border-[#E5E9F0] bg-white p-6"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EEF1F6] text-[#16233F]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 text-base font-semibold text-[#16233F]">
                    {title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#5B6472]">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-[#E5E9F0] bg-white px-6 py-20 sm:py-24">
          <div className="mx-auto flex max-w-[720px] flex-col items-center text-center">
            <h2 className="text-2xl font-bold tracking-tight text-[#16233F] sm:text-3xl">
              Ready to align your organization?
            </h2>
            <p className="mt-3 text-sm text-[#5B6472] sm:text-base">
              Deploy Acentura today and transform strategic intent into measured
              execution.
            </p>
            <Link
              href="/login"
              className="mt-8 inline-flex items-center gap-2 rounded-md bg-[#16233F] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#1E2E52]"
            >
              <MicrosoftIcon light />
              Sign in to get started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function MicrosoftIcon({ light }: { light?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect
        x="1"
        y="1"
        width="6.5"
        height="6.5"
        fill={light ? "#7EA6FF" : "#F25022"}
      />
      <rect
        x="8.5"
        y="1"
        width="6.5"
        height="6.5"
        fill={light ? "#7EA6FF" : "#7FBA00"}
      />
      <rect
        x="1"
        y="8.5"
        width="6.5"
        height="6.5"
        fill={light ? "#7EA6FF" : "#00A4EF"}
      />
      <rect
        x="8.5"
        y="8.5"
        width="6.5"
        height="6.5"
        fill={light ? "#7EA6FF" : "#FFB900"}
      />
    </svg>
  );
}
