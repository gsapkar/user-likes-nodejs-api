/*
  Warnings:

  - A unique constraint covering the columns `[userId,likedByUserId]` on the table `UserLikes` will be added. If there are existing duplicate values, this will fail.
  - Made the column `password` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ALTER COLUMN "password" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "unique_likes" ON "UserLikes"("userId", "likedByUserId");
