// trpc-server/context.ts
import dbConnect from "@/db/mongoose";
import userModel from "./models/User";
import jwt from "jsonwebtoken";
import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function createContext(opts?: FetchCreateContextFnOptions) {
  // Client-side context (no req object)
  if (!opts?.req) {
    return { user: null };
  }

  // Server-side context
  try {
    await dbConnect();
    const cookieHeader = opts.req.headers.get("cookie") || "";

    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map((cookie) => {
        const [key, value] = cookie.split("=");
        return [key, decodeURIComponent(value)];
      })
    );

    const token = cookies["postEditAccessToken"];

    if (!token) {
      return { user: null };
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await userModel.findById(decoded.userId).select("-password");

    return { user };
  } catch (error) {
    console.error("Error in createContext:", error);
    return { user: null };
  }
}
