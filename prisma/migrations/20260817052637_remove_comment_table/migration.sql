/*
  Warnings:

  - You are about to drop the `Comment` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_authorId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_taskInstanceId_fkey";

-- AlterTable
ALTER TABLE "task_instances" ADD COLUMN     "comment" TEXT,
ADD COLUMN     "commentedAt" TIMESTAMP(3),
ADD COLUMN     "commentedById" TEXT;

-- DropTable
DROP TABLE "Comment";

-- AddForeignKey
ALTER TABLE "task_instances" ADD CONSTRAINT "task_instances_commentedById_fkey" FOREIGN KEY ("commentedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
