// orval.config.ts
import { defineConfig } from 'orval'

export default defineConfig({
  api: {
    input: 'http://localhost:3001/docs-json',
    output: {
      target: 'src/api-orval', // carpeta de salida
      schemas: 'src/api-orval/model', // opcional pero recomendable
      client: 'react-query',
      clean: true,
    },
  },
})
