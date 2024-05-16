import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const regionKeys = [
    "africa",
    "north-africa",
    "southern-africa",
    "mediterranean",
    "central-asia",
    "east-asia",
    "south-asia",
    "north-pacific",
    "south-pacific",
    "north-america",
    "central-america",
    "south-america",
    "western-europe",
    "northern-europe",
    "eastern-europe",
    "arctic-circle"
  ];

  for (const key of regionKeys) {
    const region = await prisma.geoRegion.upsert({
      where: { key: key },
      create: {
        key
      },
      update: {
        key
      }
    });
    console.log(`Created GeoRegion [${region.id}] '${region.key}`);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })