import mongoose, { InferSchemaType } from "mongoose";

const tagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

export type ITag = InferSchemaType<typeof tagSchema>;

export const Tag = mongoose.model<ITag>("Tag", tagSchema);
