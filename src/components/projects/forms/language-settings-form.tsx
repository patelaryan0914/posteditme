"use client";

import {
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import {
  INDIAN_LANGUAGES,
  INTERNATIONAL_LANGUAGES,
} from "@/lib/constant/constant";
import { Globe2, Languages } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { z } from "zod";
import { projectFormSchema } from "@/lib/zod-schema";

interface LanguageSettingsFormProps {
  form: UseFormReturn<z.infer<typeof projectFormSchema>>;
  isSubmitting: boolean;
  projectType: string;
}

export function LanguageSettingsForm({
  form,
  isSubmitting,
  projectType,
}: LanguageSettingsFormProps) {
  const isClassificationOrTagging =
    projectType === "text_classification" ||
    projectType === "sequence_tagging" ||
    projectType === "error_marking";
  const sourceLanguage = form.watch("sourceLanguage");

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Language Settings</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {isClassificationOrTagging
              ? "Configure the language of content to be classified"
              : "Set up source and target languages for translation"}
          </p>
        </div>
      </div>

      <Card className="p-6">
        <div className="grid gap-8">
          {/* Source/Content Language */}
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-primary" />
                <h4 className="font-medium">
                  {isClassificationOrTagging
                    ? "Content Language"
                    : "Source Language"}
                </h4>
              </div>
              <p className="text-sm text-muted-foreground">
                {isClassificationOrTagging
                  ? "Select the language of the text to be classified"
                  : "Choose the original language of the content"}
              </p>
            </div>

            <FormField
              control={form.control}
              name="sourceLanguage"
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger className="w-[300px]">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel className="flex items-center gap-2 text-primary">
                          <Globe2 className="h-4 w-4" />
                          Indian Languages
                        </SelectLabel>
                        {INDIAN_LANGUAGES.map((language) => (
                          <SelectItem key={language} value={language}>
                            {language}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel className="flex items-center gap-2 text-primary">
                          <Languages className="h-4 w-4" />
                          International Languages
                        </SelectLabel>
                        {INTERNATIONAL_LANGUAGES.map((language) => (
                          <SelectItem key={language} value={language}>
                            {language}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Target Language (for translation projects only) */}
          {!isClassificationOrTagging && (
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Languages className="h-4 w-4 text-primary" />
                  <h4 className="font-medium">Target Language</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Select the language to translate the content into
                </p>
              </div>

              <FormField
                control={form.control}
                name="targetLanguage"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={isSubmitting || !sourceLanguage}
                    >
                      <FormControl>
                        <SelectTrigger className="w-[300px]">
                          <SelectValue
                            placeholder={
                              sourceLanguage
                                ? "Select target language"
                                : "Select source language first"
                            }
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel className="flex items-center gap-2 text-primary">
                            <Globe2 className="h-4 w-4" />
                            Indian Languages
                          </SelectLabel>
                          {INDIAN_LANGUAGES.filter(
                            (lang) => lang !== sourceLanguage
                          ).map((language) => (
                            <SelectItem key={language} value={language}>
                              {language}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                        <SelectGroup>
                          <SelectLabel className="flex items-center gap-2 text-primary">
                            <Languages className="h-4 w-4" />
                            International Languages
                          </SelectLabel>
                          {INTERNATIONAL_LANGUAGES.filter(
                            (lang) => lang !== sourceLanguage
                          ).map((language) => (
                            <SelectItem key={language} value={language}>
                              {language}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
