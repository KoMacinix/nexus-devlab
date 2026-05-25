import { io } from "socket.io-client";

// Le proxy Vite redirige /socket.io vers le backend
const socket = io("/", {
  autoConnect: false,
  transports: ["websocket", "polling"],
});

export default socket;
