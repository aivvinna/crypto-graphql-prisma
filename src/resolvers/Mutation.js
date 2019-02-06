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

    let userExists
    
    if (args.data.follow) {
      userExists = await prisma.exists.User({
        id: args.data.follow
      })
    }

    if (args.data.unfollow) {
      userExists = await prisma.exists.User({
        id: args.data.follow
      })
    }

    if (!userExists) {
      throw new Error('User does not exist')
    }

    if (args.data.follow) {
      return prisma.mutation.updateUser({
        where: {
          id: userId
        },
        data: {
          username: args.data.username,
          email: args.data.email,
          password: args.data.password,
          posts: args.data.posts,
          location: args.data.location,
          bio: args.data.bio,
          following: {
            connect: {
              id: args.data.follow
            }
          }
        }
      })
    }

    if (args.data.unfollow) {
      return prisma.mutation.updateUser({
        where: {
          id: userId
        },
        data: {
          username: args.data.username,
          email: args.data.email,
          password: args.data.password,
          posts: args.data.posts,
          location: args.data.location,
          bio: args.data.bio,
          following: {
            disconnect: {
              id: args.data.unfollow
            }
          }
        }
      })
    }

    return prisma.mutation.updateUser({
      where: {
        id: userId
      },
      data: args.data
    }, info)
  },
  createPost(parent, args, { prisma, request }, info) {
    const userId = getUserId(request)

    if (args.data.postId) {
      return prisma.mutation.createPost({
        data: {
          content: args.data.content,
          category: args.data.category,
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
  }
}

export { Mutation as default }