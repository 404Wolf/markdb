import mongoose from "mongoose";
import { DATABASE_URL } from "../env";
import { User } from "./schemas/User";

export const db = mongoose.connect(DATABASE_URL);

export { User, type IUser } from "./schemas/User";
export { Tag, type ITag } from "./schemas/Tag";
export { Schema, type ISchema } from "./schemas/Schema";
export { Document, type IDocument } from "./schemas/Document";

// always preload admin admin@email.com password during development
if (process.env.NODE_ENV === "development") {
  const adminUser = new User({
    name: "admin",
    createdAt: new Date(),
    email: "admin@email.com",
    password: "password",
  });
  adminUser.save();
}
