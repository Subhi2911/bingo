// src/context/SocketContext.js
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import io from "socket.io-client";
import { BACKEND_URL } from "../config/backend";
import { useAuth } from "./AuthContext"; // or wherever user comes from

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = useAuth(); 

  // 1️⃣ Create socket ONCE
  useEffect(() => {
    socketRef.current = io(BACKEND_URL, {
      transports: ["websocket"],
      reconnection: true,
    });

    socketRef.current.on("updateOnlineUsers", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  // 2️⃣ Emit userOnline when socket + user ready
  useEffect(() => {
    if (!socketRef.current || !user?._id) return;

    const socket = socketRef.current;

    // initial emit
    socket.emit("userOnline", user._id);

    // re-emit on reconnect
    socket.on("connect", () => {
      socket.emit("userOnline", user._id);
    });

    return () => {
      socket.off("connect");
    };
  }, [user]);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        onlineUsers,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);