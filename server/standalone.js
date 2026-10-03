import http from 'http';
import { handleApiRequest } from './apiMiddleware.js';

const PORT = process.env.PORT || 5173;

const server = http.createServer((req, res) => {
  const handled = handleApiRequest(req, res);
  if (!handled) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`TKMFOSS Admin API Server listening on http://localhost:${PORT}/api/data`);
});
