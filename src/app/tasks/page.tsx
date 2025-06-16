"use client";

import { Header } from "@/components/dashboard/header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ClipboardList,
  FileText,
  CheckCircle2,
  Clock,
} from "lucide-react";
import type { Task, Project, ProjectType } from "@/types/type";
import Link from "next/link";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { trpc } from "@/app/_trpc/client";
import { useAuth } from "@/lib/auth-context";

interface TaskWithProject extends Task {
  project: Project;
}

interface ProjectGroup {
  project: Project;
  tasks: TaskWithProject[];
}

interface TypeGroup {
  type: ProjectType;
  projects: ProjectGroup[];
  totalTasks: number;
  pendingTasks: number;
}

const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  human_translation: "Human Translation",
  post_editing: "Post-Editing",
  text_classification: "Text Classification",
  sequence_tagging: "Sequence Tagging",
  literary_translation: "Literary Translation",
  error_marking: "Error Marking",
  translation_rating: "Translation Rating",
};

export default function TasksPage() {
  const { user } = useAuth();

  // Fetch tasks using tRPC
  const { data: tasksData, isLoading } = trpc.task.getMyTasks.useQuery(
    undefined,
    {
      enabled: !!user?._id,
    }
  );

  // Transform tasks data into the required format
  const tasks =
    tasksData?.tasks?.map((task) => ({
      ...task,
      project: task.projectId as unknown as Project, // Assuming the project is populated
    })) || [];

  // Group tasks by project type and project
  const typeGroups = tasks.reduce<TypeGroup[]>((groups, task) => {
    const projectType = task.project?.type;
    if (!projectType) return groups;

    let typeGroup = groups.find((g) => g.type === projectType);
    if (!typeGroup) {
      typeGroup = {
        type: projectType,
        projects: [],
        totalTasks: 0,
        pendingTasks: 0,
      };
      groups.push(typeGroup);
    }

    let projectGroup = typeGroup.projects.find(
      (p) => p.project._id === task.project._id
    );
    if (!projectGroup) {
      projectGroup = {
        project: task.project,
        tasks: [],
      };
      typeGroup.projects.push(projectGroup);
    }

    projectGroup.tasks.push(task as TaskWithProject);
    typeGroup.totalTasks++;
    if (task.status === "pending") {
      typeGroup.pendingTasks++;
    }

    return groups;
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "review":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getTaskTypeUrl = (type: ProjectType, projectId: string,taskId:string="") => {
    switch (type) {
      case "text_classification":
        return `/tasks/classification${
          projectId ? `?projectId=${projectId}` : ""
        }`;
      case "translation_rating":
        return `/tasks/rating${projectId ? `?projectId=${projectId}` : ""}`;
      case "sequence_tagging":
        return `/tasks/tagging${projectId ? `?projectId=${projectId}` : ""}`;
      case "error_marking":
        return `/tasks/error-marking${
          projectId ? `?projectId=${projectId}` : ""
        }`;
      case "human_translation":
        return `/tasks/translation${
          projectId ? `?projectId=${projectId}&taskId=${taskId}` : ""
        }`;
      case "post_editing":
        return `/tasks/post-editing${
          projectId ? `?projectId=${projectId}` : ""
        }`;
      case "literary_translation":
        return `/tasks/literary${projectId ? `?projectId=${projectId}` : ""}`;
      default:
        return "#";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const pendingTasks = tasks.filter((task) => task.status === "pending");
  const inProgressTasks = tasks.filter((task) => task.status === "in_progress");
  const completedTasks = tasks.filter((task) => task.status === "completed");

  return (
    <div className="min-h-screen bg-background">
      <Header email={user?.email || ""} />
      <main className="container mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">My Tasks</h2>
            <p className="text-muted-foreground mt-2">
              View and manage your assigned tasks
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Tasks
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingTasks.length}</div>
              <p className="text-xs text-muted-foreground">
                Tasks waiting to be started
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Progress</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressTasks.length}</div>
              <p className="text-xs text-muted-foreground">
                Tasks currently being worked on
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedTasks.length}</div>
              <p className="text-xs text-muted-foreground">
                Successfully finished tasks
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tasks Grouped by Type and Project */}
        <div className="space-y-6">
          {typeGroups.map((group) => (
            <Card key={group.type}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle>{PROJECT_TYPE_LABELS[group.type]}</CardTitle>
                  <CardDescription>
                    {group.totalTasks} total tasks ({group.pendingTasks}{" "}
                    pending)
                  </CardDescription>
                </div>
                {group.pendingTasks > 0 && group.projects.length === 1 && (
                  <Link
                    href={getTaskTypeUrl(
                      group.type,
                      group.projects[0].project._id,
                    )}
                  >
                    <Button>
                      <ClipboardList className="h-4 w-4 mr-2" />
                      Start Working
                    </Button>
                  </Link>
                )}
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {group.projects.map((projectGroup) => (
                    <AccordionItem
                      key={projectGroup.project._id}
                      value={projectGroup.project._id}
                    >
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <h3 className="text-base font-medium text-left">
                              {projectGroup.project.name}
                            </h3>
                            <p className="text-sm text-muted-foreground text-left">
                              {projectGroup.tasks.length} tasks
                            </p>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="rounded-md border mt-2">
                          <table className="min-w-full divide-y divide-border">
                            <thead>
                              <tr className="bg-muted/50">
                                <th className="px-4 py-3 text-left text-sm font-medium">
                                  Task
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium">
                                  Status
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium">
                                  Due Date
                                </th>
                                <th className="px-4 py-3 text-left text-sm font-medium">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border bg-background">
                              {projectGroup.tasks.map((task) => (
                                <tr key={task._id}>
                                  <td className="px-4 py-4">{task.name}</td>
                                  <td className="px-4 py-4">
                                    <Badge
                                      className={getStatusColor(task.status)}
                                    >
                                      {task.status.replace("_", " ")}
                                    </Badge>
                                  </td>
                                  <td className="px-4 py-4">
                                    {format(task.dueDate, "MMM d, yyyy")}
                                  </td>
                                  <td className="px-4 py-4">
                                    <Link
                                      href={getTaskTypeUrl(
                                        group.type,
                                        projectGroup.project._id,
                                        task._id
                                      )}
                                    >
                                      <Button size="sm">
                                        {task.status === "completed"
                                          ? "View Task"
                                          : "Continue Work"}
                                      </Button>
                                    </Link>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
