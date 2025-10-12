// orval.config.ts
import { defineConfig } from 'orval';
import { envClient } from './src/lib/env-client';
export default defineConfig({
  api: {
    input: '../api/openapi.json',
    output: {
      baseUrl: envClient.NEXT_PUBLIC_API_BASE_URL,
      target: 'src/lib/generated/api-client/index.ts',
      schemas: 'src/lib/generated/api-client/model',
      client: 'react-query',
      clean: true,
    },
  },
});
