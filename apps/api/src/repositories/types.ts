import type { Bear } from '../schemas/bear.js';
import type {
  Comment,
  CommentCursor,
  CommentPage,
  CreateComment,
} from '../schemas/comment.js';

export interface BearRepository {
  // q: only bears whose name contains q (case-insensitive)
  list: (q?: string) => Promise<Bear[]>;
  findById: (id: string) => Promise<Bear | undefined>;
}

export interface CommentRepository {
  listByBear: (
    bearId: string,
    page: { limit: number; after?: CommentCursor }
  ) => Promise<CommentPage>;
  create: (bearId: string, input: CreateComment) => Promise<Comment>;
  // false if there was no such comment
  delete: (id: string) => Promise<boolean>;
}

export interface HealthCheck {
  ping: () => Promise<void>;
}

export interface Repositories {
  bears: BearRepository;
  comments: CommentRepository;
  health: HealthCheck;
}
