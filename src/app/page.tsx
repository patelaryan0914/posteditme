"use client";

import React from "react";
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
  Building2,
  Users,
  ClipboardList,
  BarChart2,
  Settings,
  ArrowRight,
  IndianRupee,
  Clock,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { trpc } from "./_trpc/client";
import { useAuth } from "@/lib/auth-context";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: userData, isLoading: userLoading } = trpc.auth.getMe.useQuery(
    undefined,
    {
      retry: false,
    }
  );

  // Fetch user's tasks
  const { data: tasksData, isLoading: tasksLoading } =
    trpc.task.getMyAdminTasks.useQuery(undefined, {
      enabled: !!user?._id,
    });

  // Calculate stats from tasks
  const userStats = React.useMemo(() => {
    if (!tasksData)
      return {
        pendingTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0,
        totalEarnings: 0,
      };
    console.log(tasksData);

    return tasksData.tasks.reduce(
      (acc, task) => {
        if (task.status === "pending") acc.pendingTasks++;
        if (task.status === "in_progress") acc.inProgressTasks++;
        if (task.status === "completed") acc.completedTasks++;

        // Calculate earnings if task is completed and has rate information
        if (
          task.status === "completed" &&
          task.projectId &&
          typeof task.projectId === "object"
        ) {
          const project = task.projectId as any; // Cast to any to access ratePerTask
          if (project.ratePerTask) {
            acc.totalEarnings += project.ratePerTask;
          }
        }

        return acc;
      },
      {
        pendingTasks: 0,
        inProgressTasks: 0,
        completedTasks: 0,
        totalEarnings: 0,
      }
    );
  }, [tasksData]);
  const recentTasks = React.useMemo(() => {
    if (!tasksData) return [];

    return [...tasksData.tasks]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5)
      .map((task) => ({
        id: task._id.toString(),
        name: task.name,
        status: task.status,
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        project: {
          id:
            typeof task.projectId === "object"
              ? (task.projectId as any)._id?.toString()
              : task.projectId?.toString() || "",
          name:
            typeof task.projectId === "object"
              ? (task.projectId as any).name
              : "No Project",
          ratePerTask:
            typeof task.projectId === "object"
              ? (task.projectId as any).ratePerTask
              : 0,
        },
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
      }));
  }, [tasksData]);

  // Loading state
  const isSystemAdmin = userData?.user.role === "system_admin";
  const isAgentAdmin = userData?.user.role === "agent_admin";

  const { data: agentStats, isLoading: agentStatsLoading } =
    trpc.agent.getAgentStats.useQuery(undefined, {
      enabled: isAgentAdmin, // Only fetch if user is an agent admin
    });

  // Update the stats object to use the agent stats
  const stats = {
    activeProjects: agentStats?.projectCount || 0,
    teamMembers: agentStats?.memberCount || 0,
    completedTasks: userStats.completedTasks,
    monthlySpending: userStats.totalEarnings,
  };
  if (userLoading || tasksLoading || (isAgentAdmin && agentStatsLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  if (isSystemAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header email={user?.email || ""} isSystemAdmin={true} />
        <main className="container mx-auto p-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">System Admin Dashboard</h2>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Link href="/admin/agents">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-blue-600" />
                        Manage Agents
                      </CardTitle>
                      <ArrowRight className="h-5 w-5 text-blue-600" />
                    </div>
                    <CardDescription>
                      Create and manage translation agents
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/admin/users">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-emerald-600" />
                        Manage Users
                      </CardTitle>
                      <ArrowRight className="h-5 w-5 text-emerald-600" />
                    </div>
                    <CardDescription>
                      View and manage user accounts
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/admin/settings">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-purple-600" />
                        System Settings
                      </CardTitle>
                      <ArrowRight className="h-5 w-5 text-purple-600" />
                    </div>
                    <CardDescription>
                      Configure system preferences
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }
  if (isAgentAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header email={user?.email || ""} isAgentAdmin={true} />
        <main className="container mx-auto p-8">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Agent Dashboard</h2>

            <div className="grid gap-6 md:grid-cols-4 mb-8">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-100 dark:border-blue-900">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Projects
                  </CardTitle>
                  <ClipboardList className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                    {stats.activeProjects}
                  </div>
                  <p className="text-xs text-blue-600/80 dark:text-blue-400/80">
                    Current ongoing projects
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-green-100 dark:border-green-900">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Team Members
                  </CardTitle>
                  <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                    {stats.teamMembers}
                  </div>
                  <p className="text-xs text-green-600/80 dark:text-green-400/80">
                    Active employees
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 border-purple-100 dark:border-purple-900">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Completed Tasks
                  </CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                    {stats.completedTasks}
                  </div>
                  <p className="text-xs text-purple-600/80 dark:text-purple-400/80">
                    Tasks finished this month
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/50 dark:to-rose-950/50 border-red-100 dark:border-red-900">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Spending
                  </CardTitle>
                  <IndianRupee className="h-4 w-4 text-red-600 dark:text-red-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                    ₹{stats.monthlySpending.toLocaleString()}
                  </div>
                  <p className="text-xs text-red-600/80 dark:text-red-400/80">
                    Monthly expenses
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Link href="/agent/projects">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/50 dark:to-blue-950/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <ClipboardList className="h-5 w-5 text-cyan-600" />
                        New Project
                      </CardTitle>
                      <ArrowRight className="h-5 w-5 text-cyan-600" />
                    </div>
                    <CardDescription>
                      Create and set up a new project
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/agent/projects">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/50 dark:to-green-950/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Building2 className="h-5 w-5 text-emerald-600" />
                        Manage Projects
                      </CardTitle>
                      <ArrowRight className="h-5 w-5 text-emerald-600" />
                    </div>
                    <CardDescription>
                      View and manage all projects
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>

              <Link href="/agent/reports">
                <Card className="hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/50 dark:to-purple-950/50">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <BarChart2 className="h-5 w-5 text-violet-600" />
                        Analytics
                      </CardTitle>
                      <ArrowRight className="h-5 w-5 text-violet-600" />
                    </div>
                    <CardDescription>
                      View reports and statistics
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </div>

            <div className="mt-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Recent Activity</CardTitle>
                      <CardDescription>
                        Latest updates and actions
                      </CardDescription>
                    </div>
                    <Link href="/agent/activity">
                      <Button variant="outline" size="sm">
                        View All
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* {activities.length > 0 ? (
                      activities.map((activity) => (
                        <div
                          key={activity.id}
                          className="flex items-center gap-4"
                        >
                          <div className="h-2 w-2 rounded-full bg-blue-500" />
                          <div className="flex-1">
                            <p className="text-sm font-medium">
                              {activity.type}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {activity.description}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {format(activity.timestamp, "MMM d, h:mm a")}
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No recent activities
                      </p>
                    )} */}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header email={user?.email || ""} />
      <main className="container mx-auto p-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">My Dashboard</h2>

          <div className="grid gap-6 md:grid-cols-4 mb-8">
            <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/50 dark:to-orange-950/50 border-yellow-100 dark:border-yellow-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Pending Tasks
                </CardTitle>
                <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                  {userStats.pendingTasks}
                </div>
                <p className="text-xs text-yellow-600/80 dark:text-yellow-400/80">
                  Tasks waiting to be started
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border-blue-100 dark:border-blue-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  In Progress
                </CardTitle>
                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {userStats.inProgressTasks}
                </div>
                <p className="text-xs text-blue-600/80 dark:text-blue-400/80">
                  Tasks being worked on
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 border-green-100 dark:border-green-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {userStats.completedTasks}
                </div>
                <p className="text-xs text-green-600/80 dark:text-green-400/80">
                  Successfully finished tasks
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 border-purple-100 dark:border-purple-900">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Earnings
                </CardTitle>
                <IndianRupee className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  ₹{userStats.totalEarnings.toLocaleString()}
                </div>
                <p className="text-xs text-purple-600/80 dark:text-purple-400/80">
                  From completed tasks
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Tasks</CardTitle>
                    <CardDescription>
                      Your latest assigned tasks
                    </CardDescription>
                  </div>
                  <Link href="/tasks">
                    <Button variant="outline" size="sm">
                      View All
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTasks.length > 0 ? (
                    recentTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-start justify-between"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{task.name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{task.project.name}</span>
                            <span>•</span>
                            <span>Due {format(task.dueDate!, "MMM d")}</span>
                          </div>
                        </div>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status.replace("_", " ")}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No tasks assigned yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userStats.pendingTasks > 0 && (
                    <Link href="/tasks">
                      <Button className="w-full" size="lg">
                        <ClipboardList className="mr-2 h-5 w-5" />
                        Start Working on Tasks
                      </Button>
                    </Link>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <Link href="/tasks">
                      <Button variant="outline" className="w-full">
                        View All Tasks
                      </Button>
                    </Link>
                    <Link href="/tasks/billing">
                      <Button variant="outline" className="w-full">
                        View Earnings
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "in_progress":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    case "review":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
    case "completed":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
  }
}
