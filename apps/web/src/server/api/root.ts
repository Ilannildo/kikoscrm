import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { dealsRouter } from "./routers/deals.router";
import { usersRouter } from "./routers/users.router";
import { leadsRouter } from "./routers/leads.router";
import { sellersRouter } from "./routers/sellers.router";
import { commentsRouter } from "./routers/comments.router";

export const appRouter = createTRPCRouter({
  users: usersRouter,
  deals: dealsRouter,
  leads: leadsRouter,
  sellers: sellersRouter,
  comments: commentsRouter,
});

export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
