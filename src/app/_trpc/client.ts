import { AppRouter } from "@/server/routes/index";
import { createTRPCReact } from "@trpc/react-query";
export const trpc = createTRPCReact<AppRouter>({});

