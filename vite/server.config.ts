import type { ServerOptions } from 'vite';

export const serverConfig: ServerOptions = {
  fs: {
    strict: true
  },
  port: 5173,
  host: true
};