// orval.config.ts
import * as dotenv from 'dotenv';
import { defineConfig } from 'orval';

dotenv.config();

export default defineConfig({
  api: {
    input: '../../apps/api/openapi.json',
    output: {
      baseUrl: '/',
      target: 'src/index.ts',
      schemas: 'src/model',
      client: 'react-query',
      clean: true,
    },
  },
});
