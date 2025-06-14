"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Header } from "@/components/dashboard/header";
import { ProjectForm } from "@/components/projects/project-form";
import { trpc } from "@/app/_trpc/client";
import { Project } from "@/types/type";
import { Skeleton } from "@/components/ui/skeleton";
import { ProjectList } from "@/components/projects/project-list";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export default function ProjectsPage() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const {
    data: projectList,
    isLoading: projectLoading,
    refetch: projectRefetch,
  } = trpc.project.list.useQuery({});

  const handleSuccess = () => {
    setShowForm(false);
    setEditingProject(null);
    projectRefetch();
  };
  const deleteProject = trpc.project.delete.useMutation();

  if (projectLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header email={user?.email || ""} isAgentAdmin={true} />
        <main className="container mx-auto p-8">
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-16 w-full" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header email={user?.email || ""} isAgentAdmin={true} />
      <main className="container mx-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Projects</h1>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>

        {showForm && (
          <div className="mb-6">
            <ProjectForm
              initialData={editingProject || undefined}
              onCancel={() => {
                setShowForm(false);
                setEditingProject(null);
              }}
              onSuccess={handleSuccess}
            />
          </div>
        )}

        <div className="bg-card rounded-lg shadow">
          <ProjectList
            projects={projectList?.items || []}
            onEdit={(project) => {
              setEditingProject(project);
              setShowForm(true);
            }}
            onDelete={async (projectId: string) => {
              try {
                await deleteProject.mutateAsync(projectId);
                toast.success("Project deleted successfully");
                projectRefetch();
              } catch (error) {
                toast.error("Failed to delete project");
                console.error(error);
              }
            }}
          />
        </div>
      </main>
    </div>
  );
}
