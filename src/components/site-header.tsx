"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/my-plan", label: "Action Plans" },
  { href: "/executive-summary", label: "Reports" },
  { href: "/directory", label: "Directory" },
];

export function SiteHeader({
  rightControl,
}: {
  rightControl?: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <header className="flex h-16 items-center justify-between border-b border-[#E5E9F0] bg-white px-6">
      <div className="flex items-center gap-10">
        <Link href="/" className="text-xl font-bold tracking-tight text-[#16233F]">
          Acentura
        </Link>
        <nav className="flex items-center gap-8 text-sm font-medium text-[#5B6472]">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "border-b-2 border-transparent pb-5 pt-5 transition-colors",
                  active
                    ? "border-[#16233F] text-[#16233F]"
                    : "hover:text-[#16233F]"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-6">
        {rightControl}
        <button className="text-sm font-medium text-[#5B6472] hover:text-[#16233F]">
          Logout
        </button>
        <div className="h-9 w-9 overflow-hidden rounded-full bg-[#D9DEE6]">
          <img
            src="https://i.pravatar.cc/72?img=47"
            alt="User avatar"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </header>
  );
}
