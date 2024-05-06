-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RegionalFeature" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "featureId" INTEGER NOT NULL,
    "regionId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RegionalFeature_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "RegionalFeature_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "GeoRegion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RegionalFeature" ("createdAt", "featureId", "id", "regionId", "updatedAt") SELECT "createdAt", "featureId", "id", "regionId", "updatedAt" FROM "RegionalFeature";
DROP TABLE "RegionalFeature";
ALTER TABLE "new_RegionalFeature" RENAME TO "RegionalFeature";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
