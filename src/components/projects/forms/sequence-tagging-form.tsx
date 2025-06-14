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
import { Plus, X, Tag } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import { projectFormSchema } from "@/lib/zod-schema";

interface SequenceTaggingFormProps {
  form: UseFormReturn<z.infer<typeof projectFormSchema>>;
  isSubmitting: boolean;
}

export function SequenceTaggingForm({
  form,
  isSubmitting,
}: SequenceTaggingFormProps) {
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
          <h3 className="text-lg font-semibold">Sequence Tagging Labels</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Define labels for tagging text sequences
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
                  <h4 className="font-medium">Tagging Labels</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Add labels that will be used to tag text sequences
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
                              placeholder="Enter label name (e.g., PERSON, LOCATION)"
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

          {/* Label Guidelines */}
          <div className="space-y-4 border-t pt-4">
            <h4 className="font-medium">Label Guidelines</h4>
            <div className="grid gap-4 text-sm">
              <div className="p-4 bg-muted rounded-lg">
                <h5 className="font-medium mb-2">Example Labels</h5>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>PERSON - Names of people</li>
                  <li>ORGANIZATION - Company or institution names</li>
                  <li>LOCATION - Place names</li>
                  <li>DATE - Dates and time expressions</li>
                  <li>PRODUCT - Product names</li>
                </ul>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <h5 className="font-medium mb-2">Best Practices</h5>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Use clear, descriptive label names</li>
                  <li>Keep labels consistent across tasks</li>
                  <li>Use uppercase for label names</li>
                  <li>Avoid overlapping label definitions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
