import { UpdateDealSchema } from "@kikos/shared";
import z from "zod";

export const UpdateDealRequestSchema = z.object({
  dealId: z.string(),
  data: UpdateDealSchema,
});

export type UpdateDealRequestDto = z.infer<typeof UpdateDealRequestSchema>;