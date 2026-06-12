import React, { createContext, useContext, useState, useEffect } from "react";
import { useSocket } from "./SocketContext";
import notifee from "@notifee/react-native";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    // ✅ FIX: useSocket() returns the ref directly — not { socketRef }
    const socketRef = useSocket();
    const [notifications, setNotifications] = useState([]);
    const [hasUnread, setHasUnread] = useState(false);

    useEffect(() => {
        const createChannel = async () => {
            await notifee.createChannel({
                id: 'default',
                name: 'Default Channel',
            });
        };

        createChannel();
    }, []);

    useEffect(() => {
        const socket = socketRef?.socket;
        if (!socket) return;

        const handleNewNotification = (notification) => {
            if (notification.type === "message") {
                // DO NOTHING here → handled by toast
                return;
            }

            setNotifications(prev => [notification, ...prev]);
            setHasUnread(true);
        };

        socket.on("newNotification", handleNewNotification);

        return () => {
            socket.off("newNotification", handleNewNotification);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socketRef?.socket]); // ✅ depend on the socket instance, not the ref wrapper

    const markAllRead = () => {
        setHasUnread(false);
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    return (
        <NotificationContext.Provider value={{ notifications, hasUnread, setHasUnread, markAllRead }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);