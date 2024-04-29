import { makeExecutableSchema } from '@graphql-tools/schema'
import type { Feature, FeatureSlice, GeoRegion } from "@prisma/client"
import { GraphQLContext } from './context'
import { equal } from 'assert'

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
    geoJSON: String!
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
    features(regionKey: String): [Feature!]!
    feature(id: String!): Feature
  }

  type Mutation {
    createRegion(key: String!): GeoRegion!
    createFeature(geojson: String!): Feature!
    updateFeature(feature: FeatureInput!): Feature!
    addFeatureToRegions(featureId: ID!, regionKeys: [String!]!): Feature!
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
    geojson: String!
  }

  type GeoRegion {
    id: ID!
    key: String!
  }
`

type FeatureInput = {
  id: string
  title: string
  type: string
}

const resolvers = {
  Query: {
    info: () => `API for managing geographic feature data`,
    features: async (parent: unknown, args: { regionKey: string }, context: GraphQLContext) => {
      if (args.regionKey) {
        const regionFeatures = await context.prisma.regionalFeature.findMany({
          where: {
            region: {
              key: args.regionKey
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
  FeatureSlice: {
    geojson: (item: FeatureSlice) => item.geojson
  },
  Mutation: {
    async addFeatureToRegions(
      item: unknown,
      args: { featureId: string, regionKeys: string[] },
      context: GraphQLContext
    ) {
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
      const featureId = parseInt(args.feature.id);
      const updateResult = await context.prisma.feature.update({
        where: { id: featureId },
        data: {
          title: args.feature.title,
          type: args.feature.type
        }
      });
      // @TODO implement regions update
      // @TODO implement slices update

      // const result = await context.prisma.feature.update({
      //   where: {
      //     id: parseInt(args.id)
      //   },
      //   data: {
      //     title: args.title
      //   }
      // })
      return context.prisma.feature.findUnique({ where: { id: featureId } });
    }
  }
}

export const schema = makeExecutableSchema({
  resolvers: [resolvers],
  typeDefs: [typeDefinitions]
})
