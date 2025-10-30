import { API_BASE_URL } from '../constants';

const base = `${API_BASE_URL}/api/chat`;

export async function fetchMessages(offset = 0) {
  const token = localStorage.getItem('authToken');
  const res = await fetch(`${base}?offset=${offset}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!res.ok) throw new Error('Failed to load messages');
  return res.json();
}

export async function sendMessage(content) {
  const token = localStorage.getItem('authToken');
  const res = await fetch(base, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ content })
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
}

export default { fetchMessages, sendMessage };


