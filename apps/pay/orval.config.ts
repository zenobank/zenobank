// orval.config.ts
import * as dotenv from 'dotenv';
import { defineConfig } from 'orval';

dotenv.config();

console.log('!!!!!!!!!!!!!!!!!process.env.API_URL', process.env.API_URL);
export default defineConfig({
  api: {
    input: '../api/openapi.json',
    output: {
      baseUrl: process.env.API_URL,
      target: 'src/lib/generated/api-client/index.ts',
      schemas: 'src/lib/generated/api-client/model',
      client: 'react-query',
      clean: true,
    },
  },
});
