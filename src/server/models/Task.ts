import mongoose, { Schema, Types } from "mongoose";
import type {
  TranslationTaskData,
  PostEditingTaskData,
  ClassificationTaskData,
  SequenceTaggingTaskData,
  ErrorMarkingTaskData,
  TranslationRatingData,
} from "@/types/type";

export interface Task {
  name: string;
  description: string;
  text: string;
  projectId: Types.ObjectId;
  assignedTo?: Types.ObjectId;
  status: "pending" | "in_progress" | "review" | "completed";
  priority: "low" | "medium" | "high";
  dueDate?: Date;
  translationData?: TranslationTaskData;
  postEditingData?: PostEditingTaskData;
  classificationData?: ClassificationTaskData;
  sequenceTaggingData?: SequenceTaggingTaskData;
  errorMarkingData?: ErrorMarkingTaskData;
  translationRatingData?: TranslationRatingData;
}

export interface MongoTask extends Task, mongoose.Document {}

export type TTask = Task & {
  _id: string;
  createdAt: string;
  updatedAt: string;
};

const TaskSchema = new mongoose.Schema<Task>(
  {
    name: {
      type: String,
      required: [true, "Task name is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project ID is required"],
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["pending", "in_progress", "review", "completed"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    dueDate: {
      type: Date,
    },
    translationData: {
      type: Object,
    },
    postEditingData: {
      type: Object,
    },
    classificationData: {
      text: { type: String },
      selectedLabels: [{ type: String }],
      confidence: { type: Number },
      notes: { type: String },
    },
    sequenceTaggingData: {
      type: Object,
    },
    errorMarkingData: {
      type: Object,
    },
    translationRatingData: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);

export const TaskModel =
  mongoose.models.Task || mongoose.model<Task>("Task", TaskSchema);
