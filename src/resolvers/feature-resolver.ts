import { parseISO, isValid, formatISO } from "date-fns";
import { GraphQLContext } from '../context'
import pino from "pino";

const logger = pino({ name: "FeatureResolver" })

const parseDateValue = (sourceValue: string) => {
  let parsedDate = null;
  try {
    parsedDate = parseISO(sourceValue, { additionalDigits: 2 });
    if (!isValid(parsedDate)) {
      logger.info(`Unable to parse valid date from source value '${sourceValue}'`);
      parsedDate = null;
    }
  } catch (err) {
    logger.warn(`Error while parsing date from value ${sourceValue}: ${err}`);
  }

  return parsedDate;
};

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
        const sliceData: any = {
          coordinates: s.coordinates,
        }
        if (s.startYear) {
          sliceData.startYear = s.startYear;
        }
        if (s.endYear) {
          sliceData.endYear = s.endYear
        }

        // update an existing FeatureSlice
        if (s.id) {
          await context.prisma.featureSlice.update({
            data: sliceData,
            where: {
              id: parseInt(s.id)
            }
          });
        }
        // add a new FeatureSlice
        else {
          sliceData.featureId = feature.id;

          await context.prisma.featureSlice.create({
            data: sliceData
          })
        }
      })
      const slices = await context.prisma.featureSlice.findMany(
        { where: { featureId: feature.id } }
      );
    }

    return feature;
  },
}

export { parseDateValue };
export default FeatureResolver;