import { v4 as uuidv4 } from 'uuid';
import pino from "pino";

import { GraphQLContext } from '../context'
import FeatureResolver from "./feature-resolver";
import { FeatureInput, FeatureSliceInput, GeoRegionInput } from '../type-definitions';

const logger = pino();

const MutationResolvers = {
  async addFeatureToRegions(
    item: unknown,
    args: { featureId: string, regionKeys: string[] },
    context: GraphQLContext
  ) {
    const feature = await FeatureResolver.addFeatureToRegions(
      item,
      args,
      context
    );

    return feature;
  },
  async createRegion(
    item: unknown,
    args: { key: string },
    context: GraphQLContext
  ) {
    const newRegion = await context.prisma.geoRegion.create({
      data: {
        key: args.key
      }
    })
    return newRegion;
  },
  async createFeature(
    item: unknown,
    args: { uuid: string, title: string },
    context: GraphQLContext
  ) {
    const newFeature = await context.prisma.feature.create({
      data: {
        uuid: args.uuid || uuidv4(),
        title: args.title
      }
    })
    return newFeature;
  },
  async updateFeature(
    item: unknown,
    args: { feature: FeatureInput },
    context: GraphQLContext
  ) {
    let featureId = parseInt(args.feature.id);
    let feature = null;
    if (featureId && featureId > 0) {
      feature = await context.prisma.feature.update({
        where: { id: featureId },
        data: {
          uuid: args.feature.uuid,
          title: args.feature.title,
          type: args.feature.type
        }
      });
    }
    else {
      feature = await context.prisma.feature.create({
        data: {
          uuid: args.feature.uuid,
          title: args.feature.title,
          type: args.feature.type
        }
      });
      featureId = feature.id;
    }

    // Associate regions to Feature
    await FeatureResolver.addFeatureToRegions(
      item,
      {
        featureId: feature.id.toString(),
        regionKeys: args.feature?.regions?.map(r => r.key)
      },
      context
    );

    // @TODO implement slices update
    await FeatureResolver.updateFeatureSlices(
      item,
      {
        featureId: feature.id.toString(),
        slices: args.feature?.slices || []
      },
      context
    )

    return context.prisma.feature.findUnique({ where: { id: featureId } });
  },
  async deleteFeature(
    item: unknown,
    args: { featureId: string },
    context: GraphQLContext
  ) {
    const result = {
      feature: <any>null,
      success: false
    };

    try {
      const deleteResult = await context.prisma.feature.delete({
        where: { id: parseInt(args.featureId) }
      });
      if (deleteResult?.id) {
        result.feature = deleteResult;
        result.success = true;
      }
      logger.info(`Deleted Feature#${args.featureId}: ${result}`);
    } catch (err) {
      logger.info(`Unable to delete Feature#${args.featureId}: ${err}`);
    }

    return result;
  },
  async updateFeatureSlice(
    item: unknown,
    args: { featureSlice: FeatureSliceInput },
    context: GraphQLContext
  ) {
    let featureSliceId = parseInt(args.featureSlice.id);
    let featureSlice = null;
    if (featureSliceId && featureSliceId > 0) {
      featureSlice = await context.prisma.featureSlice.update({
        where: { id: featureSliceId },
        data: {
          uuid: args.featureSlice.uuid,
          coordinates: args.featureSlice.coordinates,
          startYear: args.featureSlice.startYear,
          endYear: args.featureSlice.endYear
        }
      });
      console.log(featureSlice);
    }
    else {
      featureSlice = await context.prisma.featureSlice.create({
        data: {
          uuid: args.featureSlice.uuid,
          featureId: parseInt(args.featureSlice.featureId),
          coordinates: args.featureSlice.coordinates,
          startYear: args.featureSlice.startYear,
          endYear: args.featureSlice.endYear
        }
      });
      featureSliceId = featureSlice.id;
    }

    return context.prisma.featureSlice.findUnique({ where: { id: featureSliceId } });
  },
  async deleteFeatureSlice(
    item: unknown,
    args: { featureSliceId: string },
    context: GraphQLContext
  ) {
    const result = {
      featureSlice: <any>null,
      success: false
    };

    try {
      const deleteResult = await context.prisma.featureSlice.delete({
        where: { id: parseInt(args.featureSliceId) }
      });
      if (deleteResult?.id) {
        result.featureSlice = deleteResult;
        result.success = true;
      }
      logger.info(`Deleted FeatureSlice#${args.featureSliceId}: ${result}`);
    } catch (err) {
      logger.info(`Unable to delete FeatureSlice#${args.featureSliceId}: ${err}`);
    }

    return result;
  }
}

export default MutationResolvers