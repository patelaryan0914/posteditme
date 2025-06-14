"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  CheckCircle2,
  BarChart2,
  IndianRupee,
  FileText,
} from "lucide-react";
import { format, startOfMonth } from "date-fns";

interface DashboardStats {
  agents: {
    total: number;
    active: number;
    inactive: number;
  };
  users: {
    total: number;
    pending: number;
    active: number;
    suspended: number;
  };
  projects: {
    total: number;
    active: number;
    completed: number;
    byType: Record<string, number>;
  };
  tasks: {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
  };
  monthlyStats: {
    completedTasks: number;
    newUsers: number;
    revenue: number;
  };
  languages: {
    name: string;
    count: number;
  }[];
}

interface DashboardStatsProps {
  stats: DashboardStats;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  const taskCompletionRate =
    stats.tasks.total > 0
      ? Math.round((stats.tasks.completed / stats.tasks.total) * 100)
      : 0;

  const userApprovalRate =
    stats.users.total > 0
      ? Math.round(
          ((stats.users.total - stats.users.pending) / stats.users.total) * 100
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.agents.total}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                {stats.agents.active} Active
              </Badge>
              <Badge
                variant="secondary"
                className="bg-yellow-100 text-yellow-800"
              >
                {stats.agents.inactive} Inactive
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.total}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                {stats.users.active} Active
              </Badge>
              <Badge variant="secondary" className="bg-red-100 text-red-800">
                {stats.users.pending} Pending
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Projects
            </CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.projects.active}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {stats.projects.total} Total
              </Badge>
              <Badge
                variant="secondary"
                className="bg-green-100 text-green-800"
              >
                {stats.projects.completed} Completed
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/50 dark:to-red-950/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Revenue
            </CardTitle>
            <IndianRupee className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{stats.monthlyStats.revenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              For {format(startOfMonth(new Date()), "MMMM yyyy")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Task Performance</CardTitle>
            <CardDescription>Overall task completion metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Completion Rate</span>
                  <span className="text-sm text-muted-foreground">
                    {taskCompletionRate}%
                  </span>
                </div>
                <Progress value={taskCompletionRate} className="h-2" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">
                    Completed
                  </span>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.tasks.completed}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">
                    In Progress
                  </span>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.tasks.inProgress}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.tasks.pending}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>User approval and activity status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Approval Rate</span>
                  <span className="text-sm text-muted-foreground">
                    {userApprovalRate}%
                  </span>
                </div>
                <Progress value={userApprovalRate} className="h-2" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Active</span>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.users.active}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Pending</span>
                  <p className="text-2xl font-bold text-yellow-600">
                    {stats.users.pending}
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">
                    Suspended
                  </span>
                  <p className="text-2xl font-bold text-red-600">
                    {stats.users.suspended}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Project Types</CardTitle>
            <CardDescription>Distribution of projects by type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats.projects.byType).map(([type, count]) => (
                <div key={type} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {type.replace("_", " ")}
                    </span>
                    <span className="text-muted-foreground">
                      {count} projects
                    </span>
                  </div>
                  <Progress
                    value={(count / stats.projects.total) * 100}
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Language Coverage</CardTitle>
            <CardDescription>
              Most used languages across projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.languages.map((lang) => (
                <div key={lang.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{lang.name}</span>
                    <span className="text-muted-foreground">
                      {lang.count} tasks
                    </span>
                  </div>
                  <Progress
                    value={(lang.count / stats.tasks.total) * 100}
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Overview</CardTitle>
          <CardDescription>
            Statistics for {format(startOfMonth(new Date()), "MMMM yyyy")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-4 p-4 rounded-lg bg-green-50 dark:bg-green-950/50">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium">Completed Tasks</p>
                <p className="text-2xl font-bold">
                  {stats.monthlyStats.completedTasks}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/50">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium">New Users</p>
                <p className="text-2xl font-bold">
                  {stats.monthlyStats.newUsers}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 rounded-lg bg-purple-50 dark:bg-purple-950/50">
              <BarChart2 className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Revenue</p>
                <p className="text-2xl font-bold">
                  ₹{stats.monthlyStats.revenue.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
