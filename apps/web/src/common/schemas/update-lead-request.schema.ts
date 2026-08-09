import { UpdateLeadSchema } from "@kikos/shared";
import z from "zod";

export const UpdateLeadRequestSchema = z.object({
  leadId: z.string(),
  data: UpdateLeadSchema,
});

export type UpdateLeadRequestDto = z.infer<typeof UpdateLeadRequestSchema>;