"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { agentFormSchema } from "@/lib/zod-schema";
import { Loader2, X } from "lucide-react";
import { trpc } from "@/app/_trpc/client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Agent } from "@/types/type";

interface AgentFormProps {
  onSuccess?: () => void;
  onCancel: () => void;
  initialData?: Agent;
}

export function AgentForm({
  onSuccess,
  onCancel,
  initialData,
}: AgentFormProps) {
  const router = useRouter();
  const isEditing = !!initialData?._id;

  const form = useForm<z.infer<typeof agentFormSchema>>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
    },
  });

  const createAgent = trpc.agent.create.useMutation({
    onSuccess: () => {
      toast.success("Agent created successfully");
      router.refresh();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateAgent = trpc.agent.update.useMutation({
    onSuccess: () => {
      toast.success("Agent updated successfully");
      router.refresh();
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const onSubmit = async (values: z.infer<typeof agentFormSchema>) => {
    try {
      if (isEditing && initialData?._id) {
        await updateAgent.mutateAsync({
          _id: initialData._id,
          ...values,
        });
      } else {
        await createAgent.mutateAsync(values);
      }
    } catch (error) {
      console.error("Error saving agent:", error);
    }
  };

  const isLoading = createAgent.isPending || updateAgent.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {isEditing ? "Edit Agent" : "Create New Agent"}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          disabled={isLoading}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter agent name"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter agent description"
                    {...field}
                    disabled={isLoading}
                    rows={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update" : "Create"} Agent
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
