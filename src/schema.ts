import { makeExecutableSchema } from '@graphql-tools/schema'
import type { Feature } from "@prisma/client"
import { GraphQLContext } from './context'

const typeDefinitions = /* GraphQL */ `
  type Query {
    info: String!
    # feed: [Link!]!
    # comment(id: String): Comment
    features: [Feature!]!
  }

  # type Comment {
  #   id: ID!
  #   body: String!
  #   link: Link
  # }

  type Mutation {
    # postLink(url: String!, description: String!): Link!
    # postCommentOnLink(linkId: ID!, body: String!): Comment!
    createFeature(geojson: String!): Feature!
    updateFeature(featureId: ID!, geojson: String!): Feature!
  }

  # type Link {
  #   id: ID!
  #   description: String!
  #   url: String!
  #   comments: [Comment!]!
  # }

  type Feature {
    id: ID!
    geojson: String!
  }
`

const resolvers = {
  Query: {
    info: () => `API for managing geographic feature data`,
    // feed: async (parent: unknown, args: {}, context: GraphQLContext) => {
    //   return context.prisma.link.findMany()
    // },
    // comment: async (parent: unknown, args: { id: string }, context: GraphQLContext) => {
    //   return context.prisma.comment.findUnique({
    //     where: { id: parseInt(args.id) }
    //   })
    // },
    // link: async (parent: unknown, args: { id: string }, context: GraphQLContext) => {
    //   return context.prisma.link.findUnique({
    //     where: { id: parseInt(args.id) }
    //   })
    // },
    features: async (parent: unknown, args: {}, context: GraphQLContext) => {
      return context.prisma.feature.findMany({
        orderBy: [
          { updatedAt: "desc" }
        ]
      })
    }
  },
  Feature: {
    id: (item: Feature) => item.id,
    geojson: (item: Feature) => item.geojson
  },
  // Comment: {
  //   id: (parent: Comment) => parent.id,
  //   body: (parent: Comment) => parent.body,
  // },
  // Link: {
  //   id: (parent: Link) => parent.id,
  //   description: (parent: Link) => parent.description,
  //   url: (parent: Link) => parent.url,
  //   comments: (parent: Link, args: {}, context: GraphQLContext) => {
  //     return context.prisma.comment.findMany({
  //       where: { linkId: parent.id }
  //     })
  //   }
  // },
  Mutation: {
    async createFeature(
      item: unknown,
      args: { geojson: string },
      context: GraphQLContext
    ) {
      const newFeature = await context.prisma.feature.create({
        data: {
          geojson: args.geojson
        }
      })
      return newFeature;
    },
    async updateFeature(
      item: unknown,
      args: { id: string, geojson: string },
      context: GraphQLContext
    ) {
      const result = await context.prisma.feature.update({
        where: {
          id: parseInt(args.id)
        },
        data: {
          geojson: args.geojson
        }
      })

      return result;
    }
    // async postLink(
    //   parent: unknown,
    //   args: { description: string, url: string },
    //   context: GraphQLContext
    // ) {
    //   const newLink = await context.prisma.link.create({
    //     data: {
    //       url: args.url,
    //       description: args.description
    //     }
    //   })
    //   return newLink;
    // },
    // async postCommentOnLink(
    //   parent: unknown,
    //   args: { linkId: string; body: string },
    //   context: GraphQLContext
    // ) {
    //   const newComment = await context.prisma.comment.create({
    //     data: {
    //       linkId: parseInt(args.linkId),
    //       body: args.body
    //     }
    //   })

    //   return newComment
    // }
  }
}

export const schema = makeExecutableSchema({
  resolvers: [resolvers],
  typeDefs: [typeDefinitions]
})
