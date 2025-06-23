import axios from 'axios';

/**
 * Get WebSocket worker status from the backend
 * @returns {Promise<Object>} WebSocket status data
 */
export const getWebSocketStatus = async () => {
  try {
    const response = await axios.get('/admin/websocket/status');
    return response.data;
  } catch (error) {
    console.error('Error fetching WebSocket status:', error);
    throw error;
  }
};
