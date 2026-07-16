"use client";


import { SUMMARY_CARDS, UNITS, TEAMS } from "@/lib/mock-data";


export default function DashboardHome() {

  return (
    <main className="flex-1 px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Overview Dashboard</h1>
        <p className="mt-1 text-sm text-[#5B6472]">
          Company-wide performance at a glance
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="mb-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {SUMMARY_CARDS.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.id}
              className="rounded-xl border border-[#E5E9F0] bg-white p-6 shadow-sm transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-[#5B6472]">{card.label}</span>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F5F6F8]">
                  <Icon className="h-5 w-5 text-[#16233F]" />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight">{card.percent}%</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Business Units Table/Grid */}
      <div className="rounded-xl border border-[#E5E9F0] bg-white p-6 shadow-sm">
        <h3 className="text-base font-semibold mb-6">Business Unit Health Index</h3>
        <div className="grid gap-4">
          {UNITS.map((unit) => {
            const teamInfo = TEAMS.find((t) => t.id === unit.id) || { label: unit.code };
            return (
              <div
                key={unit.id}
                className="flex flex-col gap-4 rounded-lg border border-[#E5E9F0] p-4 transition-all hover:bg-[#F5F6F8] sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h4 className="font-semibold text-[#16233F]">{teamInfo.label}</h4>
                  <p className="text-xs text-[#9AA3B2]">Overall Index Score</p>
                </div>
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex gap-4">
                    {unit.metrics.map((metric, i) => (
                      <div key={i} className="text-center">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-[#9AA3B2]">
                          {metric.label}
                        </span>
                        <span className={`text-sm font-semibold ${
                          metric.severity === "critical" ? "text-red-600" : metric.severity === "low" ? "text-amber-600" : "text-[#16233F]"
                        }`}>
                          {metric.percent}%
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="h-8 w-px bg-[#E5E9F0] hidden sm:block" />
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-[#E5E9F0] rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          unit.overall >= 80
                            ? "bg-green-600"
                            : unit.overall >= 60
                            ? "bg-amber-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${unit.overall}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold w-8 text-right">{unit.overall}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
