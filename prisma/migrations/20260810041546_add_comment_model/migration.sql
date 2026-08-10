/*
  Warnings:

  - You are about to drop the column `comment` on the `task_instances` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "task_instances" DROP COLUMN "comment";

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "taskInstanceId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_taskInstanceId_fkey" FOREIGN KEY ("taskInstanceId") REFERENCES "task_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
