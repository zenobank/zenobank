// orval.config.ts
import * as dotenv from 'dotenv';
import { defineConfig } from 'orval';

dotenv.config();

export default defineConfig({
  api: {
    input: '../api/openapi.json',
    output: {
      baseUrl: process.env.API_BASE_URL,
      target: 'src/lib/generated/index.ts',
      schemas: 'src/lib/generated/model',
      client: 'react-query',
      clean: true,
    },
  },
});
