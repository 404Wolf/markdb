import mongoose from "mongoose";

const extractedSchema = new mongoose.Schema({
  forDocument: { type: mongoose.Schema.Types.ObjectId, ref: "Document", required: true },
  createdAt: { type: Date, default: Date.now },
  data: { type: mongoose.Schema.Types.Mixed }
});

export type IExtracted = mongoose.InferSchemaType<typeof extractedSchema>;

export const Extracted = mongoose.model("Extracted", extractedSchema);
