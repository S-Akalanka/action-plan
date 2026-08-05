/*
  Warnings:

  - Added the required column `deadline` to the `tasks` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "Frequency" ADD VALUE 'ONCE';

-- AlterTable
ALTER TABLE "task_instances" ADD COLUMN     "comment" TEXT;

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "deadline" DATE NOT NULL;
