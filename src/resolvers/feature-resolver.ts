import { GraphQLContext } from '../context'

const FeatureResolver = {
  addFeatureToRegions: async (
    item: unknown,
    args: { featureId: string, regionKeys: string[] },
    context: GraphQLContext
  ) => {
    let feature = await context.prisma.feature.findUnique({ where: { id: parseInt(args.featureId) } })

    if (feature && feature !== null) {
      // get all regions identified by the keys
      const regions = await context.prisma.geoRegion.findMany(
        { where: { key: { in: args.regionKeys } } }
      )
      await context.prisma.regionalFeature.deleteMany({ where: { featureId: feature.id } });

      await context.prisma.regionalFeature.createMany(
        { data: regions.map(r => ({ regionId: r.id, featureId: parseInt(args.featureId) })) }
      )
      feature = await context.prisma.feature.findUnique({ where: { id: parseInt(args.featureId) } })
    }

    return feature;
  }
}

export default FeatureResolver;