// src/utils/api.js

const API_BASE_URL = 'http://localhost:5000/api'; // our actual backend base

export async function postRequest(endpoint, data) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // optional, if using cookies/sessions
      body: JSON.stringify(data),
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Request failed');
    return result;
  } catch (error) {
    console.error('API POST error:', error.message);
    throw error;
  }
}
