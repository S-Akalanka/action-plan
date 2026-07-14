import "./globals.css";

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
      <body>{children}</body>
    </html>
  );
}
