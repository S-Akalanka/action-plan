import { SiteHeader } from "@/components/site-header";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteFooter } from "@/components/site-footer";

/**
 * This layout applies to every route INSIDE the (app) route group —
 * i.e. everything except /login, which sits outside this group and
 * therefore gets no header/sidebar at all.
 *
 * To use this: move my-plan/, dashboard/, manage-tasks/ folders into
 * app/(app)/my-plan/, app/(app)/dashboard/, app/(app)/manage-tasks/.
 * The (app) folder name with parens doesn't appear in the URL — routes
 * stay at /my-plan, /dashboard, /manage-tasks exactly as before.
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-[1400px] flex-1">
        <AppSidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
      <SiteFooter />
    </div>
  );
}
