-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "githubRepo" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "githubAccessToken" TEXT,
ADD COLUMN     "githubUsername" TEXT;
