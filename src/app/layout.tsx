import "./globals.css";
import { TeamProvider } from "@/lib/team-context";
import { SiteHeader } from "@/components/site-header";
import { TeamSidebar } from "@/components/team-sidebar";
import { SiteFooter } from "@/components/site-footer";

export const metadata = {
  title: "Team Management System",
  description: "Manage tasks and team progress",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F5F6F8] text-[#16233F]">
        <TeamProvider>
          <div className="flex min-h-screen flex-col">
            <SiteHeader />
            <div className="mx-auto flex w-full max-w-[1400px] flex-1">
              <TeamSidebar />
              <main className="flex-1 min-w-0">{children}</main>
            </div>
            <SiteFooter />
          </div>
        </TeamProvider>
      </body>
    </html>
  );
}
