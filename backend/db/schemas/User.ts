import mongoose, { InferSchemaType } from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

export type IUser = InferSchemaType<typeof userSchema>;

export const User = mongoose.model<IUser>("User", userSchema);
