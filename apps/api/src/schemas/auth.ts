import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),
  password: z.string().min(12),
});
