"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Loader2, Upload } from "lucide-react";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { taskFormSchema } from "@/lib/zod-schema";
import type { Task, Project } from "@/types/type";
import { useState } from "react";
import type { z } from "zod";
import { toast } from "sonner";

interface TaskFormProps {
  onSubmit: (values: z.infer<typeof taskFormSchema>) => Promise<void>;
  onCancel: () => void;
  initialData?: Task | null;
  project: Project;
}

export function TaskFormClassification({
  onSubmit,
  onCancel,
  initialData,
  project,
}: TaskFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileContent, setFileContent] = useState<string[]>([]);
  const [fileName, setFileName] = useState<string>("");
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const form = useForm<z.infer<typeof taskFormSchema>>({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      dueDate: initialData?.dueDate || new Date(),
      priority: initialData?.priority || "low",
      fileContent: [],
      projectId: initialData?.projectId || project._id,
    },
  });

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsProcessingFile(true);
    setFileName(file.name);
    try {
      const text = await file.text();
      const lines = text
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      setFileContent(lines);
      form.setValue("name", `Classification Task - ${file.name}`);
      form.setValue(
        "description",
        `Classification tasks from file: ${file.name}`
      );

      toast.success(`Loaded ${lines.length} text segments from file`);
    } catch (error) {
      console.error("Error reading file:", error);
      toast.error("Failed to read file. Please try again.");
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleSubmit = async (values: z.infer<typeof taskFormSchema>) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      if (fileContent.length > 0) {
        values.fileContent = fileContent;
      }
      onSubmit(values);
    } catch (error) {
      console.error("Form submission error:", error);
      form.setError("root", {
        message:
          "Failed to submit form. Please check all fields and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Button
          variant="ghost"
          onClick={onCancel}
          className="flex items-center gap-2"
          disabled={isSubmitting}
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h2 className="text-3xl font-bold">
            {initialData ? "Edit" : "Create"} Task
          </h2>
          <p className="text-muted-foreground mt-2">
            Add a task to this project
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-6"
            >
              {form.formState.errors.root && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                  {form.formState.errors.root.message}
                </div>
              )}

              <div className="grid gap-6">
                {/* File Upload for Text Classification */}
               
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Upload Text</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Upload a text file with one text segment per line. Each
                        line will become a separate classification task.
                      </p>
                      <div className="flex items-center gap-4">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            document.getElementById("file-upload")?.click()
                          }
                          disabled={isSubmitting || isProcessingFile}
                          className="w-[200px]"
                        >
                          {isProcessingFile ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload File
                            </>
                          )}
                        </Button>
                        <input
                          id="file-upload"
                          type="file"
                          accept=".txt"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                        {fileName && (
                          <span className="text-sm text-muted-foreground">
                            {fileName}
                          </span>
                        )}
                      </div>
                    </div>

                    {fileContent.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">
                          {fileContent.length} text segments loaded
                        </p>
                        <div className="max-h-[200px] overflow-y-auto space-y-4 rounded-lg border p-4">
                          {fileContent.slice(0, 5).map((text, index) => (
                            <div key={index} className="space-y-1">
                              <p className="text-sm font-medium">
                                Segment {index + 1}:
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {text}
                              </p>
                            </div>
                          ))}
                          {fileContent.length > 5 && (
                            <p className="text-sm text-muted-foreground">
                              ...and {fileContent.length - 5} more segments
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                

                {/* {!project.type.includes("classification") &&
                  !project.type.includes("rating") && (
                    <div className="grid gap-4">
                      <h3 className="text-lg font-medium">Basic Information</h3>
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Task Name</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter task name"
                                {...field}
                                disabled={isSubmitting}
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
                                placeholder="Describe the task"
                                className="min-h-[100px]"
                                {...field}
                                disabled={isSubmitting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )} */}

                {/* Priority Selection */}
                <div className="grid grid-cols-2 w-full ">
                <div>
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-medium">Priority Level</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Due Date */}
                <div>
                  <FormField
                    control={form.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-lg font-medium">Due Date</FormLabel>

                        <FormControl>
                          <Input
                            type="date"
                            value={field?.value?.toISOString().split("T")[0]}
                            onChange={(e) =>
                              field.onChange(new Date(e.target.value))
                            }
                            className="w-2/5"
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-6">
                <Button
                  variant="outline"
                  type="button"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isSubmitting || fileContent.length === 0
                  }
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {initialData ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>{initialData ? "Update" : "Create"} Task</>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
