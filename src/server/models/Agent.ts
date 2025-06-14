// models/user-model.ts

import mongoose, { Schema } from "mongoose";

export interface Agent {
  name: string;
  description: string;
  adminIds: Schema.Types.ObjectId[];
  userIds: Schema.Types.ObjectId[];
  status: "active" | "inactive" | "suspended";
}

export interface MongoAgent extends Agent, mongoose.Document {}

export type TAgent = Agent & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

const UserSchema = new mongoose.Schema<Agent>(
  {
    name: {
      type: String,
      required: [true, "Agent name is required"],
      trim: true,
      minlength: [2, "Agent name must be at least 2 characters long"],
      maxlength: [100, "Agent name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      minlength: [10, "Description must be at least 10 characters long"],
    },
    adminIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    userIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

export const AgentModel =
  mongoose.models.Agent || mongoose.model<Agent>("Agent", UserSchema);
