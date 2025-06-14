"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, X, Star, Sparkles } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import { projectFormSchema } from "@/lib/zod-schema";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RatingFrameworkFormProps {
  form: UseFormReturn<z.infer<typeof projectFormSchema>>;
  isSubmitting: boolean;
}

const RATING_FRAMEWORKS = [
  {
    id: "fluency",
    label: "Fluency Rating",
    description:
      "Evaluate how natural and fluent the translation reads in the target language",
    categories: [
      {
        id: "naturalness",
        label: "Naturalness",
        description: "How natural the translation sounds",
      },
      {
        id: "readability",
        label: "Readability",
        description: "Ease of reading and understanding",
      },
      {
        id: "grammar",
        label: "Grammar",
        description: "Grammatical correctness",
      },
    ],
  },
  {
    id: "adequacy",
    label: "Adequacy Rating",
    description:
      "Assess how well the translation preserves the meaning of the source text",
    categories: [
      {
        id: "completeness",
        label: "Completeness",
        description: "All information is preserved",
      },
      {
        id: "accuracy",
        label: "Accuracy",
        description: "Meaning is accurately conveyed",
      },
      {
        id: "consistency",
        label: "Consistency",
        description: "Consistent translation of terms",
      },
    ],
  },
  {
    id: "da",
    label: "Direct Assessment",
    description: "Single-score direct assessment of translation quality",
    categories: [
      {
        id: "quality",
        label: "Overall Quality",
        description: "Overall translation quality score",
      },
    ],
  },
  {
    id: "sqm",
    label: "Source Quality Metric",
    description: "Detailed error-based quality assessment",
    categories: [
      {
        id: "accuracy",
        label: "Accuracy",
        description: "Meaning transfer errors",
      },
      {
        id: "language",
        label: "Language",
        description: "Language quality issues",
      },
      {
        id: "terminology",
        label: "Terminology",
        description: "Term usage errors",
      },
      { id: "style", label: "Style", description: "Style guide compliance" },
      {
        id: "design",
        label: "Design",
        description: "Layout and formatting issues",
      },
    ],
  },
  {
    id: "custom",
    label: "Custom Framework",
    description: "Define your own rating categories",
    categories: [],
  },
];

export function RatingFrameworkForm({
  form,
  isSubmitting,
}: RatingFrameworkFormProps) {
  const selectedFramework = form.watch("ratingFramework");
  const customCategories = form.watch("customCategories") || [];

  const addCategory = () => {
    const currentCategories = form.getValues("customCategories") || [];
    form.setValue("customCategories", [
      ...currentCategories,
      { id: "", label: "", description: "" },
    ]);
  };

  const removeCategory = (index: number) => {
    const currentCategories = form.getValues("customCategories") || [];
    form.setValue(
      "customCategories",
      currentCategories.filter((_, i) => i !== index)
    );
  };

  const framework = RATING_FRAMEWORKS.find((f) => f.id === selectedFramework);

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Rating Framework</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Choose how translations will be evaluated
          </p>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {/* Framework Selection */}
          <div className="space-y-4">
            <div className="space-y-2">
              <FormField
                control={form.control}
                name="ratingFramework"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Framework Type</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a rating framework" />
                      </SelectTrigger>
                      <SelectContent>
                        {RATING_FRAMEWORKS.map((framework) => (
                          <SelectItem key={framework.id} value={framework.id}>
                            {framework.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>{framework?.description}</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Framework-specific UI */}
            {selectedFramework && (
              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium">Rating Categories</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedFramework === "custom"
                        ? "Define your custom rating categories"
                        : "Pre-defined categories for this framework"}
                    </p>
                  </div>
                  {selectedFramework === "custom" && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addCategory}
                      disabled={isSubmitting}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Category
                    </Button>
                  )}
                </div>

                <div className="space-y-4">
                  {selectedFramework === "custom" ? (
                    // Custom Framework UI
                    <div className="space-y-4">
                      {customCategories.map((category, index) => (
                        <div
                          key={index}
                          className="grid gap-4 p-4 bg-muted/40 rounded-lg"
                        >
                          <div className="flex items-center justify-between">
                            <h5 className="text-sm font-medium">
                              Category {index + 1}
                            </h5>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeCategory(index)}
                              disabled={isSubmitting}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid gap-4">
                            <FormField
                              control={form.control}
                              name={`customCategories.${index}.label`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Category Name</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g., Technical Accuracy"
                                      {...field}
                                      onChange={(e) => {
                                        field.onChange(e);
                                        // Update ID based on label
                                        const categories =
                                          form.getValues("customCategories") ||
                                          [];
                                        categories[index] = {
                                          ...categories[index],
                                          id: e.target.value
                                            .toLowerCase()
                                            .replace(/\s+/g, "-"),
                                        };
                                        form.setValue(
                                          "customCategories",
                                          categories
                                        );
                                      }}
                                      disabled={isSubmitting}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name={`customCategories.${index}.description`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Description</FormLabel>
                                  <FormControl>
                                    <Textarea
                                      placeholder="Describe what this category measures..."
                                      {...field}
                                      disabled={isSubmitting}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      ))}
                      {customCategories.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                          <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>Add categories to define your custom framework</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Pre-defined Framework UI
                    <div className="grid gap-4">
                      {framework?.categories.map((category) => (
                        <div
                          key={category.id}
                          className="flex items-start gap-4 p-4 bg-muted/40 rounded-lg"
                        >
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Star className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <h5 className="font-medium">{category.label}</h5>
                            <p className="text-sm text-muted-foreground mt-1">
                              {category.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
