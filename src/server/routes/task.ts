import { z } from "zod";
import { router, publicProcedure, protectedProcedure } from "../trpc";
import { TaskModel } from "../models/Task";
import { ProjectModel } from "../models/Project";
import { TRPCError } from "@trpc/server";
import { AgentModel } from "../models/Agent";

export const taskRouter = router({
  // Create a new task
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2, "Name must be at least 2 characters"),
        description: z
          .string()
          .min(10, "Description must be at least 10 characters"),
        projectId: z.string().optional(),
        assignedTo: z.string().optional(),
        status: z
          .enum(["pending", "in_progress", "completed", "review", "rejected"])
          .default("pending")
          .optional(),
        priority: z
          .enum(["low", "medium", "high"])
          .default("medium")
          .optional(),
        classificationData: z.record(z.unknown()).optional(),
        dueDate: z.date().optional(),
        fileContent: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "system_admin" && ctx.user.role !== "agent_admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only system admins and agent admins can create tasks",
        });
      }

      const task = await TaskModel.create(
        input?.fileContent?.map((content) => ({
          name: input.name,
          description: input.description,
          projectId: input.projectId,
          status: input.status,
          priority: input.priority,
          classificationData: { text: content },
          dueDate: input.dueDate,
        }))
      );

      return { success: true, task };
    }),

  // Update a task
  updateTask: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
        updates: z.object({
          name: z
            .string()
            .min(2, "Name must be at least 2 characters")
            .optional(),
          description: z
            .string()
            .min(10, "Description must be at least 10 characters")
            .optional(),
          projectId: z.string().optional(),
          assignedTo: z.string().optional(),
          status: z
            .enum(["pending", "in_progress", "completed", "review", "rejected"])
            .default("pending")
            .optional(),
          priority: z
            .enum(["low", "medium", "high"])
            .default("medium")
            .optional(),
          classificationData: z.record(z.unknown()).optional(),
          dueDate: z.date().optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      const { taskId, updates } = input;
      const task = await TaskModel.findByIdAndUpdate(
        taskId,
        { ...updates },
        { new: true }
      );
      if (!task)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found",
        });
      return task.toJSON();
    }),
  updateClassificationTask: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
        updates: z.object({
          classificationData: z.record(z.unknown()).optional(),
          status: z
            .enum(["pending", "in_progress", "review", "completed"])
            .default("pending")
            .optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      const { taskId, updates } = input;
      const task = await TaskModel.findById(taskId);
      if (!task)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found",
        });
      const updatedTask = await TaskModel.findByIdAndUpdate(
        taskId,
        {
          classificationData: {
            selectedLabels: updates.classificationData?.selectedLabels,
            notes: updates.classificationData?.notes,
            text: task?.classificationData?.text,
          },
          status: updates.status,
        },
        { new: true }
      );
      if (!updatedTask)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found",
        });
      return { success: true, task: updatedTask.toJSON() };
    }),

  updateTranslationTask: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
        updates: z.object({
          translationData: z.record(z.unknown()).optional(),
          taskId: z.string(),
          status: z
            .enum(["pending", "in_progress", "review", "completed"])
            .default("pending")
            .optional(),
        }),
      })
    )
    .mutation(async ({ input }) => {
      const { taskId, updates } = input;
      const task = await TaskModel.findByIdAndUpdate(
        taskId,
        { ...updates },
        { new: true }
      );
      if (!task)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found",
        });
      return { success: true, task: task.toJSON() };
    }),

  // Delete a task
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "system_admin" && ctx.user.role !== "agent_admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only system admins and agent admins can delete tasks",
        });
      }
      const task = await TaskModel.findByIdAndDelete(input.id);
      if (!task)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found",
        });
      return { success: true };
    }),

  // Get task by ID
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const task = await TaskModel.findById(input.id);
      if (!task)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found",
        });
      return { success: true, task: task.toJSON() };
    }),

  // Get all tasks for a project
  getByProjectId: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input }) => {
      const tasks = await TaskModel.find({ projectId: input.projectId });

      return tasks.map((task) => task.toJSON());
    }),

  // Update task status
  updateStatus: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
        status: z.enum([
          "pending",
          "in_progress",
          "completed",
          "review",
          "rejected",
        ]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "system_admin" && ctx.user.role !== "agent_admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only system admins and agent admins can update tasks",
        });
      }
      const task = await TaskModel.findByIdAndUpdate(
        input.taskId,
        { status: input.status },
        { new: true }
      );
      if (!task)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found",
        });
      return { success: true, task: task.toJSON() };
    }),

  assignTask: protectedProcedure
    .input(
      z.object({
        taskId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "system_admin" && ctx.user.role !== "agent_admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only system admins and agent admins can assign tasks",
        });
      }
      const task = await TaskModel.findByIdAndUpdate(
        input.taskId,
        { assignedTo: input.userId },
        { new: true }
      );
      if (!task)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Task not found",
        });
      return { success: true, task: task.toJSON() };
    }),

  bulkAssign: protectedProcedure
    .input(
      z.object({
        taskIds: z.array(z.string()),
        userId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "system_admin" && ctx.user.role !== "agent_admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only system admins and agent admins can assign tasks",
        });
      }
      const result = await TaskModel.updateMany(
        { _id: { $in: input.taskIds } },
        { assignedTo: input.userId }
      );
      return { success: true, count: result.modifiedCount };
    }),

  bulkUnassign: protectedProcedure
    .input(
      z.object({
        taskIds: z.array(z.string()),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "system_admin" && ctx.user.role !== "agent_admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only system admins and agent admins can unassign tasks",
        });
      }
      const result = await TaskModel.updateMany(
        { _id: { $in: input.taskIds } },
        { $unset: { assignedTo: 1 } }
      );
      return { success: true, count: result.modifiedCount };
    }),
  getMyTasks: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new Error("User not authenticated");
    }

    const tasks = await TaskModel.find({
      assignedTo: ctx.user._id,
    })
      .sort({ createdAt: -1 })
      .populate("projectId");

    return { success: true, tasks: tasks };
  }),
  getMyAdminTasks: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new Error("User not authenticated");
    }

    const agents = await AgentModel.find({ adminIds: ctx.user._id });
    const projects = await ProjectModel.find({
      agentId: agents.map((agent) => agent._id),
    });

    const tasks = await TaskModel.find({
      projectId: { $in: projects.map((project) => project._id) },
    })
      .sort({ createdAt: -1 })
      .populate("projectId");

    return { success: true, tasks: tasks };
  }),
});
