"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

interface ClassificationTask extends Task {
  project: Project;
}

export default function ClassificationPage() {
  const router = useRouter();
  const { id: projectId } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<ClassificationTask[]>([]);
  const [project, setProject] = useState<Project | null>(null);

  // Fetch project and tasks using tRPC
  const { data: projectData, error: projectError } =
    trpc.project.getById.useQuery(
      { id: projectId || "" },
      { enabled: !!projectId }
    );

  const {
    data: tasksData,
    error: tasksError,
    refetch: refetchTasks,
  } = trpc.task.getByProjectId.useQuery(
    { projectId: projectId || "" },
    { enabled: !!projectId && !!user?._id }
  );

  // Handle project data changes
  useEffect(() => {
    if (projectData?.project) {
      setProject(projectData?.project);
    }
  }, [projectData]);

  // Handle tasks data changes
  useEffect(() => {
    if (tasksData && projectData) {
      const tasksWithProject = tasksData.map((task) => ({
        ...task,
        project: projectData,
      }));
      setTasks(tasksWithProject);
      setLoading(false);
    }
  }, [tasksData, projectData]);

  // Handle errors
  useEffect(() => {
    if (projectError) {
      console.error("Error loading project:", projectError);
      toast.error("Failed to load project");
      router.push("/tasks");
    }

    if (tasksError) {
      console.error("Error loading tasks:", tasksError);
      toast.error("Failed to load tasks");
      setLoading(false);
    }
  }, [projectError, tasksError, router]);

  // Update task status mutation
  const updateTaskStatus = trpc.task.updateStatus.useMutation();
  const updateClassificationTask =
    trpc.task.updateClassificationTask.useMutation();

  // Handle mutation side effects
  useEffect(() => {
    if (updateTaskStatus.isSuccess) {
      refetchTasks();
      toast.success("Task updated successfully");
    }
    if (updateTaskStatus.isError) {
      console.error("Error updating task:", updateTaskStatus.error);
      toast.error("Failed to update task");
    }
  }, [
    updateTaskStatus.isSuccess,
    updateTaskStatus.isError,
    updateTaskStatus.error,
    refetchTasks,
  ]);

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
      refetchTasks();
      toast.success("Task completed successfully");
    } catch (error) {
      console.error("Error submitting task:", error);
      toast.error("Failed to submit task");
    }
  };

  const handleDownloadResults = () => {
    if (!project || !tasks.length) return;

    const csvContent = [
      [
        "Task ID",
        "Text",
        "Labels",
        "Notes",
        "Status",
        "Completed At",
        "Assigned To",
      ],
      ...tasks.map((task) => [
        task._id,
        task.classificationData?.text,
        task.classificationData?.selectedLabels?.join(";") || "",
        task.classificationData?.notes || "",
        task.status,
        task.status === "completed" ? new Date().toISOString() : "",
        task.assignedTo?.toString() || "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `classification-results-${project.name
      .toLowerCase()
      .replace(/\s+/g, "-")}.csv`;
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

  if (!project || tasks.length === 0) {
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
                    ? "No classification tasks found in this project."
                    : "No classification tasks assigned to you in this project."}
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
                <h2 className="text-3xl font-bold">Classification Tasks</h2>
                <p className="text-muted-foreground mt-2">{project.name}</p>
              </div>
              {user?.role === "agent_admin" && (
                <Button onClick={handleDownloadResults}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Download Results
                </Button>
              )}
            </div>

            {user?.role === "agent_admin" ? (
              <AdminView
                tasks={tasks}
                onDownloadResults={handleDownloadResults}
              />
            ) : (
              <UserView
                tasks={tasks}
                project={project}
                onSubmit={handleClassificationSubmitTask}
                currentIndex={0}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
