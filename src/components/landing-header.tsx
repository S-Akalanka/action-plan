import Link from "next/link";

export function LandingHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-30 flex h-16 items-center justify-between px-6">
      <Link href="/" className="text-xl font-bold tracking-tight text-white">
        Acentura
      </Link>
      <Link
        href="/login"
        className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-[#16233F] transition-colors hover:bg-white/90"
      >
        Sign in
      </Link>
    </header>
  );
}
