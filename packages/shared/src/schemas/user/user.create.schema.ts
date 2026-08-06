import { z } from "zod";
import { UserRole } from "../../enums/user-role.enum";

export const CreateUserSchema = z.object({
  name: z
    .string()
    .describe("Nome do usuário")
    .min(1, "O nome é um campo obrigatório"),
  email: z
    .email("Formato de e-mail inválido")
    .describe("Endereço de e-mail do usuário"),
  password: z
    .string()
    .min(6, "A senha deve ter pelo menos 6 caracteres")
    .describe("Senha do usuário"),
  role: z.enum(UserRole).describe("Função atribuída ao usuário"),
});

export type CreateUserDto = z.infer<typeof CreateUserSchema>;
