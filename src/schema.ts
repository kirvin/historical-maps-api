import { makeExecutableSchema } from '@graphql-tools/schema'
import { formatISO } from "date-fns";
import pino from "pino";

import type { Feature, FeatureSlice, GeoRegion } from "@prisma/client"
import { GraphQLContext } from './context'
import { equal } from 'assert'
import FeatureResolver from "./resolvers/feature-resolver";
const logger = pino();

const DEFAULT_FEATURE_TYPE = "Point";
const FEATURE_TYPES = [
  DEFAULT_FEATURE_TYPE,
  "Marker",
  "Circle",
  "Area",
  "Route",
  "Line"
]

const typeDefinitions = /* GraphQL */ `
  input FeatureInput {
    id: ID!
    title: String
    type: FeatureType
    regions: [GeoRegionInput!]
    slices: [FeatureSliceInput!]
  }

  input GeoRegionInput {
    key: String!
  }

  input FeatureSliceInput {
    id: ID
    featureId: ID!
    coordinates: String!
    startYear: Int
    endYear: Int
  }

  enum FeatureType {
    Point
    Marker
    Circle
    Area
    Route
    Line
  }

  type Query {
    info: String!
    regions: [GeoRegion!]!
    features(regionKeys: [String!]): [Feature!]!
    feature(id: String!): Feature
  }

  type Mutation {
    createRegion(key: String!): GeoRegion!
    createFeature(geojson: String!): Feature!
    deleteFeature(featureId: ID!): FeatureDeleteResult
    updateFeature(feature: FeatureInput!): Feature!
    addFeatureToRegions(featureId: ID!, regionKeys: [String!]!): Feature!
    deleteFeatureSlice(featureSliceId: ID!): FeatureSliceDeleteResult
  }

  type FeatureDeleteResult {
    success: Boolean!
    feature: Feature
  }

  type FeatureSliceDeleteResult {
    success: Boolean!
    featureSlice: FeatureSlice
  }

  type Feature {
    id: ID!
    type: FeatureType!
    title: String!
    slices: [FeatureSlice!]!
    regions: [GeoRegion!]!
  }

  type FeatureSlice {
    id: ID!
    startYear: Int
    endYear: Int
    coordinates: String!
  }

  type GeoRegion {
    id: ID!
    key: String!
  }
`
// @TODO figure out how to automatically derive these types from schema definition above
type FeatureInput = {
  id: string
  title: string
  type: string
  regions: Array<GeoRegionInput>
  slices: Array<FeatureSliceInput>
}

type GeoRegionInput = {
  key: string
}

type FeatureSliceInput = {
  id: string
  featureId: string
  startYear: number
  endYear: number
  coordinates: string
}

const resolvers = {
  Query: {
    info: () => `API for managing geographic feature data`,
    features: async (parent: unknown, args: { regionKeys: string[] }, context: GraphQLContext) => {
      if (args.regionKeys) {
        const regionFeatures = await context.prisma.regionalFeature.findMany({
          where: {
            region: {
              key: { in: args.regionKeys }
            }
          },
          include: {
            feature: true
          }
        })

        return regionFeatures.map(rf => rf.feature);
      }
      else {
        return context.prisma.feature.findMany({
          orderBy: [
            { updatedAt: "desc" }
          ]
        })
      }
    },
    feature: async (parent: unknown, args: { id: string }, context: GraphQLContext) => {
      return context.prisma.feature.findUnique({ where: { id: parseInt(args.id) } });
    },
    regions: async (parent: unknown, args: {}, context: GraphQLContext) => {
      return context.prisma.geoRegion.findMany({
        orderBy: [
          { key: "asc" }
        ]
      })
    }
  },
  Feature: {
    id: (item: Feature) => item.id,
    title: (item: Feature) => item.title,
    type: (item: Feature) => {
      if (FEATURE_TYPES.includes(item.type)) {
        return item.type;
      }
      return DEFAULT_FEATURE_TYPE;
    },
    regions: async (item: Feature, args: {}, context: GraphQLContext) => {
      const regionFeatures = await context.prisma.regionalFeature.findMany(
        {
          where: { featureId: item.id },
          include: { region: true }
        }
      )
      return regionFeatures.map(rf => rf.region);
    },
    slices: async (item: Feature, args: {}, context: GraphQLContext) => {
      const featuresSlices = await context.prisma.featureSlice.findMany(
        {
          where: { featureId: item.id }
        }
      )
      return featuresSlices;
    }
  },
  FeatureDeleteResult: {
    success: (deleteResult: any) => (deleteResult.success === true) ? true : false,
    feature: (deleteResult: any) => deleteResult.feature
  },
  FeatureSlice: {
    coordinates: (item: FeatureSlice) => item.coordinates,
    startYear: (item: FeatureSlice) => item.startYear,
    endYear: (item: FeatureSlice) => item.endYear
  },
  Mutation: {
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
      args: { title: string },
      context: GraphQLContext
    ) {
      const newFeature = await context.prisma.feature.create({
        data: {
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
            title: args.feature.title,
            type: args.feature.type
          }
        });
      }
      else {
        feature = await context.prisma.feature.create({
          data: {
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
}

export const schema = makeExecutableSchema({
  resolvers: [resolvers],
  typeDefs: [typeDefinitions]
})
