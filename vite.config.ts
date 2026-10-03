import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { handleApiRequest } from './server/apiMiddleware.ts'

const adminApiPlugin = (): Plugin => ({
  name: 'tkmfoss-admin-api-server',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const handled = handleApiRequest(req, res);
      if (!handled) {
        next();
      }
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), adminApiPlugin()],
  server: {
    cors: true
  }
})
