/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional absolute origin of the deployed API (no trailing slash), e.g. https://my-app.vercel.app */
  readonly VITE_CHAT_API_BASE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
