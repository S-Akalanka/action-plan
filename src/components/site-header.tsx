"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

type Role = "TEAM" | "ADMIN" | "CEO";

const ALL_NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", roles: ["ADMIN", "CEO"] as Role[] },
  { href: "/my-plan", label: "My Action Plan", roles: ["TEAM", "ADMIN"] as Role[] },
  { href: "/manage-tasks", label: "Manage Tasks", roles: ["ADMIN", "CEO"] as Role[] },
];

export function SiteHeader({
  rightControl,
  transparent = false,
  showNav = true,
  showAccount = true,
}: {
  rightControl?: React.ReactNode;
  /** Floats over content with no background/border — for hero pages. */
  transparent?: boolean;
  /** Hide role-based nav links, e.g. on a public landing page. */
  showNav?: boolean;
  /** Hide the logout button and avatar, e.g. on a public landing page. */
  showAccount?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const { data: currentUser } = useQuery<{ role: Role }>({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const res = await fetch("/api/users/current");
      if (!res.ok) throw new Error("Not signed in");
      return res.json();
    },
    enabled: showNav || showAccount,
  });

  const role = currentUser?.role ?? null;

  const visibleLinks = showNav && role
    ? ALL_NAV_LINKS.filter((link) => link.roles.includes(role))
    : [];

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
    <header
      className={cn(
        "flex h-16 items-center justify-between px-6",
        transparent
          ? "absolute inset-x-0 top-0 z-30 border-b border-transparent bg-transparent"
          : "border-b border-[#E5E9F0] bg-white"
      )}
    >
      <div className="flex items-center gap-10">
        <Link
          href="/"
          className={cn(
            "text-xl font-bold tracking-tight",
            transparent ? "text-white" : "text-[#16233F]"
          )}
        >
          Acentura
        </Link>
        {visibleLinks.length > 0 && (
          <nav
            className={cn(
              "flex items-center gap-8 text-sm font-medium",
              transparent ? "text-white/80" : "text-[#5B6472]"
            )}
          >
            {visibleLinks.map((link) => {
              const active = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "border-b-2 border-transparent pb-5 pt-5 transition-colors",
                    active
                      ? transparent
                        ? "border-white text-white"
                        : "border-[#16233F] text-[#16233F]"
                      : transparent
                        ? "hover:text-white"
                        : "hover:text-[#16233F]"
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>

      <div className="flex items-center gap-6">
        {rightControl}
        {showAccount && (
          <>
            <button
              onClick={handleLogout}
              className={cn(
                "text-sm font-medium transition-colors",
                transparent ? "text-white/80 hover:text-white" : "text-[#5B6472] hover:text-[#16233F]"
              )}
            >
              Logout
            </button>
            <div className="h-9 w-9 overflow-hidden rounded-full bg-[#D9DEE6]">
              <img
                src="https://i.pravatar.cc/72?img=47"
                alt="User avatar"
                className="h-full w-full object-cover"
              />
            </div>
          </>
        )}
      </div>
    </header>
  );
}
