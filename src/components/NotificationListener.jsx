import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";

export default function NotificationListener() {
    const socketRef = useSocket();
    const socket = socketRef?.socket;
    const [notifications, setNotifications] = useState([]);
    const [hasUnread, setHasUnread] = useState(false);

    useEffect(() => {
        
        socket.on("newNotification", (notification) => {
            setNotifications(prev => [notification, ...prev]);
            setHasUnread(true); // red dot on bell
            console.log("New Notification:", notification);
        });

        return () => socket.off("newNotification");
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket]);

    return { notifications, hasUnread, setHasUnread };
}