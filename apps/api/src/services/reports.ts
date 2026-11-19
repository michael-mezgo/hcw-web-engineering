import { NotFoundError } from '../errors.js';
import type { CommentRepository } from '../repositories/types.js';
import type { Comment } from '../schemas/comment.js';

// A comment with this many reports gets hidden.
export const HIDE_AT_REPORTS = 3;

export interface ReportService {
  report: (id: string) => Promise<Comment>;
  reportNaive: (id: string) => Promise<Comment>;
}

export const createReportService = (
  comments: CommentRepository
): ReportService => ({
  // FIXED: the rule (hide at 3) lives here, the counting is one atomic UPDATE
  // in the repository, so concurrent reports cannot overwrite each other.
  report: async (id) => {
    const comment = await comments.addReport(id, HIDE_AT_REPORTS);

    if (comment === undefined) {
      throw new NotFoundError('Comment');
    }

    return comment;
  },

  // NAIVE (only behind ENABLE_DEBUG_ROUTES, to show the lost update):
  // read, count in TypeScript, write back. Two requests can read the same
  // count, so one report is lost.
  reportNaive: async (id) => {
    const comment = await comments.findById(id);

    if (comment === undefined) {
      throw new NotFoundError('Comment');
    }

    const reportCount = comment.reportCount + 1;
    const updated = await comments.saveReports(id, {
      reportCount,
      hiddenAt:
        reportCount >= HIDE_AT_REPORTS
          ? new Date().toISOString()
          : comment.hiddenAt,
    });

    if (updated === undefined) {
      throw new NotFoundError('Comment');
    }

    return updated;
  },
});
