// Error for non-2xx API responses; `message` is the problem's `detail`.
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly requestId?: string
  ) {
    super(message);
  }
}

interface Problem {
  detail?: unknown;
}

export async function checkResponseOk(response: Response): Promise<Response> {
  if (response.ok) {
    return response;
  }

  const isProblem = (response.headers.get('content-type') ?? '').includes(
    'application/problem+json'
  );
  const problem = isProblem
    ? ((await response.json().catch(() => ({}))) as Problem)
    : {};

  throw new ApiError(
    typeof problem.detail === 'string'
      ? problem.detail
      : `Request failed (${response.status})`,
    response.status,
    response.headers.get('x-request-id') ?? undefined
  );
}

export function errorMessage(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}
