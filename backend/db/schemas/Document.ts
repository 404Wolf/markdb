import mongoose, { Schema } from "mongoose";

const documentSchema = new Schema({
  name: { type: String, required: true, unique: true },
  schemaId: { type: Schema.Types.ObjectId, ref: "Schema", required: true },
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
  createdAt: { type: Date, default: Date.now }
});

export type IDocument = mongoose.InferSchemaType<typeof documentSchema>;

export const Document = mongoose.model("Document", documentSchema);
