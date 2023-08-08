// test1.js

import { initializeBot, sendMessage, page, isBotReady } from './index.js';

(async () => {
  try {
    if (!isBotReady) {
      // Initialize the bot if not running
      await initializeBot();
    } else {
      // Send messages using the sendMessage function
      let response;

      response = await sendMessage(page, "Right bubble sort in python!");
      console.log('Response from the bot:', response);

      // response = await sendMessage(page, "How are you?");
      // console.log('Response from the bot:', response);

      // response = await sendMessage(page, "Can you tell me a joke?");
      // console.log('Response from the bot:', response);
    }
  } catch (error) {
    console.error('Error during interactions:', error);
  }
})();
