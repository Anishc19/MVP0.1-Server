import express from 'express';
import cors from 'cors';

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for client-side
app.use(cors());

// To parse JSON bodies
app.use(express.json());

// Import fetch dynamically
let fetch;

import('node-fetch').then(({ default: importedFetch }) => {
  fetch = importedFetch;
  startServer(); // Start the server after fetch is imported
}).catch(err => {
  console.error('Failed to load node-fetch module', err);
});

function startServer() {
  // Proxy endpoint
  app.post('/proxy', async (req, res) => {
    const { url } = req.body;
    try {
      const response = await fetch(url);

      // Make sure the server is returning a successful response
      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
      }

      const contentType = response.headers.get('content-type');

      if (contentType && contentType.includes('text/html')) {
        const body = await response.text();
        res.send(body);
      } else {
        throw new Error('Not an HTML content');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send(error.message);
    }
  });

  // Start listening on the specified port
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
