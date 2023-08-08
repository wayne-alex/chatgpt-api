// client.js

import axios from 'axios';

const apiUrl = 'http://localhost:3000/sendMessage'; // Update the URL if your server is running on a different port or domain

const sendMessage = async (message) => {
  try {
    const response = await axios.post(apiUrl, { message });
    console.log('Bot Response:', response.data.response);
  } catch (error) {
    console.error('Error:', error.response.data.error);
  }
};

let message = 'provide a summary or analysis of the song "Enjoy" by Jux'
sendMessage(message); // Change the message as needed
