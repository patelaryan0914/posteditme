"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Keyboard,
  Tag,
  Languages,
} from "lucide-react";
import { toast } from "sonner";
import type { Task, Project } from "@/types/type";
import Link from "next/link";
import { UserView } from "@/components/tasks/classification/user-view";
import { Badge } from "@/components/ui/badge";
import { RatingFramework } from "@/components/tasks/rating/frameworks";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/app/_trpc/client";
import { useAuth } from "@/lib/auth-context";
import { TranslationUserView } from "@/components/tasks/translation/user-view-traslation";
interface TranslationSegment {
  sourceText: string;
  translatedText?: string;
  comments?: string;
  reviewNotes?: string;
}
export default function TaskViewPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { id: taskId } = useParams<{ id: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [justification, setJustification] = useState<string>("");
  const [reviewNotes, setReviewNotes] = useState<string>("");
  const [projectTasks, setProjectTasks] = useState<Task[]>([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(-1);
  const { data: taskData, refetch: refetchTask } = trpc.task.getById.useQuery(
    { id: taskId as string },
    { enabled: !!taskId }
  );
  const { data: projectData, isLoading: projectLoading } =
    trpc.project.getById.useQuery(
      { id: task?.projectId as string },
      { enabled: !!task?.projectId }
    );
  const { data: tasksData, isLoading: tasksLoading } =
    trpc.task.getByProjectId.useQuery(
      { projectId: task?.projectId as string },
      { enabled: !!task?.projectId && !!user?._id }
    );
  const updateClassificationTask =
    trpc.task.updateClassificationTask.useMutation();

  useEffect(() => {
    if (taskData?.task) {
      setTask(taskData.task);
    }
  }, [taskData]);

  useEffect(() => {
    if (projectData?.project) {
      setProject(projectData.project);
    }
  }, [projectData]);

  useEffect(() => {
    if (tasksData) {
      setProjectTasks(tasksData);
      const currentIndex = tasksData.findIndex((t: Task) => t._id === taskId);
      setCurrentTaskIndex(currentIndex);
    }
  }, [tasksData, taskId]);

  const updateStatus = trpc.task.updateStatus.useMutation({});

  // Handle form submission
  const handleSubmit = async () => {
    if (!taskId) return;

    try {
      await updateStatus.mutateAsync({
        taskId: taskId as string,
        status: "completed",
      });
      refetchTask();
      toast.success("Task completed successfully");
      navigateToTask("next");
    } catch (error) {
      console.error("Error submitting task:", error);
      toast.error("Failed to submit task");
    }
  };

  // Navigate between tasks
  const navigateToTask = (direction: "prev" | "next") => {
    if (!projectTasks.length || currentTaskIndex === -1) return;

    let newIndex = currentTaskIndex;
    if (direction === "prev" && currentTaskIndex > 0) {
      newIndex = currentTaskIndex - 1;
    } else if (
      direction === "next" &&
      currentTaskIndex < projectTasks.length - 1
    ) {
      newIndex = currentTaskIndex + 1;
    } else {
      return;
    }

    const nextTask = projectTasks[newIndex];
    router.push(`/agent/projects/tasks/${nextTask._id}`);
  };

  if (projectLoading || tasksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!task || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Task not found</p>
      </div>
    );
  }

  const overallRating =
    Object.values(ratings).reduce((sum, val) => sum + val, 0) /
    (Object.values(ratings).length || 1);

  const handleClassificationSubmitTask = async (
    taskId: string,
    selectedLabels: string[],
    notes: string
  ) => {
    if (!user?._id) return;
    try {
      await updateClassificationTask.mutateAsync({
        taskId,
        updates: {
          status: "completed",
          classificationData: {
            selectedLabels,
            notes,
          },
        },
      });
      refetchTask();
      toast.success("Task completed successfully");
    } catch (error) {
      console.error("Error submitting task:", error);
      toast.error("Failed to submit task");
    }
  };
  const handleTranslationSubmitTask = async (
    taskId:string,index:number, translationData:TranslationSegment
  ) => {
    if (!user?._id) return;
    try {
      
      refetchTask();
      toast.success("Task completed successfully");
    } catch (error) {
      console.error("Error submitting task:", error);
      toast.error("Failed to submit task");
    }
  };
  const renderTaskInterface = () => {
    switch (project.type) {
      case "text_classification":
        return (
          <UserView
            tasks={tasksData || []}
            project={project}
            onSubmit={handleClassificationSubmitTask}
            currentIndex={currentTaskIndex}
          />
        );
      case "translation_rating":
        return (
          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="flex items-center gap-4">
              <Progress
                value={(currentTaskIndex / projectTasks.length) * 100}
                className="flex-1 h-2"
              />
              <span className="text-sm font-medium whitespace-nowrap">
                {currentTaskIndex + 1} of {projectTasks.length} tasks
              </span>
            </div>

            {/* Quick Actions */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 rounded-lg border border-blue-100 dark:border-blue-900">
              <div className="flex items-center gap-2 mb-2 text-blue-800 dark:text-blue-200">
                <Keyboard className="h-4 w-4" />
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
              </div>
            </div>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-medium">
                    Translation to Rate
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Languages className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {task.translationRatingData?.sourceLanguage} →{" "}
                      {task.translationRatingData?.targetLanguage}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Source Text</label>
                    <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 rounded-lg p-6 shadow-inner">
                      <p className="whitespace-pre-wrap text-lg leading-relaxed">
                        {task.translationRatingData?.sourceText}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Translation</label>
                    <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 rounded-lg p-6 shadow-inner">
                      <p className="whitespace-pre-wrap text-lg leading-relaxed">
                        {task.translationRatingData?.translatedText}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Rating</CardTitle>
              </CardHeader>
              <CardContent>
                <RatingFramework
                  framework={project.ratingFramework || "da"}
                  ratings={ratings}
                  setRatings={setRatings}
                  overallRating={overallRating}
                  project={project}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-medium">Feedback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Rating Justification
                  </label>
                  <Textarea
                    value={justification}
                    onChange={(e) => setJustification(e.target.value)}
                    placeholder="Explain your rating decisions..."
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Review Notes</label>
                  <Textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add any additional notes or suggestions..."
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => navigateToTask("prev")}
                disabled={currentTaskIndex === 0}
                className="w-[120px]"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={overallRating === 0}
                className="px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Submit and Continue
              </Button>

              <Button
                variant="outline"
                onClick={() => navigateToTask("next")}
                disabled={currentTaskIndex === projectTasks.length - 1}
                className="w-[120px]"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        );
      case "sequence_tagging":
        return <p>sequence_tagging</p>;
      case "human_translation":
          return <TranslationUserView  task={taskData?.task} onSaveTranslation={(taskId,index, translationData)=>{console.log(taskId,index, translationData);
          }}/>
          ;

      default:
        return (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Task interface not implemented for type: {project.type}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header email={user?.email || ""} isAgentAdmin={true} />
      <main className="container mx-auto p-8">
        <div className=" mx-auto">
          <div className="mb-8">
            <Link href={`/agent/projects/${project._id}`}>
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Project Tasks
              </Button>
            </Link>

            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold">{task.name}</h2>
                <div className="flex items-center gap-2 mt-2 text-muted-foreground">
                  <Tag className="h-4 w-4" />
                  <span>{project.type.replace(/_/g, " ")}</span>
                  {project.sourceLanguage && (
                    <>
                      <span>•</span>
                      <Languages className="h-4 w-4" />
                      <span>{project.sourceLanguage}</span>
                    </>
                  )}
                </div>
              </div>
              {project.type !== "human_translation" && <Badge
                variant={
                  task.status === "completed"
                    ? "default"
                    : task.status === "review"
                    ? "secondary"
                    : task.status === "in_progress"
                    ? "outline"
                    : "destructive"
                }
              >
                {task.status.replace(/_/g, " ")}
              </Badge>}
            </div>

            {renderTaskInterface()}
          </div>
        </div>
      </main>
    </div>
  );
}
