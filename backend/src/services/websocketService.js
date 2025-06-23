import WebSocket, { WebSocketServer } from 'ws';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

// WebSocket server configuration
const WS_PORT = process.env.WEBSOCKET_PORT || 3002;
const USE_WEBSOCKET_SLAVE = process.env.USE_WEBSOCKET_SLAVE === 'true';

// Store connected clients and their capabilities
const clients = new Map();
// Store pending tasks
const pendingTasks = new Map();

// Initialize WebSocket server
let wss = null;

/**
 * Initialize the WebSocket server
 */
export const initWebSocketServer = () => {
  if (!USE_WEBSOCKET_SLAVE) {
    console.log('WebSocket server is disabled. Set USE_WEBSOCKET_SLAVE=true to enable.');
    return;
  }

  wss = new WebSocketServer({ port: WS_PORT });
  console.log(`WebSocket server running on port ${WS_PORT}`);

  wss.on('connection', handleConnection);

  // Handle server errors
  wss.on('error', (error) => {
    console.error('WebSocket server error:', error);
  });
};

/**
 * Handle new WebSocket connections
 * @param {WebSocket} ws - WebSocket connection
 */
const handleConnection = (ws) => {
  const clientId = uuidv4();
  
  // Initialize client in the map without capabilities yet
  clients.set(clientId, {
    ws,
    capabilities: null,
    status: 'connected',
    lastSeen: Date.now(),
    tasks: []
  });

  console.log(`Client connected: ${clientId}`);

  // Send welcome message and request capabilities
  ws.send(JSON.stringify({
    type: 'welcome',
    clientId,
    message: 'Welcome to VeggieScan WebSocket server. Please send your capabilities.'
  }));

  // Handle messages from client
  ws.on('message', (data) => {
    try {
      const message = JSON.parse(data);
      handleClientMessage(clientId, message);
    } catch (error) {
      console.error(`Error parsing message from client ${clientId}:`, error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  });

  // Handle client disconnection
  ws.on('close', () => {
    console.log(`Client disconnected: ${clientId}`);
    
    // Clean up any pending tasks assigned to this client
    const client = clients.get(clientId);
    if (client && client.tasks.length > 0) {
      client.tasks.forEach(taskId => {
        const task = pendingTasks.get(taskId);
        if (task) {
          console.log(`Reassigning task ${taskId} due to client disconnection`);
          task.status = 'pending';
          task.assignedTo = null;
          // Task will be reassigned by the task scheduler
        }
      });
    }
    
    clients.delete(clientId);
  });

  // Handle errors
  ws.on('error', (error) => {
    console.error(`Error with client ${clientId}:`, error);
  });

  // Set up ping interval to keep connection alive and detect dead clients
  const pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
    } else {
      clearInterval(pingInterval);
    }
  }, 30000); // Ping every 30 seconds
};

/**
 * Handle messages from clients
 * @param {string} clientId - Client ID
 * @param {Object} message - Message object
 */
const handleClientMessage = (clientId, message) => {
  const client = clients.get(clientId);
  
  if (!client) {
    console.error(`Received message from unknown client: ${clientId}`);
    return;
  }

  // Update last seen timestamp
  client.lastSeen = Date.now();

  switch (message.type) {
    case 'capabilities':
      handleCapabilitiesMessage(clientId, message);
      break;
    case 'task_result':
      handleTaskResultMessage(clientId, message);
      break;
    case 'pong':
      // Just update the lastSeen timestamp which we already did
      break;
    case 'status_update':
      handleStatusUpdateMessage(clientId, message);
      break;
    default:
      console.warn(`Unknown message type from client ${clientId}:`, message.type);
      client.ws.send(JSON.stringify({
        type: 'error',
        message: `Unknown message type: ${message.type}`
      }));
  }
};

/**
 * Handle capabilities message from client
 * @param {string} clientId - Client ID
 * @param {Object} message - Capabilities message
 */
const handleCapabilitiesMessage = (clientId, message) => {
  const client = clients.get(clientId);
  
  if (!client) return;

  // Store client capabilities
  client.capabilities = {
    cpu: message.cpu || 'Unknown',
    gpu: message.gpu || 'Unknown',
    ram: message.ram || 'Unknown',
    hasLMStudio: message.hasLMStudio || false,
    models: message.models || []
  };

  client.status = 'ready';
  
  console.log(`Client ${clientId} capabilities received:`, client.capabilities);
  
  // Acknowledge capabilities
  client.ws.send(JSON.stringify({
    type: 'capabilities_ack',
    message: 'Capabilities received'
  }));
  
  // Broadcast updated client list to all clients
  broadcastClientList();
};

/**
 * Handle task result message from client
 * @param {string} clientId - Client ID
 * @param {Object} message - Task result message
 */
