"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { projectFormSchema } from "@/lib/zod-schema";
import { Loader2, X } from "lucide-react";
import { trpc } from "@/app/_trpc/client";
import { addDays } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LanguageSettingsForm } from "./forms/language-settings-form";
import { ClassificationSettingsForm } from "./forms/classification-settings-form";
import { SequenceTaggingForm } from "./forms/sequence-tagging-form";
import { ErrorMarkingSettingsForm } from "./forms/error-marking-settings-form";
import { RatingFrameworkForm } from "./forms/rating-framework-form";
import { Project } from "@/types/type";
import { useEffect, useState } from "react";

const PROJECT_TYPES = [
  { value: "human_translation", label: "Human Translation" },
  { value: "post_editing", label: "Post-Editing" },
  { value: "text_classification", label: "Text Classification" },
  { value: "sequence_tagging", label: "Sequence Tagging" },
  { value: "literary_translation", label: "Literary Translation" },
  { value: "error_marking", label: "Error Marking" },
  { value: "translation_rating", label: "Translation Rating" },
];

interface ProjectFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: Project;
}

export function ProjectForm({
  onSuccess,
  onCancel,
  initialData,
}: ProjectFormProps) {
  const isEditing = !!initialData?._id;
  const [agentId, setAgentId] = useState<string | null>(null);
  const form = useForm<z.infer<typeof projectFormSchema>>({
    resolver: zodResolver(projectFormSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      type: initialData?.type || "human_translation",
      startDate: initialData?.startDate || new Date(),
      dueDate: initialData?.dueDate || addDays(new Date(), 7),
      sourceLanguage: initialData?.sourceLanguage || "",
      targetLanguage: initialData?.targetLanguage || "",
      labels: initialData?.labels || [],
      confidenceThreshold: initialData?.confidenceThreshold || 0,
      assignedUsers: initialData?.assignedUsers || [],
      ratePerTask: initialData?.ratePerTask || 0,
      ratingFramework: initialData?.ratingFramework || "fluency",
      customCategories: initialData?.customCategories || [],
      errorCategories: initialData?.errorCategories || [],
      agentId: initialData?.agentId,
    },
  });
  const { data: agent, isLoading: agentLoading } =
    trpc.agent.getUserAgents.useQuery();
  const createProject = trpc.project.create.useMutation();
  const updateProject = trpc.project.update.useMutation();
  useEffect(() => {
    if (!agentLoading && agent?.agents?.length) {
      setAgentId(agent.agents[0]._id);
    }
  }, [agent, agentLoading]);
  const projectType = form.watch("type");
  const isClassification = projectType === "text_classification";
  const isSequenceTagging = projectType === "sequence_tagging";
  const isErrorMarking = projectType === "error_marking";
  const isTranslationRating = projectType === "translation_rating";

  const onSubmit = async (values: z.infer<typeof projectFormSchema>) => {
    try {
      if (isEditing) {
        await updateProject.mutateAsync({
          id: initialData?._id,
          ...values,
        });
      } else {
        await createProject.mutateAsync({ ...values, agentId: agentId! });
      }
    } catch (error) {
      console.log(error);
    }
    onSuccess();
    // Clean up data based on project type
    //   const cleanedValues = { ...values };

    //   // Remove empty labels and error categories
    //   if (cleanedValues.labels) {
    //     cleanedValues.labels = cleanedValues.labels.filter(label => label.trim() !== "");
    //   }

    //   // Remove target language for non-translation projects
    //   if (!isTranslationProject) {
    //     delete cleanedValues.targetLanguage;
    //   }

    //   if (isEditing && initialData?.id) {
    //     await updateProject.mutateAsync({
    //       id: initialData.id,
    //       ...cleanedValues
    //     });
    //   } else {
    //     await createProject.mutateAsync(cleanedValues);
    //   }
    // } catch (error) {
    //   console.error("Error saving project:", error);
    //   toast.error("Failed to save project. Please try again.");
    // }
  };

  const isLoading = createProject.isPending || updateProject.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {isEditing ? "Edit Project" : "Create New Project"}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          disabled={isLoading}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter project name"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter project description"
                      {...field}
                      disabled={isLoading}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select project type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PROJECT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <LanguageSettingsForm
              form={form}
              isSubmitting={isLoading}
              projectType={projectType}
            />

            {isClassification && (
              <ClassificationSettingsForm
                form={form}
                isSubmitting={isLoading}
              />
            )}

            {isSequenceTagging && (
              <SequenceTaggingForm form={form} isSubmitting={isLoading} />
            )}

            {isErrorMarking && (
              <ErrorMarkingSettingsForm form={form} isSubmitting={isLoading} />
            )}

            {isTranslationRating && (
              <RatingFrameworkForm form={form} isSubmitting={isLoading} />
            )}
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update" : "Create"} Project
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
