/// <reference types="vite/client" />

declare global {
  interface ImportMetaEnv {
    readonly DEV: boolean;
    readonly PROD: boolean;
    // add other env vars your app uses here
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};
