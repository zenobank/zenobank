// orval.config.ts
import * as dotenv from 'dotenv'
import { defineConfig } from 'orval'
import { env } from './src/lib/env'

dotenv.config()

export default defineConfig({
  api: {
    input: '../api/openapi.json',
    output: {
      baseUrl: env.VITE_API_BASE_URL,
      target: 'src/lib/generated/api-client/index.ts',
      schemas: 'src/lib/generated/api-client/model',
      client: 'react-query',
      clean: true,
      override: {
        mutator: {
          path: 'src/lib/axios-instance.ts',
          name: 'customAxios',
        },
      },
    },
  },
})
