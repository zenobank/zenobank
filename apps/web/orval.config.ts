// orval.config.ts
import { defineConfig } from 'orval'

export default defineConfig({
  api: {
    input: 'http://localhost:3001/docs-json',
    output: {
      target: 'src/lib/requests/api-client', // carpeta de salida
      schemas: 'src/lib/requests/api-client/model', // opcional pero recomendable
      client: 'react-query',
      clean: true,
    },
  },
})
