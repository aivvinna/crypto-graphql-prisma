import '@babel/polyfill/noConflict'
import { GraphQLServer, PubSub } from 'graphql-yoga'
import { resolvers, fragmentReplacements } from './resolvers/index'
import prisma from './prisma'

const pubsub = new PubSub()

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  // typeDefs: './src/generated/prisma.graphql',
  resolvers,
  context(request) {
    return {
      pubsub,
      prisma,
      request
    }
  },
  fragmentReplacements
})

const options = {
  port: process.env.PORT || 4000,
  cors: {
    credentials: true,
    origin: ["http://localhost:8080"]
  },
}

server.start(options, ({ port }) => {
  console.log(`Server is up on port ${port}`)
})
