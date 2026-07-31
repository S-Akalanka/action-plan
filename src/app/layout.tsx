import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "Acentura Action Plan",
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
