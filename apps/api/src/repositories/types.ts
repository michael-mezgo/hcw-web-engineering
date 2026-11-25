import type { AuthUser } from '../schemas/auth.js';
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
  findById: (id: string) => Promise<Comment | undefined>;
  // Only for the naive report version
  saveReports: (
    id: string,
    reports: { reportCount: number; hiddenAt: string | null }
  ) => Promise<Comment | undefined>;
  // One atomic step: report_count + 1, hidden once it reaches hideAt.
  // undefined if there was no such comment
  addReport: (id: string, hideAt: number) => Promise<Comment | undefined>;
  // false if there was no such comment
  delete: (id: string) => Promise<boolean>;
}

export interface UserRepository {
  // False if the email is already registered.
  create: (email: string, passwordHash: string) => Promise<boolean>;
  findByEmail: (
    email: string
  ) => Promise<(AuthUser & { passwordHash: string }) | undefined>;
  createSession: (
    tokenHash: string,
    userId: string,
    expiresAt: Date
  ) => Promise<void>;
  findSessionUser: (tokenHash: string) => Promise<AuthUser | undefined>;
  deleteSession: (tokenHash: string) => Promise<void>;
}

export interface HealthCheck {
  ping: () => Promise<void>;
}

export interface Repositories {
  bears: BearRepository;
  comments: CommentRepository;
  health: HealthCheck;
  users: UserRepository;
}
