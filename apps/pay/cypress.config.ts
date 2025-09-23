import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    experimentalStudio: true,
    setupNodeEvents(on, config) {
      // implement node event listeners her
      config.baseUrl = 'http://localhost:3000';
      return config;
    },
  },
});
