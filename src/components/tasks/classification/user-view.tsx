"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import type { Task, Project } from "@/types/type";

interface UserViewProps {
  tasks: Task[];
  project: Project;
  onSubmit: (
    taskId: string,
    selectedLabels: string[],
    notes: string
  ) => Promise<void>;
  currentIndex: number | null;
}

const LABEL_COLORS = [
  "bg-pink-100 hover:bg-pink-200 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
  "bg-purple-100 hover:bg-purple-200 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  "bg-indigo-100 hover:bg-indigo-200 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
  "bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  "bg-cyan-100 hover:bg-cyan-200 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200",
  "bg-teal-100 hover:bg-teal-200 text-teal-800 dark:bg-teal-900 dark:text-teal-200",
  "bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200",
  "bg-yellow-100 hover:bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  "bg-orange-100 hover:bg-orange-200 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  "bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200",
];

export function UserView({
  tasks,
  project,
  onSubmit,
  currentIndex,
}: UserViewProps) {
  const [currentTaskIndex, setCurrentTaskIndex] = useState(currentIndex || 0);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>("");
  // const [activeTab, setActiveTab] = useState<"pending" | "completed">("pending");
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(true);

  const currentTask = tasks[currentTaskIndex];

  const totalTasks = tasks.length;
  const progress = ((currentTaskIndex + 1) / totalTasks) * 100;

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLTextAreaElement) return;

      if (e.key === "ArrowLeft" && currentTaskIndex > 0) {
        navigateTask("prev");
      } else if (
        e.key === "ArrowRight" &&
        currentTaskIndex < tasks.length - 1
      ) {
        navigateTask("next");
      } else if (e.key === "Enter" && selectedLabels.length > 0) {
        handleSubmit();
      } else if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        setShowKeyboardShortcuts((prev) => !prev);
      } else if (e.key === "Escape") {
        setShowKeyboardShortcuts(false);
      }
      // Label selection shortcuts (1-9)
      else if (e.key >= "1" && e.key <= "9") {
        const index = parseInt(e.key) - 1;
        const label = project.labels?.[index];
        if (label) {
          handleLabelToggle(label);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentTaskIndex, tasks.length, selectedLabels]);

  useEffect(() => {
    if (currentTask) {
      setSelectedLabels(currentTask.classificationData?.selectedLabels || []);
      setNotes(currentTask.classificationData?.notes || "");
    }
  }, [currentTask]);

  // useAutosave({
  //   data: { selectedLabels, notes },
  //   onSave: saveTask,
  //   interval: 3000
  // });

  const handleLabelToggle = (label: string) => {
    setSelectedLabels((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const handleSubmit = async () => {
    if (!currentTask) return;
    try {
      await onSubmit(currentTask._id, selectedLabels, notes);
      if (currentTaskIndex < tasks.length - 1) {
        setCurrentTaskIndex((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error submitting task:", error);
    }
  };

  const navigateTask = (direction: "prev" | "next") => {
    if (direction === "prev" && currentTaskIndex > 0) {
      setCurrentTaskIndex((prev) => prev - 1);
    } else if (direction === "next" && currentTaskIndex < tasks.length - 1) {
      setCurrentTaskIndex((prev) => prev + 1);
    }
  };

  return (
    <div className="space-y-6">
      {currentTask ? (
        <>
          <div className="flex items-center gap-4 mb-4">
            <Progress value={progress} className="flex-1 h-2" />
            <span className="text-sm font-medium whitespace-nowrap">
              {currentTaskIndex + 1} of {totalTasks} tasks
            </span>
          </div>

          {/* Quick Actions */}
          {showKeyboardShortcuts && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-lg border border-blue-100 dark:border-blue-900 mb-6">
              <div className="flex items-center gap-2 mb-2 text-blue-800 dark:text-blue-200">
                <Sparkles className="h-4 w-4" />
                <h3 className="text-sm font-medium">Quick Actions</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-blue-700 dark:text-blue-300">
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded shadow">
                    ←
                  </kbd>
                  <span>Previous task</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded shadow">
                    →
                  </kbd>
                  <span>Next task</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded shadow">
                    1-9
                  </kbd>
                  <span>Select labels</span>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded shadow">
                    Enter
                  </kbd>
                  <span>Submit task</span>
                </div>
              </div>
            </div>
          )}

          {/* Classification Interface */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">
                    Text to Classify
                  </CardTitle>
                  <Button
                    onClick={() =>
                      setShowKeyboardShortcuts(!showKeyboardShortcuts)
                    }
                  >
                    {showKeyboardShortcuts
                      ? "Hide Keyboard Shortcuts"
                      : "Show Keyboard Shortcuts"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 rounded-lg p-6 shadow-inner">
                  <p className="whitespace-pre-wrap text-lg leading-relaxed">
                    {currentTask.classificationData?.text}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">
                  Classification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Labels (1-9 to select)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {project.labels?.map((label, index) => (
                      <Badge
                        key={label}
                        variant="outline"
                        className={`cursor-pointer transition-all transform hover:scale-105 px-4 py-2 text-base font-medium ${
                          selectedLabels.includes(label)
                            ? LABEL_COLORS[index % LABEL_COLORS.length]
                            : "hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                        onClick={() => handleLabelToggle(label)}
                      >
                        {index + 1}. {label}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Notes (optional)
                  </label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any notes about your classification..."
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => navigateTask("prev")}
                disabled={currentTaskIndex === 0}
                className="w-[120px]"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={selectedLabels.length === 0}
                className="px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {currentTask.status === "completed"
                  ? "Update Task"
                  : "Submit and Continue"}
              </Button>

              <Button
                variant="outline"
                onClick={() => navigateTask("next")}
                disabled={currentTaskIndex === tasks.length - 1}
                className="w-[120px]"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <h3 className="text-lg font-medium">No Tasks Available</h3>
              <p className="text-muted-foreground mt-2">
                There are no tasks to display at this time.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
