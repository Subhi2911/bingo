import React, { createContext, useContext, useState, useEffect } from "react";
import { useSocket } from "./SocketContext";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const { socketRef } = useSocket(); // get socketRef from context
    const [notifications, setNotifications] = useState([]);
    const [hasUnread, setHasUnread] = useState(false);

    useEffect(() => {
        console.log(socketRef);
        const socket = socketRef?.socket;
        if (!socket) return; 
        console.log('kajukatli');

        const handleNewNotification = (notification) => {
            setNotifications(prev => [notification, ...prev]);
            setHasUnread(true);
        };

        socket.on("newNotification", handleNewNotification);

        return () => {
            socket.off("newNotification", handleNewNotification);
        };
    }, [socketRef]);

    const markAllRead = () => {
        setHasUnread(false);
        setNotifications(prev =>
            prev.map(n => ({ ...n, isRead: true }))
        );
    };

    return (
        <NotificationContext.Provider value={{ notifications, hasUnread, setHasUnread, markAllRead }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);