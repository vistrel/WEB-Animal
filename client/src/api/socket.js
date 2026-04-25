import { io } from "socket.io-client";

function getSocketUrl() {
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  return apiUrl.replace(/\/api\/?$/, "");
}

export function createSocket(accessToken) {
  return io(getSocketUrl(), {
    auth: {
      token: accessToken,
    },
    transports: ["websocket", "polling"],
  });
}
