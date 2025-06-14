"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Header } from "@/components/dashboard/header";
import { AgentForm } from "@/components/admin/agents/agents-form";
import { trpc } from "@/app/_trpc/client";
import { Agent } from "@/types/type";
import { Skeleton } from "@/components/ui/skeleton";
import { AgentList } from "@/components/admin/agents/agent-list";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";

export default function AgentsPage() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);
  const {
    data: agentsData,
    isLoading: agentsLoading,
    refetch,
  } = trpc.agent.getAll.useQuery();
  const { data: usersData, isLoading: usersLoading } =
    trpc.auth.getAll.useQuery();
  const handleSuccess = () => {
    setShowForm(false);
    setEditingAgent(null);
    refetch();
  };
  const updateStatus = trpc.agent.update.useMutation();
  const addAdmin = trpc.agent.addAdmin.useMutation();
  const deleteAgent = trpc.agent.delete.useMutation();
  const removeAdmin = trpc.agent.removeAdmin.useMutation();
  const addUser = trpc.agent.addUser.useMutation();
  const removeUser = trpc.agent.removeUser.useMutation();
  if (agentsLoading || usersLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header email="" isSystemAdmin={true} />
        <main className="container mx-auto p-8">
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-16 w-full" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header email={user?.email || ""} isSystemAdmin={true} />
      <main className="container mx-auto p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Agents</h1>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Agent
          </Button>
        </div>

        {showForm && (
          <div className="mb-6">
            <AgentForm
              initialData={editingAgent || undefined}
              onCancel={() => {
                setShowForm(false);
                setEditingAgent(null);
              }}
              onSuccess={handleSuccess}
            />
          </div>
        )}

        <div className="bg-card rounded-lg shadow">
          <AgentList
            agents={agentsData?.agents || []}
            onEdit={(agent) => {
              setEditingAgent(agent);
              setShowForm(true);
            }}
            onDelete={async (agentId) => {
              try {
                deleteAgent.mutateAsync({ _id: agentId });
                toast.success("Agent deleted successfully");
                refetch();
              } catch (error) {
                toast.error("Failed to delete agent");
                console.error(error);
              }
            }}
            onStatusChange={async (agentId, newStatus) => {
              try {
                await updateStatus.mutateAsync({
                  _id: agentId,
                  status: newStatus,
                });
                toast.success(
                  `Agent ${
                    newStatus === "active" ? "activated" : "deactivated"
                  } successfully`
                );
                refetch();
              } catch (error) {
                toast.error("Failed to update agent status");
                console.error(error);
              }
            }}
            onAddAdmin={async (agentId, userId) => {
              try {
                await addAdmin.mutateAsync({ agentId, userId });
                toast.success("Admin added successfully");
                refetch();
              } catch (error) {
                toast.error("Failed to add admin");
                console.error(error);
              }
            }}
            onRemoveAdmin={async (agentId, userId) => {
              try {
                await removeAdmin.mutateAsync({ agentId, userId });
                toast.success("Admin removed successfully");
                refetch();
              } catch (error) {
                toast.error("Failed to remove admin");
                console.error(error);
              }
            }}
            onAddUser={async (agentId, userId) => {
              try {
                await addUser.mutateAsync({ agentId, userId });
                toast.success("User added to agent successfully");
                refetch();
              } catch (error) {
                toast.error("Failed to add user to agent");
                console.error(error);
              }
            }}
            onRemoveUser={async (agentId, userId) => {
              try {
                await removeUser.mutateAsync({ agentId, userId });
                toast.success("User removed from agent successfully");
                refetch();
              } catch (error) {
                toast.error("Failed to remove user from agent");
                console.error(error);
              }
            }}
            availableUsers={usersData?.users || []}
            availableAdmins={usersData?.users || []}
          />
        </div>
      </main>
    </div>
  );
}
