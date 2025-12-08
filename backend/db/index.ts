import mongoose from "mongoose";
import { DATABASE_URL } from "../env";

export const db = mongoose.connect(DATABASE_URL);

export { User, type IUser } from "./schemas/User";
export { Tag, type ITag } from "./schemas/Tag";
export { Schema, type ISchema } from "./schemas/Schema";
export { Document, type IDocument } from "./schemas/Document";
