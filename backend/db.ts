import mongoose from "mongoose";
import { DATABASE_URL } from "./env";

export const db = mongoose.connect(DATABASE_URL);

// User
interface IUser {
  name: string;
  email: string;
  createdAt: Date;
}

const userSchema = new mongoose.Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

export type { IUser };
export const User = mongoose.model<IUser>("User", userSchema);

// Tag
interface ITag {
  name: string;
  createdAt: Date;
}

const tagSchema = new mongoose.Schema<ITag>({
  name: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now }
});

export type { ITag };
export const Tag = mongoose.model<ITag>("Tag", tagSchema);

// Document
interface IDocument {
  name: string;
  content: string;
  author: mongoose.Types.ObjectId;
  tags: mongoose.Types.ObjectId[];
  createdAt: Date;
}

const documentSchema = new mongoose.Schema<IDocument>({
  name: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tags: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tag" }],
  createdAt: { type: Date, default: Date.now }
});

export type { IDocument };
export const Document = mongoose.model<IDocument>("Document", documentSchema);

// Schema
interface ISchema {
  name: string;
  createdAt: Date;
}

const schemaSchema = new mongoose.Schema<ISchema>({
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export type { ISchema };
export const Schema = mongoose.model<ISchema>("Schema", schemaSchema);
