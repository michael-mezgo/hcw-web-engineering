import { createHash, randomBytes } from 'node:crypto';

import { argon2id, hash, verify } from 'argon2';
import type { FastifyPluginAsync } from 'fastify';

import { HttpError } from '../errors.js';
import { authUserResponse, loginBody, refs, registerBody } from '../openapi.js';
import type { UserRepository } from '../repositories/types.js';
import { LoginSchema, RegisterSchema } from '../schemas/auth.js';
import { parseOrThrow } from '../validate.js';

const COOKIE_NAME = 'bear_session';
const SESSION_SECONDS = 60 * 60 * 24;

const hashToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex');

function sessionHash(cookie: string | undefined): string | undefined {
  const prefix = COOKIE_NAME + '=';
  const token = cookie
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))
    ?.slice(prefix.length);
  return token !== undefined && /^[a-f0-9]{64}$/.test(token)
    ? hashToken(token)
    : undefined;
}

export const authRoutes: FastifyPluginAsync<{
  users: UserRepository;
  secureCookie: boolean;
}> = async (app, { users, secureCookie }) => {
  const cookieFlags =
    'Path=/; HttpOnly; SameSite=Lax' + (secureCookie ? '; Secure' : '');

  app.post(
    '/api/auth/login',
    {
      schema: {
        tags: ['auth'],
        body: loginBody,
        response: {
          200: authUserResponse,
          400: refs.problem,
          401: refs.problem,
        },
      },
    },
    async (request, reply) => {
      const { email, password } = parseOrThrow(LoginSchema, request.body);
      const user = await users.findByEmail(email);

      if (user === undefined || !(await verify(user.passwordHash, password))) {
        throw new HttpError(401, 'Unauthorized', 'Invalid email or password.');
      }

      const previousSession = sessionHash(request.headers.cookie);
      if (previousSession !== undefined) {
        await users.deleteSession(previousSession);
      }

      const token = randomBytes(32).toString('hex');
      await users.createSession(
        hashToken(token),
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
      const tokenHash = sessionHash(request.headers.cookie);
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
      const tokenHash = sessionHash(request.headers.cookie);
      const user =
        tokenHash === undefined
          ? undefined
          : await users.findSessionUser(tokenHash);
      if (user === undefined) {
        throw new HttpError(401, 'Unauthorized', 'Login required.');
      }
      return user;
    }
  );

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
