import { makeExecutableSchema } from '@graphql-tools/schema'
import { GraphQLScalarType, Kind } from 'graphql';
import { formatISO } from "date-fns";
import pino from "pino";

import type { Feature, FeatureSlice, GeoRegion } from "@prisma/client"
import { GraphQLContext } from './context'
import { equal } from 'assert'
import FeatureResolver from "./resolvers/feature-resolver";
import MutationResolvers from "./resolvers/mutations";
import { serialize } from 'v8';
const logger = pino();

const DEFAULT_FEATURE_SLICE_TYPE = "Point";
const FEATURE_SLICE_TYPES = [
  DEFAULT_FEATURE_SLICE_TYPE,
  "Marker",
  "Circle",
  "Area",
  "Route",
  "Line"
]

const typeDefinitions = /* GraphQL */ `
  scalar DateTime

  input FeatureInput {
    id: ID!
    uuid: String!
    title: String
    regions: [GeoRegionInput!]
    slices: [FeatureSliceInput!]
  }

  input GeoRegionInput {
    key: String!
  }

  input FeatureSliceInput {
    id: ID
    uuid: String!
    featureId: ID!
    type: FeatureSliceType
    coordinates: String!
    startYear: Int
    endYear: Int
  }

  enum FeatureSliceType {
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
    updateFeatureSlice(featureSlice: FeatureSliceInput!): FeatureSlice!
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
    uuid: String!
    title: String!
    slices: [FeatureSlice!]!
    regions: [GeoRegion!]!
    createdAt: DateTime
    updatedAt: DateTime
  }

  type FeatureSlice {
    id: ID!
    uuid: String!
    type: FeatureSliceType!
    startYear: Int
    endYear: Int
    coordinates: String!
    createdAt: DateTime
    updatedAt: DateTime
  }

  type GeoRegion {
    id: ID!
    key: String!
  }
`

const resolvers = {
  DateTime: {
    name: "DateTime",
    description: "ISO8601 DateTime",
    parseValue(value: string) {
      return new Date(value)
    },
    serialize(value: string) {
      return formatISO(value);
    },
    parseLiteral(ast: any) {
      if (ast.kind === Kind.INT) {
        return new Date(+ast.value);
      }
      return null;
    }
  },
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
    uuid: (item: Feature) => item.uuid,
    title: (item: Feature) => item.title,
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
    endYear: (item: FeatureSlice) => item.endYear,
    type: (item: FeatureSlice) => {
      if (FEATURE_SLICE_TYPES.includes(item.type)) {
        return item.type;
      }
      return DEFAULT_FEATURE_SLICE_TYPE;
    },
  },
  Mutation: MutationResolvers
}

export const schema = makeExecutableSchema({
  resolvers: [resolvers],
  typeDefs: [typeDefinitions]
})
