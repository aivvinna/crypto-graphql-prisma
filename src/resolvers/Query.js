import getUserId from '../utils/getUserId'
import titleCase from '../utils/titleCase'

const Query = {
  users(parent, args, { prisma }, info) {
    const opArgs = {
      first: args.first,
      skip: args.skip,
      after: args.after,
      orderBy: args.orderBy
    }

    if (args.query) {
      opArgs.where = {
        OR: [{
          username_contains: args.query
        }, {
          displayName_contains: args.query
        }, {
          username_contains: args.query.toUpperCase()
        }, {
          displayName_contains: args.query.toUpperCase()
        }, {
          username_contains: args.query.toLowerCase()
        }, {
          displayName_contains: args.query.toLowerCase()
        }, {
          username_contains: titleCase(args.query)
        }, {
          displayName_contains: titleCase(args.query)
        }]
      }
    }
    return prisma.query.users(opArgs, info)
  },
  user(parent, args, { prisma }, info) {
    return prisma.query.user({
      where: args.where
    }, info)
  },
  myPosts(parent, args, { prisma, request }, info) {
    const userId = getUserId(request)
    const opArgs = {
      first: args.first,
      skip: args.skip,
      after: args.after,
      orderBy: args.orderBy,
      where: {
        author: {
          id: userId
        }
      }
    }

    if (args.query) {
      opArgs.where.OR = [{
        content_contains: args.query
      }, {
        category_contains: args.query
      }]
    }

    return prisma.query.posts(opArgs, info)
  },
  posts(parent, args, { prisma }, info) {
    const opArgs = {
      first: args.first,
      skip: args.skip,
      after: args.after,
      orderBy: args.orderBy
    }

    if (args.query) {
      opArgs.where = {
        OR: [{
          content_contains: args.query
        }, {
          content_contains: args.query.toUpperCase()
        }, {
          content_contains: args.query.toLowerCase()
        }, {
          content_contains: titleCase(args.query)
        }]
      }
    }
    return prisma.query.posts(opArgs, info)
  },
  async me(parent, args, { prisma, request }, info) {
    const userId = getUserId(request)

    return prisma.query.user({
      where: {
        id: userId
      }
    }, info)
  },
  async post(parent, args, { prisma, request }, info) {
    const userId = getUserId(request, false)
    return await prisma.query.post({
      where: {
        id: args.id
      }
    }, info)
  },
  // Number of a user's followings
  userFollowingCount(parent, args, { prisma }, info) {

    return prisma.query.usersConnection({
      where: {
        followers_some: {
          id: args.id
        }
      }
    }, info)
  },
  // Number of a user's followers
  userFollowersCount(parent, args, { prisma }, info) {

    return prisma.query.usersConnection({
      where: {
        following_some: {
          id: args.id
        }
      }
    }, info)
  },
  // Number of a user's posts
  userPostsCount(parent, args, { prisma }, info) {

    return prisma.query.postsConnection({
      where: {
        author: {
          id: args.id
        }
      }
    }, info)
  },
  // Messages between two users
  messages(parent, args, { prisma, request }, info) {
    const userId = getUserId(request)
    const opArgs = {
      first: args.first,
      skip: args.skip,
      after: args.after,
      orderBy: args.orderBy,
      where: {
        OR: [{
          AND: [{
            author: {
              id: userId
            }
          }, {
            receiver: {
              id: args.otherUserId
            }
          }]
        }, {
          AND: [{
            receiver: {
              id: userId
            }
          }, {
            author: {
              id: args.otherUserId
            }
          }]
        }]
      }
    }

    return prisma.query.messages(opArgs, info)
  },
  usersConversed(parent, args, { prisma, request }, info) {
    const userId = getUserId(request)
    const opArgs = {
      where: {
        AND: [{
          OR: [{
            messagesAuthored_some: {
              receiver: {
                id: userId
              }
            }
          }, {
            messagesReceived_some: {
              receiver: {
                id: userId
              }
            }
          }]
        }, {
          NOT: {
            id: userId
          }
        }]
      }
    }

    return prisma.query.users(opArgs, info)
  }
}

export { Query as default }
