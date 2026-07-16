/**
 * Layout for /executive-summary and /executive-summary/[teamId].
 * The sidebar is provided by the root layout (AppSidebar), which switches to
 * URL-based navigation automatically when pathname starts with /executive-summary.
 * This layout simply passes children through unchanged.
 */
export default function ExecutiveSummaryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
