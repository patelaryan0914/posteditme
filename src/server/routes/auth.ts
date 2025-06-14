import { router, publicProcedure } from "../index";
import { z } from "zod";
import userModel, { User } from "../models/User";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { TRPCError } from "@trpc/server";
import { signupSchema } from "@/lib/zod-schema";
import { protectedProcedure } from "../trpc";
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = "7d";
const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};
export const authRouter = router({
  createUser: publicProcedure
    .input(
      signupSchema
        .innerType()
        .omit({ confirmPassword: true }) // Remove confirmPassword as we don't need it in the database
        .extend({
          approved: z.boolean().default(false),
          role: z.string().default("user"),
          status: z.string().default("active"),
        })
    )
    .mutation(async ({ input }) => {
      try {
        const existingUser = await userModel.findOne({ email: input.email });
        if (existingUser) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "User already exists with this email",
          });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(input.password, salt);

        // Create user
        const user = await userModel.create({
          ...input,
          password: hashedPassword,
        });

        // Generate token
        const token = generateToken(user._id.toString());

        // Return user and token (without password)
        const { password: _, ...userWithoutPassword } = user.toObject();
        return {
          success: true,
          user: userWithoutPassword as User,
          token,
        };
      } catch (error: unknown) {
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "CONFLICT"
        ) {
          throw error;
        }

        const errorMessage =
          error instanceof Error ? error.message : "Failed to create user";
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: errorMessage,
        });
      }
    }),
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Find user
        const user = await userModel.findOne({ email: input.email });
        if (!user) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid credentials",
          });
        }

        // Check password
        const isMatch = await bcrypt.compare(input.password, user.password);
        if (!isMatch) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Invalid credentials",
          });
        }

        // Generate token
        const token = generateToken(user._id.toString());

        // Return user and token (without password)
        const { password: _, ...userWithoutPassword } = user.toObject();
        return {
          success: true,
          user: userWithoutPassword,
          token,
        };
      } catch (error: unknown) {
        if (
          error &&
          typeof error === "object" &&
          "code" in error &&
          error.code === "CONFLICT"
        ) {
          throw error;
        }

        const errorMessage =
          error instanceof Error ? error.message : "Failed to login";
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: errorMessage,
        });
      }
    }),
  getMe: protectedProcedure.query(async ({ ctx }) => {
    try {
      if (!ctx.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Not authenticated",
        });
      }

      const user = await userModel.findById(ctx.user._id).select("-password");

      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User not found",
        });
      }
      const result = {
        _id: String(user._id),
        email: user.email,
        role: user.role,
        status: user.status,
        languages: user.languages,
        approved: user.approved,
        createdAt: new Date(user.createdAt),
      };
      return {
        success: true,
        user: result,
      };
    } catch (error: unknown) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "CONFLICT"
      ) {
        throw error;
      }

      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch user";
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: errorMessage,
      });
    }
  }),
  getAll: protectedProcedure.query(async () => {
    try {
      // Fetch all users, excluding sensitive data
      const users = await userModel
        .find({}, "_id email role status languages approved createdAt")
        .lean();
      const result = users.map((user) => ({
        _id: String(user._id),
        email: user.email,
        role: user.role,
        status: user.status,
        languages: user.languages,
        approved: user.approved,
        createdAt: new Date(user.createdAt),
      }));
      return {
        success: true,
        users: result,
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch users",
      });
    }
  }),
  approveUser: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        approved: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Only allow admins to approve users
      if (ctx.user.role !== "agent_admin" && ctx.user.role !== "system_admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to perform this action",
        });
      }

      try {
        const user = await userModel
          .findByIdAndUpdate(
            input.userId,
            { approved: input.approved },
            { new: true }
          )
          .select("-password")
          .lean();

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        return {
          success: true,
          user,
        };
      } catch (error) {
        console.error("Error updating user approval status:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update user approval status",
        });
      }
    }),

  // Suspend/Reactivate user
  suspendUser: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        status: z.enum(["active", "suspended"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Only allow admins to suspend users
      if (ctx.user.role !== "agent_admin" && ctx.user.role !== "system_admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to perform this action",
        });
      }

      try {
        const user = await userModel
          .findByIdAndUpdate(
            input.userId,
            { status: input.status },
            { new: true }
          )
          .select("-password")
          .lean();

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        return {
          success: true,
          user,
        };
      } catch (error) {
        console.error("Error updating user status:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update user status",
        });
      }
    }),

  // Delete user
  deleteUser: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Only allow admins to delete users
      if (ctx.user.role !== "agent_admin" && ctx.user.role !== "system_admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to perform this action",
        });
      }

      try {
        // Prevent self-deletion
        if (ctx.user._id.toString() === input.userId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Cannot delete your own account",
          });
        }

        const user = await userModel.findByIdAndDelete(input.userId);

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        return {
          success: true,
          userId: input.userId,
        };
      } catch (error) {
        console.error("Error deleting user:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete user",
        });
      }
    }),
  updateUserRole: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(["user", "agent_admin", "system_admin"]), // adjust roles as needed
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Only allow system admins to update roles
      if (ctx.user.role !== "system_admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to update user roles",
        });
      }

      try {
        const user = await userModel
          .findByIdAndUpdate(input.userId, { role: input.role }, { new: true })
          .select("-password")
          .lean();

        if (!user) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found",
          });
        }

        return {
          success: true,
          user,
        };
      } catch (error) {
        console.error("Error updating user role:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update user role",
        });
      }
    }),
});

export const protectedRouter = router({
  secretData: protectedProcedure.query(({ ctx }) => {
    return {
      success: true,
      message: "This is protected data",
      user: ctx.user,
    };
  }),
});
