import { parseISO } from "date-fns";
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
  },

  /*
   * Updates OR creates FeatureSlices defined in the `slices` arg.  Does NOT delete slices.
   */
  updateFeatureSlices: async (
    item: unknown,
    args: { featureId: string, slices: Array<any> },
    context: GraphQLContext
  ) => {
    let feature = await context.prisma.feature.findUnique({ where: { id: parseInt(args.featureId) } })
    if (feature && feature !== null) {
      args.slices.forEach(async s => {
        // update an existing FeatureSlice
        if (s.id) {
          await context.prisma.featureSlice.update({
            data: {
              coordinates: s.coordinates,
              startDate: s.startDate,
              endDate: s.endDate
            },
            where: {
              id: parseInt(s.id)
            }
          });
        }
        // add a new FeatureSlice
        else {
          const createProps: any = {
            featureId: feature.id,
            coordinates: s.coordinates
          };
          if (s.startDate) {
            try {
              createProps.startDate = parseISO(s.startDate);
            } catch (err) {
              console.info(`Unable to parse startDate from value ${s.startDate} while creating FeatureSlice`);
            }
          }
          if (s.endDate) {
            try {
              createProps.endDate = parseISO(s.endDate);
            } catch (err) {
              console.info(`Unable to parse endDate from value ${s.endDate} while creating FeatureSlice`);
            }
          }

          await context.prisma.featureSlice.create({
            data: createProps
          })
        }
      })
      const slices = await context.prisma.featureSlice.findMany(
        { where: { featureId: feature.id } }
      );
    }

    return feature;
  }
}

export default FeatureResolver;