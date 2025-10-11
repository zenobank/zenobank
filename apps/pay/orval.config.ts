// orval.config.ts
import { defineConfig } from 'orval';
import { env } from './src/lib/env';
export default defineConfig({
  api: {
    input: '../api/openapi.json',
    output: {
      baseUrl: env.API_URL,
      target: 'src/lib/generated/api-client/index.ts',
      schemas: 'src/lib/generated/api-client/model',
      client: 'react-query',
      clean: true,
    },
  },
});
