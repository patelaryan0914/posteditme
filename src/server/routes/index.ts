import { router } from "../index";
import { authRouter } from "./auth";
import { agentRouter } from "./agent";
import { projectRouter } from "./project";
import { taskRouter } from "./task";

export const appRouter = router({
  auth: authRouter,
  agent: agentRouter,
  project: projectRouter,
  task: taskRouter,
  // Add other routers here as needed
  // example: posts: postsRouter,
  // example: users: usersRouter,
});

export type AppRouter = typeof appRouter;
