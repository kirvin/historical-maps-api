/*
  Warnings:

  - You are about to drop the column `geojson` on the `FeatureSlice` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FeatureSlice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "featureId" INTEGER NOT NULL,
    CONSTRAINT "FeatureSlice_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FeatureSlice" ("createdAt", "endDate", "featureId", "id", "startDate", "updatedAt") SELECT "createdAt", "endDate", "featureId", "id", "startDate", "updatedAt" FROM "FeatureSlice";
DROP TABLE "FeatureSlice";
ALTER TABLE "new_FeatureSlice" RENAME TO "FeatureSlice";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
