"use client";

import { useParams } from "next/navigation";
import { Header } from "@/components/dashboard/header";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, ArrowLeft, Download } from "lucide-react";
import { toast } from "sonner";
import type { Task } from "@/types/type";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { trpc } from "@/app/_trpc/client";
import { TaskForm } from "@/components/tasks/task-form";
import { TaskList } from "@/components/tasks/task-list";
import { useState } from "react";
export default function ProjectDetailsPage() {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { data: projectData, isLoading: projectLoading } =
    trpc.project.getById.useQuery({ id });
  const { data: usersData, isLoading: userLoading } =
    trpc.auth.getAll.useQuery();
  const { data: projectTasks = [], refetch: refetchTasks } =
    trpc.task.getByProjectId.useQuery({ projectId: id });

  const createTask = trpc.task.create.useMutation();

  const deleteTask = trpc.task.delete.useMutation();

  const updateStatus = trpc.task.updateStatus.useMutation();

  const assignTask = trpc.task.assignTask.useMutation();

  const bulkAssign = trpc.task.bulkAssign.useMutation();

  const bulkUnassign = trpc.task.bulkUnassign.useMutation();
  const handleDownloadAllAnnotations = async () => {
    if (!projectData?.project || !projectTasks.length) return;

    try {
      const projectAnnotations = {
        projectId: projectData.project._id,
        projectName: projectData.project.name,
        agentId: projectData.project.agentId._id,
        agentName: projectData.project.agentId.name,
        adminId: user?._id || "Unknown Admin",
        adminEmail: user?.email || "Unknown Admin",
        exportDate: new Date().toISOString(),
        tasks: projectTasks.map((task) => ({
          taskId: task._id,
          name: task.name,
          description: task.description,
          status: task.status,
          priority: task.priority,
          assignedTo:
            usersData?.users.find((u) => u._id === task.assignedTo)?.email ||
            "Unassigned",
          dueDate: task.dueDate
            ? new Date(task.dueDate).toISOString().split("T")[0]
            : "No due date",
          createdAt: task.createdAt
            ? new Date(task.createdAt).toISOString()
            : "Unknown",
          updatedAt: task.updatedAt
            ? new Date(task.updatedAt).toISOString()
            : "Unknown",
          classification: task.classificationData
            ? {
                text: task.classificationData.text || "",
                selectedLabels: task.classificationData.selectedLabels || [],
                confidence: task.classificationData.confidence,
                notes: task.classificationData.notes || "",
              }
            : undefined,
          translation: task.translationData,
          postEditing: task.postEditingData,
          sequenceTagging: task.sequenceTaggingData,
          translationRating: task.translationRatingData,
        })),
      };

      const blob = new Blob([JSON.stringify(projectAnnotations, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `project-${
        projectData.project._id
      }-${projectData.project.name
        .toLowerCase()
        .replace(/\s+/g, "-")}-annotations.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("Project annotations downloaded successfully");
    } catch (error) {
      console.error("Error downloading annotations:", error);
      toast.error("Failed to download annotations");
    }
  };
  if (userLoading || projectLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-background">
        <Header email={user?.email || ""} isAgentAdmin={true} />
        <main className="container mx-auto p-8">
          <TaskForm
            project={projectData?.project}
            onSubmit={async (values) => {
              try {
                setLoading(true);
                await createTask.mutateAsync(values);
                refetchTasks();
              } catch (error) {
                console.error("Error creating task:", error);
                toast.error("Failed to create task");
              } finally {
                setLoading(false);
                setShowForm(false);
              }
            }}
            onCancel={() => {
              setShowForm(false);
              setEditingTask(null);
            }}
            initialData={editingTask}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header email={user?.email || ""} isAgentAdmin={true} />
      <main className="container mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/agent/projects">
              <Button variant="ghost" className="flex items-center gap-2 mb-4">
                <ArrowLeft className="h-4 w-4" />
                Back to Projects
              </Button>
            </Link>
            <h2 className="text-3xl font-bold">{projectData?.project?.name}</h2>
            <p className="text-muted-foreground mt-2">
              {projectData?.project?.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleDownloadAllAnnotations}>
              <Download className="h-4 w-4 mr-2" />
              Download All Annotations
            </Button>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </div>
        </div>

        {/* Project Statistics */}
        <div className="mb-8">
          {/* <ProjectStats tasks={projectTasks} users={users} /> */}
        </div>

        {/* Project Billing */}
        <div className="mb-8">
          {/* <ProjectBilling 
            tasks={tasks}
            users={users}
            billingRecords={billingRecords}
            onSaveRate={handleSaveRate}
            onGenerateBill={handleGenerateBill}
            onAllowRegeneration={handleAllowRegeneration}
            onUpdatePaymentStatus={handleUpdatePaymentStatus}
            onDeleteBill={handleDeleteBill}
            currentRate={project.ratePerTask}
          /> */}
        </div>

        <TaskList
          tasks={projectTasks}
          users={usersData?.users || []}
          onEdit={(task: Task) => {
            setEditingTask(task);
            setShowForm(true);
          }}
          onDelete={async (taskId: string) => {
            try {
              setLoading(true);
              await deleteTask.mutateAsync({ id: taskId });
              toast.success("Task deleted successfully");
            } catch (error) {
              console.error("Error deleting task:", error);
              toast.error("Failed to delete task");
            } finally {
              setLoading(false);
            }
          }}
          onStatusChange={async (
            taskId: string,
            status:
              | "in_progress"
              | "completed"
              | "pending"
              | "review"
              | "rejected"
          ) => {
            try {
              await updateStatus.mutateAsync({
                taskId,
                status: status,
              });
              toast.success("Task updated successfully");
              refetchTasks();
            } catch (error) {
              console.error("Error updating task status:", error);
            }
          }}
          onAssign={async (taskId, userId) => {
            try {
              await assignTask.mutateAsync({ taskId, userId });
              toast.success("Task assigned successfully");
              refetchTasks();
            } catch (error) {
              toast.error("Failed to assign task");
              console.error(error);
            }
          }}
          onBulkAssign={async (taskIds: string[], userId: string) => {
            try {
              await bulkAssign.mutateAsync({ taskIds, userId });
              toast.success("Tasks assigned successfully");
              refetchTasks();
            } catch (error) {
              console.error("Error bulk assigning tasks:", error);
            }
          }}
          onBulkUnassign={async (taskIds: string[]) => {
            try {
              await bulkUnassign.mutateAsync({ taskIds });
              toast.success("Tasks unassigned successfully");
              refetchTasks();
            } catch (error) {
              console.error("Error bulk unassigning tasks:", error);
            }
          }}
        />
      </main>
    </div>
  );
}
