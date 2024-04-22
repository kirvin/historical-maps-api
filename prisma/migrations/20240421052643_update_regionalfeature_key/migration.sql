-- CreateTable
CREATE TABLE "RegionalFeature" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "featureId" INTEGER NOT NULL,
    "regionId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RegionalFeature_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RegionalFeature_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "GeoRegion" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
