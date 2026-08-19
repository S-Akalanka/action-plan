// Creates missing instances for due standard tasks. Safe for scheduled and
// on-demand use.

import { prisma } from "./prisma";
import { isTaskDueForWeek, normalizeToMonday } from "./week";

export async function generateInstancesForWeek(weekStart: Date): Promise<number> {
  // Store week start dates consistently as Mondays.
  const normalizedWeekStart = normalizeToMonday(weekStart);

  const activeTasks = await prisma.task.findMany({
    where: { isActive: true, source: "STANDARD" },
  });

  const tasksNeedingInstances = activeTasks.filter((task) =>
    isTaskDueForWeek(task.frequency, normalizedWeekStart, task.deadline, task.createdAt)
  );

  if (tasksNeedingInstances.length === 0) return 0;

  const result = await prisma.taskInstance.createMany({
    data: tasksNeedingInstances.map((task) => ({
      taskId: task.id,
      weekStartDate: normalizedWeekStart,
      createdAt: new Date(),
    })),
    skipDuplicates: true,
  });

  return result.count;
}
