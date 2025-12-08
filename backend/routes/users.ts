import { usersContract } from '../contracts/users';
import { User } from '../db';
import { s } from "../tsrest"

export const usersRouter = s.router(usersContract, {
  getById: async ({ params: { id } }) => {
    const user = await User.findById(id);

    if (!user) {
      return {
        status: 404,
        body: { error: 'User not found' },
      };
    }

    return {
      status: 200,
      body: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
      },
    };
  },

  create: async ({ body }) => {
    try {
      const user = await User.create(body);
      return {
        status: 201,
        body: {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          createdAt: user.createdAt.toISOString(),
        },
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message || 'Failed to create user' : 'Failed to create user';

      return {
        status: 400,
        body: { error: message },
      };
    }
  },

  update: async ({ params: { id }, body }) => {
    try {
      const user = await User.findByIdAndUpdate(id, body, { new: true });

      if (!user) {
        return {
          status: 404,
          body: { error: 'User not found' },
        };
      }

      return {
        status: 200,
        body: {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          createdAt: user.createdAt.toISOString(),
        },
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message || 'Failed to update user' : 'Failed to update user';

      return {
        status: 400,
        body: { error: message },
      };
    }
  },

  delete: async ({ params: { id } }) => {
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return {
        status: 404,
        body: { error: 'User not found' },
      };
    }

    return {
      status: 200,
      body: { message: 'User deleted successfully' },
    };
  },

  list: async () => {
    const users = await User.find().select('-password');

    return {
      status: 200,
      body: users.map(user => ({
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt.toISOString(),
      })),
    };
  },

  login: async ({ body }) => {
    try {
      const user = await User.findOne({ email: body.email }).select('+password');

      if (!user) {
        return {
          status: 401,
          body: { error: 'Invalid email or password' },
        };
      }

      const isPasswordValid = await user.comparePassword(body.password);

      if (!isPasswordValid) {
        return {
          status: 401,
          body: { error: 'Invalid email or password' },
        };
      }

      return {
        status: 200,
        body: {
          _id: user._id.toString(),
          name: user.name,
          email: user.email,
          createdAt: user.createdAt.toISOString(),
        },
      };
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message || 'Login failed' : 'Login failed';

      return {
        status: 400,
        body: { error: message },
      };
    }
  },
});
