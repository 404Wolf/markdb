import { documentsContract } from '../contracts/documents';
import { Document, Schema } from '../db';
import { validate } from '../lib/validate';
import { Extracted } from '../db/schemas/Extracted';
import { s } from "../tsrest"

export const documentsRouter = s.router(documentsContract, {
  getAll: async () => {
    const documents = await Document.find();
    const documentIds = documents.map(doc => doc._id);
    const extracted = await Extracted.find({ forDocument: { $in: documentIds } });
    const extractedMap = new Map(extracted.map(e => [e.forDocument.toString(), e.data]));

    return {
      status: 200,
      body: documents.map(doc => ({
        _id: doc._id.toString(),
        name: doc.name,
        schemaId: doc.schemaId.toString(),
        content: doc.content,
        author: doc.author.toString(),
        tags: doc.tags.map(tag => tag.toString()),
        createdAt: doc.createdAt.toISOString(),
        extracted: extractedMap.get(doc._id.toString()),
      })),
    };
  },

  getById: async ({ params: { id } }) => {
    const document = await Document.findById(id);

    if (!document) {
      return {
        status: 404,
        body: { error: 'Document not found' },
      };
    }

    const extracted = await Extracted.findOne({ forDocument: document._id });

    return {
      status: 200,
      body: {
        _id: document._id.toString(),
        name: document.name,
        schemaId: document.schemaId.toString(),
        content: document.content,
        author: document.author.toString(),
        tags: document.tags.map(tag => tag.toString()),
        createdAt: document.createdAt.toISOString(),
        extracted: extracted?.data,
      },
    };
  },

  create: async ({ body }) => {
    try {
      const schemaDoc = await Schema.findById(body.schemaId);

      if (!schemaDoc) {
        return {
          status: 404,
          body: { error: 'Schema not found' },
        };
      }

      const validateResult = await validate({ input: body.content, schema: schemaDoc.content.toString() });

      if (!validateResult.success) {
        return {
          status: 422,
          body: { reason: "validationError", error: validateResult.error },
        };
      }

      const document = await Document.create(body);
      const extractedDoc = await Extracted.create({ forDocument: document._id, data: validateResult.output });

      return {
        status: 201,
        body: {
          _id: document._id.toString(),
          name: document.name,
          schemaId: document.schemaId.toString(),
          content: document.content,
          author: document.author.toString(),
          tags: document.tags.map(tag => tag.toString()),
          createdAt: document.createdAt.toISOString(),
          extracted: extractedDoc.data,
          validationResult: validateResult,
        },
      };
    } catch (error) {
      return {
        status: 400,
        body: { error: error instanceof Error ? error.message : 'Failed to create document' },
      };
    }
  },

  update: async ({ params: { id }, body }) => {
    try {
      const document = await Document.findById(id);

      if (!document) {
        return {
          status: 404,
          body: { error: 'Document not found' },
        };
      }

      // Determine which schema to validate against
      const targetSchemaId = body.schemaId || document.schemaId;
      const contentToValidate = body.content || document.content;
      
      // If schema or content is being updated, validate the content against the target schema
      if (body.schemaId || body.content) {
        const schemaDoc = await Schema.findById(targetSchemaId);

        if (!schemaDoc) {
          return {
            status: 404,
            body: { error: 'Schema not found' },
          };
        }

        const validateResult = await validate({ input: contentToValidate, schema: schemaDoc.content.toString() });

        if (!validateResult.success) {
          return {
            status: 422,
            body: { reason: "validationError", error: validateResult.error },
          };
        }

        // Update the extracted data if validation succeeds
        await Extracted.findOneAndUpdate(
          { forDocument: document._id },
          { data: validateResult.output },
          { upsert: true }
        );
      }

      // Update the document
      const updatedDocument = await Document.findByIdAndUpdate(id, body, { new: true });

      if (!updatedDocument) {
        return {
          status: 404,
          body: { error: 'Document not found' },
        };
      }

      const extracted = await Extracted.findOne({ forDocument: updatedDocument._id });

      return {
        status: 200,
        body: {
          _id: updatedDocument._id.toString(),
          name: updatedDocument.name,
          schemaId: updatedDocument.schemaId.toString(),
          content: updatedDocument.content,
          author: updatedDocument.author.toString(),
          tags: updatedDocument.tags.map(tag => tag.toString()),
          createdAt: updatedDocument.createdAt.toISOString(),
          extracted: extracted?.data,
        },
      };
    } catch (error) {
      return {
        status: 400,
        body: { error: error instanceof Error ? error.message : 'Failed to update document' },
      };
    }
  },

  delete: async ({ params: { id } }) => {
    const document = await Document.findByIdAndDelete(id);

    if (!document) {
      return {
        status: 404,
        body: { error: 'Document not found' },
      };
    }

    return {
      status: 200,
      body: { message: 'Document deleted successfully' },
    };
  },
});
