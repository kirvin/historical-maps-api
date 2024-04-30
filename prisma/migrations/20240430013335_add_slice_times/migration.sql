/*
  Warnings:

  - Added the required column `endDate` to the `FeatureSlice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `FeatureSlice` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FeatureSlice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME NOT NULL,
    "geojson" TEXT NOT NULL,
    "featureId" INTEGER NOT NULL,
    CONSTRAINT "FeatureSlice_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FeatureSlice" ("createdAt", "featureId", "geojson", "id", "updatedAt") SELECT "createdAt", "featureId", "geojson", "id", "updatedAt" FROM "FeatureSlice";
DROP TABLE "FeatureSlice";
ALTER TABLE "new_FeatureSlice" RENAME TO "FeatureSlice";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
