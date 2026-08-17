// All week-start dates are built as UTC midnight directly (Date.UTC),
// never via new Date() + setHours(0,0,0,0). The latter builds a
// LOCAL-midnight Date; when that gets written to a Prisma @db.Date column
// it serializes through UTC, and depending on exactly when the code runs
// relative to the local/UTC offset boundary, the same "today" can come out
// as different calendar days on different writes. Building the Date at
// UTC midnight from the start removes that ambiguity everywhere.

function toUtcMidnight(y: number, m: number, d: number): Date {
  return new Date(Date.UTC(y, m, d));
}

export function getCurrentWeekStart(): Date {
  const now = new Date();
  const currentDay = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
  const day = currentDay.getUTCDay();
  const diff = currentDay.getUTCDate() - day + (day === 0 ? -6 : 1);
  return toUtcMidnight(currentDay.getUTCFullYear(), currentDay.getUTCMonth(), diff);
}

function mondayOf(date: Date): Date {
  const currentDay = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = currentDay.getUTCDay();
  const diff = currentDay.getUTCDate() - day + (day === 0 ? -6 : 1);
  return toUtcMidnight(currentDay.getUTCFullYear(), currentDay.getUTCMonth(), diff);
}

export function isTaskDueForWeek(
  frequency: string,
  weekStart: Date,
  deadline: Date,
  createdAt: Date
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

  if (frequency === "WEEKLY") return true;

  if (frequency === "BI_WEEKLY") {
    const taskStartWeek = mondayOf(createdAt);
    const weeksSinceStart = Math.round(
      (weekStart.getTime() - taskStartWeek.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );
    return weeksSinceStart >= 0 && weeksSinceStart % 2 === 0;
  }

  const dayOfMonth = weekStart.getUTCDate();
  const isFirstWeekOfMonth = dayOfMonth <= 7;

  if (frequency === "MONTHLY") return isFirstWeekOfMonth;

  if (frequency === "QUARTERLY") {
    const month = weekStart.getUTCMonth();
    const isQuarterStartMonth = month % 3 === 0;
    return isQuarterStartMonth && isFirstWeekOfMonth;
  }

  return false;
}
