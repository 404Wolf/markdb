import mongoose, { InferSchemaType } from "mongoose";

const schemaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export type ISchema = InferSchemaType<typeof schemaSchema>;

export const Schema = mongoose.model<ISchema>("Schema", schemaSchema);
