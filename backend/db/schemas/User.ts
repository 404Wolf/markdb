import mongoose, { InferSchemaType } from "mongoose";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export type IUser = InferSchemaType<typeof userSchema>;

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export const User = mongoose.model<IUser, mongoose.Model<IUser, {}, IUserMethods>>("User", userSchema);
