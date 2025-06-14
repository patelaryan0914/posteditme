// src/server/routers/agent.router.ts
import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { AgentModel } from "../models/Agent";
import userModel from "../models/User";
import { ProjectModel } from "../models/Project";
import { TRPCError } from "@trpc/server";
import mongoose from "mongoose";

export const agentRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(2),
        description: z.string().min(10),
        adminIds: z.array(z.string()).optional().default([]),
        userIds: z.array(z.string()).optional().default([]),
        status: z
          .enum(["active", "inactive", "suspended"])
          .optional()
          .default("active"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "system_admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only system admins can create agents",
        });
      }

      // Check if agent with same name exists
      const existingAgent = await AgentModel.findOne({ name: input.name });
      if (existingAgent) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Agent with this name already exists",
        });
      }

      const agent = new AgentModel({
        ...input,
      });

      await agent.save();
      return { success: true, agent };
    }),

  update: protectedProcedure
    .input(
      z.object({
        _id: z.string(),
        name: z.string().min(2).optional(),
        description: z.string().min(10).optional(),
        adminIds: z.array(z.string()).optional(),
        userIds: z.array(z.string()).optional(),
        status: z.enum(["active", "inactive", "suspended"]).optional(),
      })
    )
    .mutation(async ({ input: { _id, ...updates }, ctx }) => {
      if (ctx.user.role !== "system_admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only system admins can update agents",
        });
      }

      const agent = await AgentModel.findById(_id);
      if (!agent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agent not found",
        });
      }
      const updatedAgent = new AgentModel({
        ...updates,
      });
      await updatedAgent.save();
      return { success: true, agent };
    }),

  // Delete an agent (only for system admins)
  delete: protectedProcedure
    .input(z.object({ _id: z.string() }))
    .mutation(async ({ input: { _id }, ctx }) => {
      if (ctx.user.role !== "system_admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only system admins can delete agents",
        });
      }

      const result = await AgentModel.findByIdAndDelete(_id);
      if (!result) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agent not found",
        });
      }

      return { success: true };
    }),

  // Get all agents (accessible by admins and agent admins)
  getAll: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "system_admin" && ctx.user.role !== "agent_admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only system admins and agent admins can view agents",
      });
    }

    const agents = await AgentModel.find({})
      .populate("adminIds", "_id name email")
      .populate("userIds", "_id name email")
      .lean();
    const result = agents.map((agent) => ({
      _id: String(agent._id),
      name: agent.name,
      description: agent.description,
      adminIds: agent.adminIds,
      userIds: agent.userIds,
      createdAt: new Date(agent.createdAt),
      updatedAt: new Date(agent.updatedAt),
      status: agent.status,
    }));
    return { success: true, agents: result };
  }),

  // Get single agent by ID
  getById: protectedProcedure
    .input(z.object({ _id: z.string() }))
    .query(async ({ input: { _id }, ctx }) => {
      if (ctx.user.role !== "system_admin" && ctx.user.role !== "agent_admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only system admins and agent admins can view agents",
        });
      }
      const agent = await AgentModel.findById(_id)
        .populate("adminIds", "name email")
        .populate("userIds", "name email")
        .lean();

      if (!agent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agent not found",
        });
      }

      return { success: true, agent };
    }),
  addAdmin: protectedProcedure
    .input(
      z.object({
        agentId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ input: { agentId, userId }, ctx }) => {
      if (ctx.user.role !== "system_admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only system admins can modify agent admins",
        });
      }

      const agent = await AgentModel.findById(agentId);
      if (!agent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agent not found",
        });
      }

      // Check if user is already an admin
      if (agent.adminIds.some((id: string) => id === userId)) {
        return { success: true, message: "User is already an admin" };
      }

      await userModel.findByIdAndUpdate(userId, { role: "agent_admin" });
      // Add to admin list and remove from user list if present
      agent.adminIds.push(userId);

      await agent.save();
      return { success: true, agent };
    }),

  // Remove admin from agent
  removeAdmin: protectedProcedure
    .input(
      z.object({
        agentId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ input: { agentId, userId }, ctx }) => {
      if (ctx.user.role !== "system_admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only system admins can modify agent admins",
        });
      }

      const agent = await AgentModel.findById(agentId);
      if (!agent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agent not found",
        });
      }
      agent.adminIds = agent.adminIds.filter((id: string) => id !== userId);

      await agent.save();
      return { success: true, agent };
    }),

  // Add user to agent
  addUser: protectedProcedure
    .input(
      z.object({
        agentId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ input: { agentId, userId }, ctx }) => {
      if (ctx.user.role !== "system_admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to modify this agent's users",
        });
      }

      const agent = await AgentModel.findById(agentId);
      if (!agent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agent not found",
        });
      }

      if (
        agent.userIds.some((id: string) => id === userId) ||
        agent.adminIds.some((id: string) => id === userId)
      ) {
        return {
          success: true,
          message: "User is already associated with this agent",
        };
      }

      agent.userIds.push(userId);
      await agent.save();
      return { success: true, agent };
    }),

  // Remove user from agent
  removeUser: protectedProcedure
    .input(
      z.object({
        agentId: z.string(),
        userId: z.string(),
      })
    )
    .mutation(async ({ input: { agentId, userId }, ctx }) => {
      if (ctx.user.role !== "system_admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You do not have permission to modify this agent's users",
        });
      }

      const agent = await AgentModel.findById(agentId);
      if (!agent) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Agent not found",
        });
      }

      agent.userIds = agent.userIds.filter((id: string) => id !== userId);
      agent.adminIds = agent.adminIds.filter((id: string) => id !== userId);

      await agent.save();
      return { success: true, agent };
    }),

  getUserAgents: protectedProcedure.query(async ({ ctx }) => {
    const userId = new mongoose.Types.ObjectId(ctx.user._id);

    const agents = await AgentModel.find({
      adminIds: { $in: [userId] },
      status: "active",
    })
      .select("_id name description status")
      .lean();
    const result = agents.map((agent) => ({
      _id: String(agent._id),
      name: agent.name,
      description: agent.description,
      status: agent.status,
    }));
    return { success: true, agents: result };
  }),
  getAgentStats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "agent_admin") {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only agent admins can view agent stats",
      });
    }

    const agent = await AgentModel.findOne({ adminIds: ctx.user._id });
    if (!agent) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Agent not found",
      });
    }

    const projectCount = await ProjectModel.countDocuments({
      agentId: agent._id,
    });

    const memberCount = await userModel.countDocuments({
      $or: [{ _id: { $in: agent.adminIds } }, { _id: { $in: agent.userIds } }],
    });

    return {
      success: true,
      projectCount,
      memberCount,
    };
  }),
});
