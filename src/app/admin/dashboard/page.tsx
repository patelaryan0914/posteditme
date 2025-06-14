"use client";

import { Header } from "@/components/dashboard/header";
import { DashboardStats } from "@/components/admin/dashboard/dashboard-stats";
import { useAuth } from "@/lib/auth-context";

export default function AdminDashboardPage() {
  const { user } = useAuth();
  // const [stats, setStats] = useState();
  const stats = {
    agents: {
      total: 0,
      active: 0,
      inactive: 0,
    },
    users: {
      total: 0,
      pending: 0,
      active: 0,
      suspended: 0,
    },
    projects: {
      total: 0,
      active: 0,
      completed: 0,
      byType: {},
    },
    tasks: {
      total: 0,
      completed: 0,
      inProgress: 0,
      pending: 0,
    },
    monthlyStats: {
      completedTasks: 0,
      newUsers: 0,
      revenue: 0,
    },
    languages: [{ name: "", count: 0 }],
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        email={user?.email || ""}
        isSystemAdmin={user?.role === "system_admin"}
      />
      <main className="container mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold">System Overview</h2>
            <p className="text-muted-foreground mt-2">
              Monitor system performance and statistics
            </p>
          </div>
        </div>

        <DashboardStats stats={stats} />
      </main>
    </div>
  );
}
