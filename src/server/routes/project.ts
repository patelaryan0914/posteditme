import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { ProjectModel } from "../models/Project";
import { baseProjectFormSchema } from "@/lib/zod-schema";
import { TRPCError } from "@trpc/server";

export const projectRouter = router({
  create: protectedProcedure
    .input(baseProjectFormSchema)
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "system_admin" && ctx.user.role !== "agent_admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only system admins and agent admins can create projects",
        });
      }
      const result = await ProjectModel.create(input);
      return { success: true, agent: result };
    }),

  // Get a project by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const project = await ProjectModel.findById(input.id).populate(
        "agentId",
        "name"
      );

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }
      return { success: true, project };
    }),

  // Update a project
  update: protectedProcedure
    .input(
      baseProjectFormSchema
        .omit({ startDate: true, dueDate: true }) // Remove any fields that shouldn't be updated
        .partial()
        .extend({
          id: z.string(),
          status: z.string().optional(), // Make id required
        })
    )
    .mutation(async ({ input: { id, ...updates }, ctx }) => {
      if (ctx.user.role !== "system_admin" && ctx.user.role !== "agent_admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only system admins and agent admins can update projects",
        });
      }
      const updateData = {
        ...updates,
        updatedAt: new Date(),
      };

      const result = await ProjectModel.findOneAndUpdate(
        { _id: id },
        { $set: updateData },
        { returnDocument: "after" }
      );

      if (!result) {
        throw new Error("Failed to update project");
      }

      return { success: true, result };
    }),

  // Delete a project
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ input: id, ctx }) => {
      if (ctx.user.role !== "system_admin" && ctx.user.role !== "agent_admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only system admins and agent admins can delete projects",
        });
      }
      const result = await ProjectModel.deleteOne({ _id: id });
      if (result.deletedCount === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found or could not be deleted",
        });
      }
      return { success: true };
    }),

  // List all projects with optional filtering
  list: protectedProcedure
    .input(
      z.object({
        status: z.string().optional(),
        type: z.string().optional(),
        agentId: z.string().optional(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { status, type, agentId, limit, cursor } = input;

      const query: Record<string, unknown> = {};
      if (status) query.status = status;
      if (type) query.type = type;
      if (agentId) query.agentId = agentId;

      // For cursor-based pagination
      if (cursor) {
        query._id = { $gt: cursor };
      }

      const projects = await ProjectModel.find(query)
        .sort({ createdAt: -1 })
        .limit(limit + 1);

      let nextCursor: string | undefined = undefined;
      if (projects.length > limit) {
        const nextItem = projects.pop();
        nextCursor = nextItem?._id.toString();
      }

      return {
        success: true,
        items: projects,
        nextCursor,
      };
    }),
});
