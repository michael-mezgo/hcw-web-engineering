import { z } from 'zod';

// RFC 9457 Problem Details as produced by the central error handler.
// The examples keep Swagger UI from inventing random values.
export const ProblemSchema = z.object({
  type: z.string().meta({ examples: ['about:blank'] }),
  title: z.string().meta({ examples: ['Bad Request'] }),
  status: z
    .number()
    .int()
    .min(400)
    .max(599)
    .meta({ examples: [400] }),
  detail: z
    .string()
    .meta({ examples: ['The request did not pass validation.'] }),
  instance: z
    .string()
    .meta({ examples: ['urn:request:3f0c2c1e-7a4b-4d52-9d58-1f6f4a9b2c10'] }),
  errors: z
    .array(
      z.object({
        pointer: z.string().meta({ examples: ['/author'] }),
        message: z.string().meta({ examples: ['Too small'] }),
      })
    )
    .optional(),
});
