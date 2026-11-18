import type { FastifyInstance, LightMyRequestResponse } from 'fastify';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { buildApp } from './app.js';
import { loadConfig } from './config.js';
import {
  createMemoryBearRepository,
  createMemoryCommentRepository,
  createMemoryHealthCheck,
} from './repositories/memory.js';
import type { Bear } from './schemas/bear.js';
import type { Comment, CommentPage } from './schemas/comment.js';

const BEARS: Bear[] = [
  {
    id: 'u-arctos',
    name: 'Brown bear',
    binomial: 'U. arctos',
    imageUrl: null,
    range: 'Eurasia and North America',
  },
  {
    id: 'u-maritimus',
    name: 'Polar bear',
    binomial: 'U. maritimus',
    imageUrl: null,
    range: 'Arctic',
  },
];

let app: FastifyInstance;

// No database: the app gets the in-memory repositories.
beforeEach(async () => {
  app = await buildApp(
    loadConfig({ DATABASE_URL: 'postgres://unused/unused' }),
    {
      bears: createMemoryBearRepository(BEARS),
      comments: createMemoryCommentRepository(),
      health: createMemoryHealthCheck(),
    }
  );
});

afterEach(async () => {
  await app.close();
});

const postComment = async (
  bearId: string,
  payload: object
): Promise<LightMyRequestResponse> =>
  await app.inject({
    method: 'POST',
    url: `/api/bears/${bearId}/comments`,
    payload,
  });

describe('bears', () => {
  it('lists the bears', async () => {
    const res = await app.inject({ url: '/api/bears' });

    expect(res.statusCode).toBe(200);
    expect(res.json<Bear[]>().map((bear) => bear.id)).toEqual([
      'u-arctos',
      'u-maritimus',
    ]);
  });

  it('filters the bears by name with ?q=', async () => {
    const res = await app.inject({ url: '/api/bears?q=polar' });

    expect(res.json<Bear[]>().map((bear) => bear.id)).toEqual(['u-maritimus']);
  });

  it('answers 404 for an unknown bear', async () => {
    const res = await app.inject({ url: '/api/bears/not-available' });

    expect(res.statusCode).toBe(404);
  });
});

describe('comments', () => {
  it('creates a comment (201) and lists it for its bear only', async () => {
    const created = await postComment('u-arctos', {
      author: 'Bob',
      text: 'Hi',
    });
    const comment = created.json<Comment>();

    expect(created.statusCode).toBe(201);
    expect(created.headers.location).toBe(`/api/comments/${comment.id}`);

    const own = await app.inject({ url: '/api/bears/u-arctos/comments' });
    const other = await app.inject({ url: '/api/bears/u-maritimus/comments' });

    expect(own.json<CommentPage>()).toEqual({
      items: [comment],
      nextCursor: null,
    });
    expect(other.json<CommentPage>().items).toEqual([]);
  });

  it('pages through the comments with a cursor', async () => {
    for (const text of ['1', '2', '3']) {
      await postComment('u-arctos', { author: 'Bob', text });
    }

    const first = (
      await app.inject({ url: '/api/bears/u-arctos/comments?limit=2' })
    ).json<CommentPage>();
    const second = (
      await app.inject({
        url: `/api/bears/u-arctos/comments?limit=2&cursor=${first.nextCursor}`,
      })
    ).json<CommentPage>();

    // Same-millisecond comments are ordered by id, so only check the pages.
    expect(first.items).toHaveLength(2);
    expect(first.nextCursor).not.toBeNull();
    expect(second.items).toHaveLength(1);
    expect(
      new Set([...first.items, ...second.items].map((c) => c.text))
    ).toEqual(new Set(['1', '2', '3']));
    expect(second.nextCursor).toBeNull();
  });

  it('rejects an invalid cursor with 400', async () => {
    const res = await app.inject({
      url: '/api/bears/u-arctos/comments?cursor=broken',
    });

    expect(res.statusCode).toBe(400);
  });

  it('rejects an invalid body with 400', async () => {
    const res = await postComment('u-arctos', { author: '', text: '' });

    expect(res.statusCode).toBe(400);
  });

  it('answers 404 when the bear does not exist', async () => {
    const res = await postComment('gibt-es-nicht', {
      author: 'Bob',
      text: 'Hi',
    });

    expect(res.statusCode).toBe(404);
  });

  it('deletes a comment (204), the second delete is 404', async () => {
    const { id } = (
      await postComment('u-arctos', { author: 'Bob', text: 'Hi' })
    ).json<Comment>();

    const first = await app.inject({
      method: 'DELETE',
      url: `/api/comments/${id}`,
    });
    const second = await app.inject({
      method: 'DELETE',
      url: `/api/comments/${id}`,
    });

    expect(first.statusCode).toBe(204);
    expect(second.statusCode).toBe(404);
  });
});

describe('health', () => {
  it('is ready when the health check succeeds', async () => {
    const res = await app.inject({ url: '/health/ready' });

    expect(res.statusCode).toBe(200);
  });
});
