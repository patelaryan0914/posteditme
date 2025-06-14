"use client";

import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Plus, X, Tag, Percent } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import { projectFormSchema } from "@/lib/zod-schema";

interface ClassificationSettingsFormProps {
  form: UseFormReturn<z.infer<typeof projectFormSchema>>;
  isSubmitting: boolean;
}

export function ClassificationSettingsForm({
  form,
  isSubmitting,
}: ClassificationSettingsFormProps) {
  const addLabel = () => {
    const currentLabels = form.getValues("labels") || [];
    form.setValue("labels", [...currentLabels, ""]);
  };

  const removeLabel = (index: number) => {
    const currentLabels = form.getValues("labels") || [];
    form.setValue(
      "labels",
      currentLabels.filter((_, i) => i !== index)
    );
  };

  const labels = form.watch("labels") || [];

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Classification Settings</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Define labels and confidence threshold for classification
          </p>
        </div>
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {/* Labels Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-primary" />
                  <h4 className="font-medium">Classification Labels</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Add labels that will be used to classify content
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addLabel}
                className="flex items-center gap-2"
                disabled={isSubmitting}
              >
                <Plus className="h-4 w-4" />
                Add Label
              </Button>
            </div>

            {/* Labels Preview */}
            {labels.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {labels.map(
                  (label, index) =>
                    label && (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="px-3 py-1 text-sm"
                      >
                        {label}
                      </Badge>
                    )
                )}
              </div>
            )}

            {/* Label Inputs */}
            <div className="space-y-3 bg-muted/40 rounded-lg p-4">
              {labels.map((_, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary">
                    {index + 1}
                  </div>
                  <FormField
                    control={form.control}
                    name={`labels.${index}`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <div className="flex items-center gap-2">
                          <FormControl>
                            <Input
                              placeholder="Enter label name"
                              {...field}
                              disabled={isSubmitting}
                              className="bg-background"
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeLabel(index)}
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

              {labels.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-2">
                  No labels added yet. Click &quot;Add Label&quot; to start.
                </p>
              )}
            </div>
          </div>

          {/* Confidence Threshold */}
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-primary" />
                <h4 className="font-medium">Confidence Settings</h4>
              </div>
              <p className="text-sm text-muted-foreground">
                Set the minimum confidence level required for classification
              </p>
            </div>

            <FormField
              control={form.control}
              name="confidenceThreshold"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center gap-4">
                    <FormControl className="w-[180px]">
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        placeholder="Enter threshold"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value))
                        }
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <span className="text-sm text-muted-foreground">
                      Current threshold: {field.value || 80}%
                    </span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}
