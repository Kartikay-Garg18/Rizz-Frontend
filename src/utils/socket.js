import { io } from 'socket.io-client';

const API_URI = import.meta.env.VITE_APP_API_URI;

let socket = null;
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
let heartbeatInterval = null;

export const getSocket = (userId) => {
  if (!socket) {
    // Create Socket.io instance with enhanced configuration for CORS issues
    socket = io(API_URI, {
      query: { 
        userId,
        clientType: 'web', 
        clientVersion: '1.0.0',
        timestamp: Date.now()
      },
      transports: ['polling', 'websocket'], // Start with polling to establish connection reliably
      withCredentials: false, // Disable credentials to avoid CORS preflight issues
      reconnectionAttempts: MAX_RECONNECT_ATTEMPTS, // Maximum number of reconnection attempts
      reconnectionDelay: 1000, // Initial delay before reconnection (ms)
      reconnectionDelayMax: 10000, // Maximum delay between reconnections (ms)
      randomizationFactor: 0.5, // Randomization factor for reconnection attempts
      timeout: 20000, // Connection timeout (ms)
      autoConnect: false, // Don't connect automatically, we'll do it manually
      forceNew: false, // Reuse existing connection if available
      upgrade: true, // Allow transport upgrade (e.g., from polling to WebSocket)
      rememberUpgrade: true // Remember the transport across disconnections
    });

    // Set up event handlers
    socket.on('connect', () => {
      console.log('Socket connected successfully');
      reconnectAttempts = 0; // Reset reconnect attempts on successful connection
      
      // Start heartbeat to keep connection alive and detect server disconnections
      clearInterval(heartbeatInterval);
      heartbeatInterval = setInterval(() => {
        if (socket.connected) {
          socket.emit('heartbeat', { timestamp: Date.now() }, (response) => {
            // Response callback confirms the server received our heartbeat
            if (response && response.status === 'ok') {
              console.debug('Heartbeat acknowledged by server');
            }
          });
        }
      }, 30000); // Send heartbeat every 30 seconds
    });

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${reason}`);
      
      // Handle specific disconnect reasons
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, need to manually reconnect
        setTimeout(() => {
          if (!socket.connected && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            console.log('Attempting to reconnect after server disconnect');
            socket.connect();
            reconnectAttempts++;
          }
        }, 2000);
      }
      
      // Clear heartbeat interval on disconnect
      clearInterval(heartbeatInterval);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
    
    socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      
      // Try to switch transports on connection error
      if (error && socket.io.opts.transports.length > 1) {
        const currentTransport = socket.io.engine.transport.name;
        console.log(`Connection error with transport ${currentTransport}, trying alternative`);
      }
    });
    
    socket.on('reconnect', (attemptNumber) => {
      console.log(`Successfully reconnected after ${attemptNumber} attempts`);
    });
    
    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Reconnection attempt ${attemptNumber}/${MAX_RECONNECT_ATTEMPTS}`);
    });
    
    socket.on('reconnect_error', (error) => {
      console.error('Reconnection error:', error);
    });
    
    socket.on('reconnect_failed', () => {
      console.error('Failed to reconnect after maximum attempts');
    });
    
    // Confirmation from server that connection is established
    socket.on('connectionConfirmed', (data) => {
      console.log(`Connection confirmed by server. Socket ID: ${data.socketId}, Transport: ${data.transport}`);
    });
  }
  return socket;
};

export const connectSocket = (userId) => {
  const s = getSocket(userId);
  if (!s.connected) {
    console.log('Connecting socket for user:', userId);
    s.connect();
  }
  return s;
};

export const disconnectSocket = () => {
  if (socket) {
    if (socket.connected) {
      console.log('Disconnecting socket');
      socket.disconnect();
    }
    
    // Clear heartbeat interval
    clearInterval(heartbeatInterval);
  }
};
