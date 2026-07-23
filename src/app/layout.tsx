import "./globals.css";
import { TeamProvider } from "@/lib/team-context";

export const metadata = {
  title: "Acentura Action Plan",
  description: "Manage tasks and team progress",
};

/**
 * Root layout only provides global styles + TeamProvider context.
 * Header/Sidebar/Footer chrome moved to (app)/layout.tsx, which wraps
 * every route EXCEPT /login — so the login page renders with no nav at all.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F5F6F8] text-[#16233F]">
        <TeamProvider>{children}</TeamProvider>
      </body>
    </html>
  );
}
