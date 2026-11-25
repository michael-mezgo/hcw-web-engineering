import { randomBytes } from 'node:crypto';

import { argon2id, hash, verify } from 'argon2';
import type { FastifyPluginAsync } from 'fastify';

import { HttpError } from '../errors.js';
import { authUserResponse, loginBody, refs, registerBody } from '../openapi.js';
import type { UserRepository } from '../repositories/types.js';
import { LoginSchema, RegisterSchema } from '../schemas/auth.js';
import { parseOrThrow } from '../validate.js';

import {
  COOKIE_NAME,
  hashToken,
  requireSessionUser,
  sessionHash,
} from '../services/session.js';

const SESSION_SECONDS = 60 * 60 * 24;

export const authRoutes: FastifyPluginAsync<{
  users: UserRepository;
  secureCookie: boolean;
  sessionSecret: string;
}> = async (app, { users, secureCookie, sessionSecret }) => {
  const cookieFlags =
    'Path=/; HttpOnly; SameSite=Lax' + (secureCookie ? '; Secure' : '');

  app.post(
    '/api/auth/login',
    {
      config: { rateLimit: {} },
      schema: {
        tags: ['auth'],
        body: loginBody,
        response: {
          200: authUserResponse,
          400: refs.problem,
          401: refs.problem,
          429: refs.problem,
        },
      },
    },
    async (request, reply) => {
      const { email, password } = parseOrThrow(LoginSchema, request.body);
      const user = await users.findByEmail(email);

      if (user === undefined || !(await verify(user.passwordHash, password))) {
        throw new HttpError(401, 'Unauthorized', 'Invalid email or password.');
      }

      const previousSession = sessionHash(
        request.headers.cookie,
        sessionSecret
      );
      if (previousSession !== undefined) {
        await users.deleteSession(previousSession);
      }

      const token = randomBytes(32).toString('hex');
      await users.createSession(
        hashToken(token, sessionSecret),
        user.id,
        new Date(Date.now() + SESSION_SECONDS * 1000)
      );
      void reply.header(
        'Set-Cookie',
        COOKIE_NAME +
          '=' +
          token +
          '; Max-Age=' +
          SESSION_SECONDS +
          '; ' +
          cookieFlags
      );
      void reply.header('Cache-Control', 'no-store');
      return { id: user.id, email: user.email, role: user.role };
    }
  );

  app.post(
    '/api/auth/logout',
    { schema: { tags: ['auth'], response: { 204: { type: 'null' } } } },
    async (request, reply) => {
      const tokenHash = sessionHash(request.headers.cookie, sessionSecret);
      if (tokenHash !== undefined) {
        await users.deleteSession(tokenHash);
      }
      void reply.header(
        'Set-Cookie',
        COOKIE_NAME + '=; Max-Age=0; ' + cookieFlags
      );
      return await reply.code(204).send();
    }
  );

  app.get(
    '/api/auth/me',
    {
      schema: {
        tags: ['auth'],
        response: { 200: authUserResponse, 401: refs.problem },
      },
    },
    async (request, reply) => {
      void reply.header('Cache-Control', 'no-store');
      return await requireSessionUser(
        users,
        request.headers.cookie,
        sessionSecret
      );
    }
  );

  app.post(
    '/api/auth/register',
    {
      config: { rateLimit: {} },
      schema: {
        tags: ['auth'],
        summary: 'Register a user',
        body: registerBody,
        response: {
          201: { type: 'null' },
          400: refs.problem,
          409: refs.problem,
          429: refs.problem,
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
