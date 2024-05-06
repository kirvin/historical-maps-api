-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FeatureSlice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "startYear" INTEGER,
    "endYear" INTEGER,
    "coordinates" TEXT NOT NULL,
    "featureId" INTEGER NOT NULL,
    CONSTRAINT "FeatureSlice_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_FeatureSlice" ("coordinates", "createdAt", "endYear", "featureId", "id", "startYear", "updatedAt") SELECT "coordinates", "createdAt", "endYear", "featureId", "id", "startYear", "updatedAt" FROM "FeatureSlice";
DROP TABLE "FeatureSlice";
ALTER TABLE "new_FeatureSlice" RENAME TO "FeatureSlice";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