const handleTaskResultMessage = (clientId, message) => {
  const { taskId, result, error } = message;
  const task = pendingTasks.get(taskId);
  
  if (!task) {
    console.warn(`Received result for unknown task: ${taskId}`);
    return;
  }

  console.log(`Received result for task ${taskId} from client ${clientId}`);
  
  // Update client status
  const client = clients.get(clientId);
  if (client) {
    client.status = 'ready';
    client.tasks = client.tasks.filter(id => id !== taskId);
  }

  // Handle the result
  if (error) {
    task.reject(new Error(error));
  } else {
    task.resolve(result);
  }

  // Remove the task from pending tasks
  pendingTasks.delete(taskId);
};

/**
 * Handle status update message from client
 * @param {string} clientId - Client ID
 * @param {Object} message - Status update message
 */
const handleStatusUpdateMessage = (clientId, message) => {
  const client = clients.get(clientId);
  
  if (!client) return;

  client.status = message.status;
  
  if (message.taskProgress && client.tasks.length > 0) {
    // Could update UI with progress information
    console.log(`Task progress from client ${clientId}:`, message.taskProgress);
  }
};

/**
 * Broadcast the list of connected clients to all clients
 */
const broadcastClientList = () => {
  const clientList = Array.from(clients.entries()).map(([id, client]) => ({
    id,
    capabilities: client.capabilities,
    status: client.status,
    tasks: client.tasks.length
  }));

  const message = JSON.stringify({
    type: 'client_list',
    clients: clientList
  });

  for (const client of clients.values()) {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(message);
    }
  }
};

/**
 * Find the best available client for a task
 * @returns {string|null} Client ID or null if no clients available
 */
const findBestAvailableClient = () => {
  let bestClient = null;
  let bestScore = -1;

  for (const [clientId, client] of clients.entries()) {
    // Skip clients that are not ready or don't have LM Studio
    if (client.status !== 'ready' || !client.capabilities?.hasLMStudio) {
      continue;
    }

    // Simple scoring system based on hardware capabilities
    // This could be made more sophisticated
    let score = 0;
    
    // Prefer clients with fewer active tasks
    score += 100 - (client.tasks.length * 10);
    
    // Prefer clients with GPU
    if (client.capabilities.gpu && !client.capabilities.gpu.includes('Unknown')) {
      score += 50;
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestClient = clientId;
    }
  }

  return bestClient;
};

/**
 * Submit a task to be processed by a worker client
 * @param {string} type - Task type (e.g., 'analyze_image')
 * @param {Object} data - Task data
 * @returns {Promise<Object>} Task result
 */
export const submitTask = (type, data) => {
  return new Promise((resolve, reject) => {
    // Check if WebSocket server is enabled and running
    if (!USE_WEBSOCKET_SLAVE || !wss) {
      reject(new Error('WebSocket server is not enabled or running'));
      return;
    }

    // Check if we have any connected clients
    if (clients.size === 0) {
      reject(new Error('No worker clients connected'));
      return;
    }

    const taskId = uuidv4();
    
    // Store the task in pending tasks
    pendingTasks.set(taskId, {
      id: taskId,
      type,
      data,
      status: 'pending',
      createdAt: Date.now(),
      assignedTo: null,
      resolve,
      reject
    });

    // Try to assign the task immediately
    assignPendingTasks();
  });
};

/**
 * Assign pending tasks to available clients
 */
const assignPendingTasks = () => {
  // Get all pending tasks
  const tasks = Array.from(pendingTasks.values())
    .filter(task => task.status === 'pending')
    .sort((a, b) => a.createdAt - b.createdAt); // Process oldest tasks first

  if (tasks.length === 0) return;

  for (const task of tasks) {
    const clientId = findBestAvailableClient();
    
    if (!clientId) {
      console.log('No available clients for task assignment');
      return; // No available clients, try again later
    }

    const client = clients.get(clientId);
    
    // Assign task to client
    task.status = 'assigned';
    task.assignedTo = clientId;
    client.status = 'busy';
    client.tasks.push(task.id);
    
    console.log(`Assigning task ${task.id} to client ${clientId}`);
    
    // Send task to client
    client.ws.send(JSON.stringify({
      type: 'task',
      taskId: task.id,
      taskType: task.type,
      data: task.data
    }));
  }
};

/**
 * Check if WebSocket server is enabled
 * @returns {boolean} Whether WebSocket server is enabled
 */
export const isWebSocketEnabled = () => {
  return USE_WEBSOCKET_SLAVE;
};

/**
 * Get the status of the WebSocket server
 * @returns {Object} Status object with connected clients count
 */
export const getWebSocketStatus = () => {
  return {
    enabled: USE_WEBSOCKET_SLAVE,
    running: wss !== null,
    clientsCount: clients.size,
    clients: Array.from(clients.entries()).map(([id, client]) => ({
      id,
      capabilities: client.capabilities,
      status: client.status,
      tasks: client.tasks.length
    }))
  };
};

// Set up task scheduler to periodically check for pending tasks
setInterval(assignPendingTasks, 5000); // Check every 5 seconds
