import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(1),
});

export const AuthUserSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  role: z.string(),
});

export type AuthUser = z.infer<typeof AuthUserSchema>;

export const RegisterSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(12),
});
