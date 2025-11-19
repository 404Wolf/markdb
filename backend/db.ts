import mongoose from "mongoose";
import { DATABASE_URL } from "../env";

export const db = mongoose.connect(DATABASE_URL);
