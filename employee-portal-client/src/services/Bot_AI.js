// Bot_AI.js - שירות בקשות לשרת עבור בוט/AI

import { apiCall } from './apiService';
import { API_BASE_URL } from '../constants';

const API_BASE = `${API_BASE_URL}/api`;

/**
 * Sends a message to the AI bot and gets a response.
 * @param {string} message The user's message.
 * @returns {Promise<any>} The bot's response.
 */
export async function sendBotMessage(message) {
  // Assuming the server expects just the 'prompt'
  const body = {
    prompt: message,
  };
  
  return apiCall('/ai/ask', 'POST', body);
} 