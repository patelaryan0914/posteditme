"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import type { Task, Project } from "@/types/type";
import { AdminView } from "@/components/tasks/classification/admin-view";
import { UserView } from "@/components/tasks/classification/user-view";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/app/_trpc/client";
import { useAuth } from "@/lib/auth-context";
import { TranslationUserView } from "@/components/tasks/translation/user-view-traslation";

interface TranslationSegment {
  sourceText: string;
  translatedText?: string;
  comments?: string;
  reviewNotes?: string;
}

export default function TranslationPage() {
  const router = useRouter();
  const searchParams = useSearchParams()
  
  const taskId = searchParams.get('taskId')
  const { user } = useAuth();
  const updateTranslationTask =
    trpc.task.updateTranslationTask.useMutation();

    const { data: taskData,isLoading:loading, refetch: refetchTask } = trpc.task.getById.useQuery(
      { id: taskId as string },
      { enabled: !!taskId }
    );
    console.log(taskId);
    
  const handleTranslationSubmitTask = async (
    taskId:string,
    index:number, 
    translationData:TranslationSegment
  ) => {
    if (!user?._id) return;
    try {
      await updateTranslationTask.mutateAsync({
        taskId,
        index,
        translationData: { ...translationData }
      })
      refetchTask();
      toast.success("Task saved successfully");
    } catch (error) {
      console.error("Error submitting task:", error);
      toast.error("Failed to submit task");
    }
  };

  const handleDownloadResults = () => {
    if (!taskData?.task.length) return;

    const csvHeaders = [
      "Task ID",
      "Completed At",
      "Assigned To",
      "Segment Index",
      "Source Text",
      "Translated Text",
      "Comments",
      "Review Notes"
    ];

    const taskIdStr = taskData.task._id || taskId || "";
    const completedAtStr = taskData.task.completedAt
      ? new Date(taskData.task.completedAt).toLocaleString()
      : "";
    const assignedToStr = taskData.task.assignedTo?.email || taskData.task.assignedTo || "";

    const csvRows = taskData.task.map((segment: TranslationSegment, idx: number) => [
      `"${taskIdStr}"`,
      `"${completedAtStr}"`,
      `"${assignedToStr}"`,
      idx + 1,
      `"${(segment.sourceText || "").replace(/"/g, '""')}"`,
      `"${(segment.translatedText || "").replace(/"/g, '""')}"`,
      `"${(segment.comments || "").replace(/"/g, '""')}"`,
      `"${(segment.reviewNotes || "").replace(/"/g, '""')}"`
    ]);

    const csvContent = [
      csvHeaders.join(","),
      ...csvRows.map((row:any) => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `translation-results-${taskIdStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!taskData || taskData.task.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          email={user?.email || ""}
          isAgentAdmin={user?.role === "agent_admin"}
        />
        <main className="container mx-auto p-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">
                  {user?.role === "agent_admin"
                    ? "No Translation tasks found in this project."
                    : "No Translation tasks assigned to you in this project."}
                </p>
                <Button className="mt-4" onClick={() => router.push("/tasks")}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Return to Tasks
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header
        email={user?.email || ""}
        isAgentAdmin={user?.role === "agent_admin"}
      />
      <main className="container mx-auto p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Button
              variant="ghost"
              className="mb-4"
              onClick={() => router.push("/tasks")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tasks
            </Button>

            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold">Translation Tasks</h2>
                {/* <p className="text-muted-foreground mt-2">{project.name}</p> */}
              </div>
              {user?.role === "agent_admin" && (
                <Button onClick={handleDownloadResults}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Download Results
                </Button>
              )}
            </div>

            <TranslationUserView task={taskData.task} onSaveTranslation={handleTranslationSubmitTask}/>
          </div>
        </div>
      </main>
    </div>
  );
}
