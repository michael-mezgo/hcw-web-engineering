// `detail` is safe to show to clients; `message` (for logs) may hold internals.
export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly title: string,
    readonly detail: string,
    message: string = detail
  ) {
    super(message);
  }
}

export interface FieldProblem {
  pointer: string;
  message: string;
}

export class ValidationError extends HttpError {
  constructor(readonly errors: FieldProblem[]) {
    super(400, 'Bad Request', 'The request did not pass validation.');
  }
}

export class NotFoundError extends HttpError {
  constructor(what: string) {
    super(404, 'Not Found', `${what} not found.`);
  }
}

export class UpstreamError extends HttpError {
  constructor(message: string) {
    super(502, 'Bad Gateway', 'Wikipedia is currently unavailable.', message);
  }
}

export class UpstreamTimeoutError extends HttpError {
  constructor(message: string) {
    super(
      504,
      'Gateway Timeout',
      'Wikipedia did not respond in time.',
      message
    );
  }
}
