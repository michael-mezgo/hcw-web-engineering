import { createHash } from 'node:crypto';

import { HttpError } from '../errors.js';
import type { UserRepository } from '../repositories/types.js';
import type { AuthUser } from '../schemas/auth.js';

export const COOKIE_NAME = 'bear_session';

export const hashToken = (token: string): string =>
  createHash('sha256').update(token).digest('hex');

export function sessionHash(cookie: string | undefined): string | undefined {
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

export async function requireSessionUser(
  users: UserRepository,
  cookie: string | undefined
): Promise<AuthUser> {
  const tokenHash = sessionHash(cookie);
  const user =
    tokenHash === undefined
      ? undefined
      : await users.findSessionUser(tokenHash);

  if (user === undefined) {
    throw new HttpError(401, 'Unauthorized', 'Login required.');
  }

  return user;
}
