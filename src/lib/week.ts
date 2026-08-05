export function getCurrentWeekStart(): Date {
  const now = new Date();
  const day = now.getDay(); // 0 = Sunday
  const diff = now.getDate() - day + (day === 0 ? -6 : 1); // back to Monday
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

// Now requires deadline — every Task has one (required field). A task is
// never due for a week that starts after its deadline has passed,
// regardless of frequency. This applies to ONCE tasks too: if the
// deadline has already passed and no instance was ever completed, no
// new instance gets created — it's simply overdue, not regenerated forever.
export function isTaskDueForWeek(
  frequency: string,
  weekStart: Date,
  deadline: Date
): boolean {
  // Deadline check first — nothing is due once its deadline has passed,
  // no matter what frequency says.
  if (weekStart > deadline) return false;

  if (frequency === "ONCE") {
    // ONCE tasks are due exactly once. The caller is responsible for
    // checking whether an instance already exists before calling this —
    // this function only confirms the deadline hasn't passed.
    return true;
  }

  if (frequency === "WEEKLY" || frequency === "BI_WEEKLY") return true;

  const dayOfMonth = weekStart.getDate();
  const isFirstWeekOfMonth = dayOfMonth <= 7;

  if (frequency === "MONTHLY") return isFirstWeekOfMonth;

  if (frequency === "QUARTERLY") {
    const month = weekStart.getMonth();
    const isQuarterStartMonth = month % 3 === 0;
    return isQuarterStartMonth && isFirstWeekOfMonth;
  }

  return false;
}
