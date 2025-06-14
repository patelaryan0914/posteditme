export interface Agent {
  _id: string;
  name: string;
  description: string;
  adminIds: UserData[];
  userIds: UserData[];
  createdAt: Date;
  updatedAt: Date;
  status: "active" | "inactive" | "suspended";
  primaryLanguage?: string;
  taskType?: string;
  taskDomain?: string;
  maxProjects?: number;
}

export interface UserData {
  _id: string;
  email?: string;
  role?: string;
  status?: "active" | "inactive" | "suspended";
  approved?: boolean;
  createdAt?: Date;
}

export type ProjectStatus = "draft" | "in_progress" | "completed" | "cancelled";
export type TaskStatus = "pending" | "in_progress" | "review" | "completed";
export type TaskPriority = "low" | "medium" | "high";
export type PaymentStatus = "paid" | "unpaid";

export type ProjectType =
  | "human_translation"
  | "post_editing"
  | "text_classification"
  | "sequence_tagging"
  | "literary_translation"
  | "error_marking"
  | "translation_rating";

export type RatingFramework = "fluency" | "adequacy" | "da" | "sqm" | "custom";

export interface Project {
  _id: string;
  agentId: string;
  name: string;
  description: string;
  type: ProjectType;
  status: ProjectStatus;
  startDate: Date;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  // Language settings
  sourceLanguage?: string;
  targetLanguage?: string;
  // Classification settings
  labels?: string[];
  confidenceThreshold?: number;
  // Error marking settings
  errorCategories?: string[];
  // Rating settings
  ratingFramework?: RatingFramework;
  customCategories?: Array<{
    id: string;
    label: string;
    description: string;
  }>;
  assignedUsers: string[];
  ratePerTask?: number;
  billedTasks?: { [taskId: string]: boolean };
}

export interface TranslationTaskData {
  sourceText: string;
  translatedText: string;
  comments?: string;
  reviewNotes?: string;
}

export interface PostEditingTaskData {
  sourceText: string;
  machineTranslation: string;
  editedTranslation: string;
  editDistance?: number;
  qualityScore?: number;
}

export interface ClassificationTaskData {
  text: string;
  selectedLabels: string[];
  confidence: number;
  notes?: string;
}

export interface SequenceTaggingTaskData {
  text: string;
  tags: Array<{
    start: number;
    end: number;
    label: string;
  }>;
  notes?: string;
}

export interface ErrorMarkingTaskData {
  sourceText: string;
  translatedText: string;
  errors: Array<{
    start: number;
    end: number;
    category: string;
    severity: "minor" | "major" | "critical";
    comment?: string;
  }>;
  qualityScore?: number;
  reviewNotes?: string;
}

export interface TranslationRatingData {
  sourceText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  rating: number;
  categories: Record<string, number>;
  reviewNotes?: string;
  justification?: string;
  metadata?: {
    sentenceFrom?: string;
    translatedBy?: string;
    translationDate?: string;
    notes?: string;
  };
}

export interface Task {
  _id: string;
  projectId: string;
  name: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignedTo?: string;
  dueDate: Date;
  createdAt: Date;
  updatedAt: Date;
  billed?: boolean;
  ratePerTask: number;
  // Type-specific data
  translationData?: TranslationTaskData;
  postEditingData?: PostEditingTaskData;
  classificationData?: ClassificationTaskData;
  sequenceTaggingData?: SequenceTaggingTaskData;
  errorMarkingData?: ErrorMarkingTaskData;
  translationRatingData?: TranslationRatingData;
}

export interface BillingRecord {
  id: string;
  userId: string;
  projectId: string;
  taskIds: string[];
  amount: number;
  generatedAt: Date;
  regenerationAllowed?: boolean;
  paymentStatus: PaymentStatus;
  paymentDate?: Date;
  paymentNotes?: string;
}
