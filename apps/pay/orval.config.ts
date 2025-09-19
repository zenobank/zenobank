// orval.config.ts
import * as dotenv from 'dotenv';
import { defineConfig } from 'orval';

dotenv.config();

export default defineConfig({
  api: {
    input: '../api/openapi.json',
    output: {
      baseUrl: process.env.API_BASE_URL,
      target: 'src/lib/requests/api-client',
      schemas: 'src/lib/requests/api-client/model',
      client: 'react-query',
      clean: true,
    },
  },
});
