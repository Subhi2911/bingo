// src/context/SocketContext.js
import React, { createContext, useContext, useEffect, useRef } from "react";
import io from "socket.io-client";
import { BACKEND_URL } from "../config/backend";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
    const socketRef = useRef(null);

    useEffect(() => {
        socketRef.current = io(BACKEND_URL, {
            transports: ["websocket"],
            reconnection: true,
        });

        return () => {
            socketRef.current.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={socketRef}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
