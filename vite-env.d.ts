/// <reference types="vite/client" />

interface GeminiApi {
  invoke: (channel: string, ...args: any[]) => Promise<any>;
  on: (channel: string, callback: (data: any) => void) => () => void;
}

interface Window {
  gemini: GeminiApi;
}
