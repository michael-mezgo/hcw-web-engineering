import { createHmac } from 'node:crypto';

import { z } from 'zod';

import { HttpError } from '../errors.js';
import type { UserRepository } from '../repositories/types.js';
import type { AuthUser } from '../schemas/auth.js';

export const COOKIE_NAME = 'bear_session';

const SessionToken = z.string().regex(/^[a-f0-9]{64}$/);

export const hashToken = (token: string, secret: string): string =>
  createHmac('sha256', secret).update(token).digest('hex');

export function sessionHash(
  cookie: string | undefined,
  secret: string
): string | undefined {
  const prefix = COOKIE_NAME + '=';
  const token = cookie
    ?.split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))
    ?.slice(prefix.length);
  const parsed = SessionToken.safeParse(token);
  return parsed.success ? hashToken(parsed.data, secret) : undefined;
}

export async function requireSessionUser(
  users: UserRepository,
  cookie: string | undefined,
  secret: string
): Promise<AuthUser> {
  const tokenHash = sessionHash(cookie, secret);
  const user =
    tokenHash === undefined
      ? undefined
      : await users.findSessionUser(tokenHash);

  if (user === undefined) {
    throw new HttpError(401, 'Unauthorized', 'Login required.');
  }

  return user;
}
