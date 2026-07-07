import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: '../../backend/openapi.json',
  output: {
    path: 'src'
  },
  client: '@hey-api/client-fetch',
  plugins: [
    '@hey-api/client-fetch'
  ]
});
