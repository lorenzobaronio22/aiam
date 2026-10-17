/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Absolute origin of the API in production. Empty means same-origin. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
