"use client";

import { Button } from "@/components/ui/button";
import {
  LogOut,
  User,
  Shield,
  Building2,
  Home,
  BarChart,
  ClipboardList,
  IndianRupee,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { removeCookie } from "@/lib/utils";

interface HeaderProps {
  email: string;
  isSystemAdmin?: boolean;
  isAgentAdmin?: boolean;
}

export function Header({ email, isSystemAdmin, isAgentAdmin }: HeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const isAdminDashboard = pathname.startsWith("/admin");
  const isAgentDashboard = pathname.startsWith("/agent");

  const handleLogout = async () => {
    try {
      removeCookie("postEditAccessToken");
      router.push("/login");
      toast.success("Logged out successfully");
    } catch (error) {
      console.log("Error logging out", error);
      toast.error("Error logging out");
    }
  };

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <Home className="h-5 w-5" />
                <span className="text-xl font-semibold">Dashboard</span>
              </div>
            </Link>
            {isSystemAdmin && (
              <nav className="flex items-center space-x-4">
                <Link href="/admin/dashboard">
                  <Button
                    variant={isAdminDashboard ? "default" : "ghost"}
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Shield className="h-4 w-4" />
                    <span>System Admin</span>
                  </Button>
                </Link>
                <Link href="/admin/agents">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Building2 className="h-4 w-4" />
                    <span>Agents</span>
                  </Button>
                </Link>
              </nav>
            )}
            {isAgentAdmin && (
              <nav className="flex items-center space-x-4">
                <Link href="/agent/dashboard">
                  <Button
                    variant={isAgentDashboard ? "default" : "ghost"}
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Building2 className="h-4 w-4" />
                    <span>Agent Panel</span>
                  </Button>
                </Link>
                <Link href="/agent/projects">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <ClipboardList className="h-4 w-4" />
                    <span>Projects</span>
                  </Button>
                </Link>
                <Link href="/agent/reports">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <BarChart className="h-4 w-4" />
                    <span>Reports</span>
                  </Button>
                </Link>
              </nav>
            )}
            {!isSystemAdmin && !isAgentAdmin && (
              <nav className="flex items-center space-x-4">
                <Link href="/tasks">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <ClipboardList className="h-4 w-4" />
                    <span>My Tasks</span>
                  </Button>
                </Link>
                <Link href="/tasks/billing">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <IndianRupee className="h-4 w-4" />
                    <span>Billing</span>
                  </Button>
                </Link>
              </nav>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-muted-foreground">
              <User className="h-4 w-4 mr-2" />
              <span>{email}</span>
            </div>
            {/* <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowChat(true)}
              className="flex items-center space-x-2"
            >
              <MessageCircle className="h-4 w-4" />
              <span>Chat</span>
            </Button> */}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
