import mongoose, { Schema, Types } from "mongoose";

export type RatingFramework = "fluency" | "adequacy" | "da" | "sqm" | "custom";

export interface Project {
  name: string;
  description: string;
  agentId: Types.ObjectId;
  assignedUsers: Types.ObjectId[];
  billedTasks: Record<string, unknown>;
  ratePerTask: number;
  sourceLanguage: string;
  targetLanguage?: string;
  type:
    | "human_translation"
    | "post_editing"
    | "text_classification"
    | "sequence_tagging"
    | "literary_translation"
    | "error_marking"
    | "translation_rating";
  status: "draft" | "in_progress" | "completed" | "cancelled";
  startDate: Date;
  dueDate?: Date;
  labels?: string[];
  confidenceThreshold?: number;
  errorCategories?: string[];
  ratingFramework?: RatingFramework;
  customCategories?: Array<{
    id: string;
    label: string;
    description: string;
  }>;
}
const customCategorySchema = new Schema(
  {
    label: { type: String, required: true },
    description: { type: String, default: "" },
  },
  { _id: true }
);

export interface MongoProject extends Project, mongoose.Document {}

export type TProject = Project & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

export const ProjectSchema = new mongoose.Schema<Project>(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      minlength: [2, "Project name must be at least 2 characters long"],
      maxlength: [200, "Project name cannot exceed 200 characters"],
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    agentId: {
      type: Schema.Types.ObjectId,
      ref: "Agent",
      required: [true, "Agent ID is required"],
    },
    assignedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        default: [],
      },
    ],
    billedTasks: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
    ratePerTask: {
      type: Number,
      default: 0,
      min: [0, "Rate per task cannot be negative"],
    },
    sourceLanguage: {
      type: String,
      required: [true, "Source language is required"],
      trim: true,
    },
    targetLanguage: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: [
        "human_translation",
        "post_editing",
        "text_classification",
        "sequence_tagging",
        "literary_translation",
        "error_marking",
        "translation_rating",
      ],
      required: [true, "Project type is required"],
    },
    status: {
      type: String,
      enum: ["draft", "in_progress", "completed", "cancelled"],
      default: "draft",
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
    },
    labels: [
      {
        type: String,
        default: Date.now,
        required: function () {
          return (
            this.type === "text_classification" ||
            this.type === "sequence_tagging"
          );
        },
      },
    ],
    errorCategories: [
      {
        type: String,
        default: Date.now,
        required: function () {
          return this.type === "error_marking";
        },
      },
    ],
    customCategories: [
      {
        type: customCategorySchema,
        default: Date.now,
        required: function () {
          return this.type === "translation_rating";
        },
      },
    ],
    confidenceThreshold: {
      type: Number,
      required: function () {
        return this.type === "text_classification";
      },
    },
  },
  {
    timestamps: true,
  }
);

export const ProjectModel =
  mongoose.models.Project || mongoose.model<Project>("Project", ProjectSchema);
