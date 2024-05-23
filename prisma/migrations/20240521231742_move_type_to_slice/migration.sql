/*
  Warnings:

  - You are about to drop the column `type` on the `Feature` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FeatureSlice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'marker',
    "startYear" INTEGER,
    "endYear" INTEGER,
    "coordinates" TEXT NOT NULL,
    "featureId" INTEGER NOT NULL,
    CONSTRAINT "FeatureSlice_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FeatureSlice" ("coordinates", "createdAt", "endYear", "featureId", "id", "startYear", "updatedAt", "uuid") SELECT "coordinates", "createdAt", "endYear", "featureId", "id", "startYear", "updatedAt", "uuid" FROM "FeatureSlice";
DROP TABLE "FeatureSlice";
ALTER TABLE "new_FeatureSlice" RENAME TO "FeatureSlice";
CREATE UNIQUE INDEX "FeatureSlice_uuid_key" ON "FeatureSlice"("uuid");
CREATE TABLE "new_Feature" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "uuid" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'Unknown Feature',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Feature" ("createdAt", "id", "title", "updatedAt", "uuid") SELECT "createdAt", "id", "title", "updatedAt", "uuid" FROM "Feature";
DROP TABLE "Feature";
ALTER TABLE "new_Feature" RENAME TO "Feature";
CREATE UNIQUE INDEX "Feature_uuid_key" ON "Feature"("uuid");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
