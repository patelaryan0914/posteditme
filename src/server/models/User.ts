// models/user-model.ts

import mongoose from "mongoose";

export interface User {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  approved: boolean;
  languages: string[];
  status: "active" | "inactive" | "suspended";
}

export interface MongoUser extends User, mongoose.Document {}

export type TUser = User & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

const UserSchema = new mongoose.Schema<User>(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
    },
    approved: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      default: "user",
    },
    password: {
      type: String,
      required: true,
    },
    languages: [
      {
        type: String,
        required: true,
      },
    ],
    status: {
      type: String,
      default: "active",
    },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<User>("User", UserSchema);
