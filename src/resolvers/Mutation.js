import bcrypt from 'bcryptjs'
import getUserId from '../utils/getUserId'
import generateToken from '../utils/generateToken'
import hashPassword from '../utils/hashPassword'

const Mutation = {
  async createUser(parent, args, { prisma }, info) {
    const password = await hashPassword(args.data.password)

    const user = await prisma.mutation.createUser({
      data: {
        ...args.data,
        password
      }
    })

    return {
      user,
      token: generateToken(user.id)
    }
  },
  async login(parent, args, { prisma }, info) {
    const user = await prisma.query.user({
      where: {
        email: args.data.email
      }
    })

    if (!user) {
      throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(args.data.password, user.password)

    if(!isMatch) {
      throw new Error('Unable to login')
    }

    return {
      user,
      token: generateToken(user.id)
    }
  },
  async deleteUser(parent, args, { prisma, request }, info) {
    const userId = getUserId(request)

    return prisma.mutation.deleteUser({
      where: {
        id: userId
      }
    }, info)
  },
  async updateUser(parent, args, { prisma, request }, info) {
    const userId = getUserId(request)

    if (typeof args.data.password === 'string') {
      args.data.password = await hashPassword(args.data.password)
    }

    return prisma.mutation.updateUser({
      where: {
        id: userId
      },
      data: args.data
    }, info)
  },
  async followUser(parent, args, { prisma, request }, info) {
    const userId = getUserId(request)

    const userExists = await prisma.exists.User({
      id: args.id
    })

    if (!userExists) {
      throw new Error('User does not exist')
    }

    return prisma.mutation.updateUser({
      where: {
        id: userId
      },
      data: {
        following: {
          connect: {
            id: args.id
          }
        }
      }
    }, info)
  },
  async unfollowUser(parent, args, { prisma, request }, info) {
    const userId = getUserId(request)

    const userExists = await prisma.exists.User({
      id: args.id
    })

    if (!userExists) {
      throw new Error('User does not exist')
    }

    return prisma.mutation.updateUser({
      where: {
        id: userId
      },
      data: {
        following: {
          disconnect: {
            id: args.id
          }
        }
      }
    }, info)
  },
  // Add crypto to favorites. Must provide current favorites as array
  // as an argument. Prisma currently does not support push to scalar
  // lists
  async updateFavCryptos(parent, args, { prisma, request }, info) {
    const userId = getUserId(request)

    return prisma.mutation.updateUser({
      where: {
        id: userId
      },
      data: {
        favCryptos: {
          set: args.cryptos
        }
      }
    }, info)
  },
  createPost(parent, args, { prisma, request }, info) {
    const userId = getUserId(request)

    if (args.data.postId) {
      return prisma.mutation.createPost({
        data: {
          content: args.data.content,
          category: {
            set: args.data.category
          },
          author: {
            connect: {
              id: userId
            }
          },
          parent: {
            connect: {
              id: args.data.postId
            }
          }
        }
      }, info)
    }

    return prisma.mutation.createPost({
      data: {
        content: args.data.content,
        category: args.data.category,
        author: {
          connect: {
            id: userId
          }
        }
      }
    }, info)
  },
  async deletePost(parent, args, { prisma, request }, info) {
    const userId = getUserId(request)
    const postExists = await prisma.exists.Post({
      id: args.id,
      author: {
        id: userId
      }
    })

    if (!postExists) {
      throw new Error('Unable to delete post')
    }

    return prisma.mutation.deletePost({
      where: {
        id: args.id
      }
    }, info)
  },
  async updatePost(parent, args, {prisma, request }, info) {
    const userId = getUserId(request)
    const postExists = await prisma.exists.Post({
      id: args.id,
      author: {
        id: userId
      }
    })

    if (!postExists) {
      throw new Error('Unable to update post')
    }

    return prisma.mutation.updatePost({
      where: {
        id: args.id
      },
      data: args.data
    }, info)
  },
  async upvotePost(parent, args, {prisma, request }, info) {
    const userId = getUserId(request)
    const postExists = await prisma.exists.Post({
      id: args.id
    })

    if (!postExists) {
      throw new Error('Unable to update post')
    }

    const alreadyUpvoted = await prisma.exists.Post({
      id: args.id,
      upvotes_some: {
        id: userId
      }
    })

    if (alreadyUpvoted) {
      throw new Error('Already upvoted')
    }

    return prisma.mutation.updatePost({
      where: {
        id: args.id
      },
      data: {
        upvotes: {
          connect: {
            id: userId
          }
        },
        downvotes: {
          disconnect: {
            id: userId
          }
        }
      }
    }, info)
  },
  async downvotePost(parent, args, {prisma, request }, info) {
    const userId = getUserId(request)
    const postExists = await prisma.exists.Post({
      id: args.id
    })

    if (!postExists) {
      throw new Error('Unable to update post')
    }

    const alreadyDownvoted = await prisma.exists.Post({
      id: args.id,
      downvotes_some: {
        id: userId
      }
    })

    if (alreadyDownvoted) {
      throw new Error('Already downvoted')
    }

    return prisma.mutation.updatePost({
      where: {
        id: args.id
      },
      data: {
        upvotes: {
          disconnect: {
            id: userId
          }
        },
        downvotes: {
          connect: {
            id: userId
          }
        }
      }
    }, info)
  }
}

export { Mutation as default }