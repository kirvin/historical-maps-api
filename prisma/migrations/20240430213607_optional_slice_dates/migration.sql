-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FeatureSlice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "startDate" DATETIME,
    "endDate" DATETIME,
    "coordinates" TEXT NOT NULL,
    "featureId" INTEGER NOT NULL,
    CONSTRAINT "FeatureSlice_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_FeatureSlice" ("coordinates", "createdAt", "endDate", "featureId", "id", "startDate", "updatedAt") SELECT "coordinates", "createdAt", "endDate", "featureId", "id", "startDate", "updatedAt" FROM "FeatureSlice";
DROP TABLE "FeatureSlice";
ALTER TABLE "new_FeatureSlice" RENAME TO "FeatureSlice";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
