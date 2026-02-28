import { io } from "socket.io-client";

export const createSocket = (token: string) => {
  return io("https://task-1-12j1.onrender.com/", {
    auth: {
      token,
    },
  });
};