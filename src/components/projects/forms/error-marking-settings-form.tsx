"use client";

import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Plus, X, AlertTriangle } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import { projectFormSchema } from "@/lib/zod-schema";
import { ERROR_CATEGORIES, ERROR_SEVERITIES } from "@/lib/constant/constant";

interface ErrorMarkingSettingsFormProps {
  form: UseFormReturn<z.infer<typeof projectFormSchema>>;
  isSubmitting: boolean;
}

export function ErrorMarkingSettingsForm({
  form,
  isSubmitting,
}: ErrorMarkingSettingsFormProps) {
  const addCategory = () => {
    const currentCategories = form.getValues("errorCategories") || [];
    form.setValue("errorCategories", [...currentCategories, ""]);
  };

  const removeCategory = (index: number) => {
    const currentCategories = form.getValues("errorCategories") || [];
    form.setValue(
      "errorCategories",
      currentCategories.filter((_, i) => i !== index)
    );
  };

  const errorCategories = form.watch("errorCategories") || ERROR_CATEGORIES;

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Error Marking Settings</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Configure error categories and severity levels
          </p>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {/* Error Categories */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-primary" />
                  <h4 className="font-medium">Error Categories</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Define categories for marking translation errors
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCategory}
                className="flex items-center gap-2"
                disabled={isSubmitting}
              >
                <Plus className="h-4 w-4" />
                Add Category
              </Button>
            </div>

            {/* Categories Preview */}
            {errorCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {errorCategories.map(
                  (category, index) =>
                    category && (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="px-3 py-1 text-sm"
                      >
                        {category}
                      </Badge>
                    )
                )}
              </div>
            )}

            {/* Category Inputs */}
            <div className="space-y-3 bg-muted/40 rounded-lg p-4">
              {errorCategories.map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                    {index + 1}
                  </div>
                  <FormField
                    control={form.control}
                    name={`errorCategories.${index}`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <div className="flex items-center gap-2">
                          <FormControl>
                            <input
                              type="text"
                              placeholder="Enter error category"
                              {...field}
                              disabled={isSubmitting}
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeCategory(index)}
                            disabled={isSubmitting}
                            className="shrink-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              ))}

              {errorCategories.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No categories added yet. Click &quot;Add Category&quot; to
                  start.
                </p>
              )}
            </div>
          </div>

          {/* Severity Levels */}
          <div className="space-y-4">
            <div className="space-y-1">
              <h4 className="font-medium flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-primary" />
                Error Severity Levels
              </h4>
              <p className="text-sm text-muted-foreground">
                Pre-defined severity levels for error classification
              </p>
            </div>

            <div className="grid gap-4">
              {ERROR_SEVERITIES.map((severity) => (
                <div
                  key={severity.value}
                  className="flex items-start gap-4 p-4 rounded-lg bg-muted/40"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary shrink-0">
                    {severity.value === "minor"
                      ? "L"
                      : severity.value === "major"
                      ? "M"
                      : "H"}
                  </div>
                  <div>
                    <h5 className="font-medium">{severity.label}</h5>
                    <p className="text-sm text-muted-foreground mt-1">
                      {severity.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
