export function getCurrentWeekStart(): Date {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // back to Monday
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

export function isTaskDueForWeek(frequency: string, weekStart: Date): boolean {
  if (frequency === "WEEKLY" || frequency === "BI_WEEKLY") return true;

  const dayOfMonth = weekStart.getDate();
  const isFirstWeekOfMonth = dayOfMonth <= 7;

  if (frequency === "MONTHLY") return isFirstWeekOfMonth;

  if (frequency === "QUARTERLY") {
    const month = weekStart.getMonth(); // 0-indexed
    const isQuarterStartMonth = month % 3 === 0; // Jan, Apr, Jul, Oct
    return isQuarterStartMonth && isFirstWeekOfMonth;
  }

  return false;
}
