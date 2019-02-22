import '@babel/polyfill/noConflict'
import { GraphQLServer, PubSub } from 'graphql-yoga'
import db from './db'
import { resolvers, fragmentReplacements } from './resolvers/index'
import prisma from './prisma'

const pubsub = new PubSub()

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  // typeDefs: './src/generated/prisma.graphql',
  resolvers,
  context(request) {
    return {
      db,
      pubsub,
      prisma,
      request
    }
  },
  fragmentReplacements
})

server.start({ port: process.env.PORT || 4000, cors: { credentials: true, origin: ["http://localhost:8080"]} }, () => {
  console.log('Server is up')
})