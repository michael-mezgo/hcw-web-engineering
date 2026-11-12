interface ImportMetaEnv {
  // Base URL of the API. Empty (default) means same origin via the Vite proxy.
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
