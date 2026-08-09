import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { getDashboard } from "@/services/dashboard.service";
import { DashboardQuerySchema } from "@kikos/shared";

export const dashboardRouter = createTRPCRouter({
  get: protectedProcedure
    .input(DashboardQuerySchema)
    .query(({ input }) => getDashboard(input)),
});
