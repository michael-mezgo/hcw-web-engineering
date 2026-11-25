const limit = Number(process.argv[2] ?? 5);
const port = Number(process.argv[3] ?? 3000);

if (
  !Number.isInteger(limit) ||
  limit < 1 ||
  limit > 1000 ||
  !Number.isInteger(port) ||
  port < 1 ||
  port > 65535
) {
  console.error(
    'Aufruf: npm run check:login-rate-limit -w apps/api -- [Limit] [Port]'
  );
  process.exit(1);
}

const url = `http://127.0.0.1:${port}/api/auth/login`;

try {
  for (let attempt = 1; attempt <= limit + 1; attempt++) {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}',
      redirect: 'error',
      signal: AbortSignal.timeout(5000),
    });
    const retryAfter = response.headers.get('retry-after');
    await response.arrayBuffer();

    const expected = attempt <= limit ? 400 : 429;
    if (response.status !== expected) {
      throw new Error(
        `Anfrage ${attempt}: HTTP ${response.status} statt ${expected}. Prüfe das konfigurierte Limit und starte mit einem frischen Zeitfenster.`
      );
    }

    if (expected === 429 && !/^[1-9]\d*$/.test(retryAfter ?? '')) {
      throw new Error(
        'Die 429-Antwort enthält keinen gültigen Retry-After-Header.'
      );
    }

    const retry = retryAfter === null ? '' : ` (Retry-After: ${retryAfter} s)`;
    console.log(`Anfrage ${attempt}: HTTP ${response.status}${retry}`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
