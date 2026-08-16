// lib/generate-instances.ts
//
// Single source of truth for "create missing TaskInstance rows for a given
// week." Called by the real scheduled cron route AND, as a self-healing
// fallback, by routes that read instances — so if the cron job ever misses
// a run, the app doesn't silently show nothing.

import { prisma } from "./prisma";
import { isTaskDueForWeek } from "./week";

export async function generateInstancesForWeek(weekStart: Date): Promise<number> {
  const activeTasks = await prisma.task.findMany({
    where: { isActive: true, source: "STANDARD" },
  });

  const tasksNeedingInstances = activeTasks.filter((task) =>
    isTaskDueForWeek(task.frequency, weekStart, task.deadline, task.createdAt)
  );

  if (tasksNeedingInstances.length === 0) return 0;

  const result = await prisma.taskInstance.createMany({
    data: tasksNeedingInstances.map((task) => ({
      taskId: task.id,
      weekStartDate: weekStart,
    })),
    skipDuplicates: true, // safe to call more than once for the same week
  });

  return result.count;
}
