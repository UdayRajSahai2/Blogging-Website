// frontend/src/services/socket.js
import { io } from "socket.io-client";
import { lookInSession } from "../common/session";

const BASE_URL = import.meta.env.VITE_SERVER_DOMAIN;

export const socket = io(BASE_URL, {
  autoConnect: false,
});
socket.on("connect_error", (err) => {
  console.log("Socket error:", err.message);
});
export const connectSocket = () => {
  const user = lookInSession("user");

  if (user?.access_token) {
    socket.auth = { token: user.access_token };
    socket.connect();
  }
};
