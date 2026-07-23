"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

type Role = "TEAM" | "ADMIN" | "CEO";

const ALL_NAV_LINKS = [
  { href: "/dashboard", label: "Dashboard", roles: ["ADMIN", "CEO"] as Role[] },
  { href: "/my-plan", label: "My Action Plan", roles: ["TEAM", "ADMIN", "CEO"] as Role[] },
  { href: "/manage-tasks", label: "Manage Tasks", roles: ["ADMIN", "CEO"] as Role[] },
];

export function SiteHeader({
  rightControl,
}: {
  rightControl?: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    fetch("/api/users/current")
      .then((res) => {
        if (!res.ok) throw new Error("Not signed in");
        return res.json();
      })
      .then((user) => setRole(user.role))
      .catch(() => setRole(null));
  }, []);

  const visibleLinks = role
    ? ALL_NAV_LINKS.filter((link) => link.roles.includes(role))
    : [];

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-[#E5E9F0] bg-white px-6">
      <div className="flex items-center gap-10">
        <Link href="/" className="text-xl font-bold tracking-tight text-[#16233F]">
          Acentura
        </Link>
        <nav className="flex items-center gap-8 text-sm font-medium text-[#5B6472]">
          {visibleLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "border-b-2 border-transparent pb-5 pt-5 transition-colors",
                  active ? "border-[#16233F] text-[#16233F]" : "hover:text-[#16233F]"
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
        <button
          onClick={handleLogout}
          className="text-sm font-medium text-[#5B6472] hover:text-[#16233F]"
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
      </div>
    </header>
  );
}
