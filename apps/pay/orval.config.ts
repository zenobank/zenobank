// orval.config.ts
import { defineConfig } from 'orval';
import { envServer } from './src/lib/env-server';
export default defineConfig({
  api: {
    input: '../api/openapi.json',
    output: {
      baseUrl: envServer.API_URL,
      target: 'src/lib/generated/api-client/index.ts',
      schemas: 'src/lib/generated/api-client/model',
      client: 'react-query',
      clean: true,
    },
  },
});
