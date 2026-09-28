import { io, Socket } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
// Socket.IO connects to the server root, not the /api path
const SOCKET_URL = API_URL.replace(/\/api\/?$/, "");

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  const token = localStorage.getItem("token");
  if (!token) return null;

  if (!socket) {
    socket = io(SOCKET_URL, {
      // A function, so every (re)connection reads the freshest token
      auth: (cb) => cb({ token: localStorage.getItem("token") }),
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
