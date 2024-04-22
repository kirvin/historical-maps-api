/*
  Warnings:

  - You are about to drop the column `geojson` on the `Feature` table. All the data in the column will be lost.

*/
-- CreateTable
CREATE TABLE "FeatureSlice" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "geojson" TEXT NOT NULL,
    "featureId" INTEGER NOT NULL,
    CONSTRAINT "FeatureSlice_featureId_fkey" FOREIGN KEY ("featureId") REFERENCES "Feature" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GeoRegion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "key" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "_FeatureToGeoRegion" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_FeatureToGeoRegion_A_fkey" FOREIGN KEY ("A") REFERENCES "Feature" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_FeatureToGeoRegion_B_fkey" FOREIGN KEY ("B") REFERENCES "GeoRegion" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Feature" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL DEFAULT 'Unknown Feature',
    "type" TEXT NOT NULL DEFAULT 'marker',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Feature" ("createdAt", "id", "updatedAt") SELECT "createdAt", "id", "updatedAt" FROM "Feature";
DROP TABLE "Feature";
ALTER TABLE "new_Feature" RENAME TO "Feature";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "GeoRegion_key_key" ON "GeoRegion"("key");

-- CreateIndex
CREATE UNIQUE INDEX "_FeatureToGeoRegion_AB_unique" ON "_FeatureToGeoRegion"("A", "B");

-- CreateIndex
CREATE INDEX "_FeatureToGeoRegion_B_index" ON "_FeatureToGeoRegion"("B");
