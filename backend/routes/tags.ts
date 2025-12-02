import { tagsContract } from '../contracts/tags';
import { Tag } from '../db';
import { s } from "../tsrest"

export const tagsRouter = s.router(tagsContract, {
  getAll: async () => {
    const tags = await Tag.find();
    return {
      status: 200,
      body: tags.map(tag => ({
        _id: tag._id.toString(),
        name: tag.name,
        createdAt: tag.createdAt.toISOString(),
      })),
    };
  },

  getById: async ({ params: { id } }) => {
    const tag = await Tag.findById(id);

    if (!tag) {
      return {
        status: 404,
        body: { error: 'Tag not found' },
      };
    }

    return {
      status: 200,
      body: {
        _id: tag._id.toString(),
        name: tag.name,
        createdAt: tag.createdAt.toISOString(),
      },
    };
  },

  create: async ({ body }) => {
    try {
      const tag = await Tag.create(body);
      return {
        status: 201,
        body: {
          _id: tag._id.toString(),
          name: tag.name,
          createdAt: tag.createdAt.toISOString(),
        },
      };
    } catch (error: any) {
      return {
        status: 400,
        body: { error: error.message || 'Failed to create tag' },
      };
    }
  },

  update: async ({ params: { id }, body }) => {
    try {
      const tag = await Tag.findByIdAndUpdate(id, body, { new: true });

      if (!tag) {
        return {
          status: 404,
          body: { error: 'Tag not found' },
        };
      }

      return {
        status: 200,
        body: {
          _id: tag._id.toString(),
          name: tag.name,
          createdAt: tag.createdAt.toISOString(),
        },
      };
    } catch (error: any) {
      return {
        status: 400,
        body: { error: error.message || 'Failed to update tag' },
      };
    }
  },

  delete: async ({ params: { id } }) => {
    const tag = await Tag.findByIdAndDelete(id);

    if (!tag) {
      return {
        status: 404,
        body: { error: 'Tag not found' },
      };
    }

    return {
      status: 200,
      body: { message: 'Tag deleted successfully' },
    };
  },
});
