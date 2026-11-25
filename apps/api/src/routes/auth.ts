import { argon2id, hash } from 'argon2';
import type { FastifyPluginAsync } from 'fastify';

import { HttpError } from '../errors.js';
import { refs, registerBody } from '../openapi.js';
import type { UserRepository } from '../repositories/types.js';
import { RegisterSchema } from '../schemas/auth.js';
import { parseOrThrow } from '../validate.js';

export const authRoutes: FastifyPluginAsync<{ users: UserRepository }> = async (
  app,
  { users }
) => {
  app.post(
    '/api/auth/register',
    {
      schema: {
        tags: ['auth'],
        summary: 'Register a user',
        body: registerBody,
        response: {
          201: { type: 'null' },
          400: refs.problem,
          409: refs.problem,
        },
      },
    },
    async (request, reply) => {
      const { email, password } = parseOrThrow(RegisterSchema, request.body);
      const passwordHash = await hash(password, { type: argon2id });

      if (!(await users.create(email, passwordHash))) {
        throw new HttpError(
          409,
          'Conflict',
          'This email is already registered.'
        );
      }

      return await reply.code(201).send();
    }
  );
};
