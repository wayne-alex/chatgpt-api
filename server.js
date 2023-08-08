// server.mjs

import express from 'express';
import { initializeBot, sendMessage, page, isBotReady } from './index.js';

const app = express();
const port = 2001;

app.use(express.json());

app.post('/sendMessage', async (req, res) => {
  try {
    if (!isBotReady) {
      await initializeBot();
    }

    const message = req.body.message;
    const response = await sendMessage(page, message);

    res.status(200).json({ response: response });
  } catch (error) {
    console.error('Error during interaction:', error);
    res.status(500).json({ error: 'An error occurred during interaction' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
