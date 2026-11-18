import type { Bear } from '../schemas/bear.js';
import type { Comment, CreateComment } from '../schemas/comment.js';

export interface BearRepository {
  list: () => Promise<Bear[]>;
  findById: (id: string) => Promise<Bear | undefined>;
}

export interface CommentRepository {
  listByBear: (bearId: string) => Promise<Comment[]>;
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
