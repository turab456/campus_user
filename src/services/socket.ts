// src/services/socket.ts
import { io, Socket } from 'socket.io-client';
import { getAccessToken } from './backendApi';

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || 'https://campus-be-qkrx.onrender.com';

let socket: Socket | null = null;

export const initSocket = (userId: string): Socket => {
  if (socket) {
    socket.disconnect();
  }

  socket = io(SOCKET_URL, {
    withCredentials: true,
    transports: ['websocket', 'polling']
  });

  socket.on('connect', () => {
    console.log('[Socket] Connected to server');
    // Send in-memory JWT token for authenticated socket registration
    const token = getAccessToken();
    socket?.emit('register', { userId, token });
  });

  socket.on('disconnect', () => {
    console.log('[Socket] Disconnected from server');
  });

  return socket;
};

export const getSocket = (): Socket | null => {
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
