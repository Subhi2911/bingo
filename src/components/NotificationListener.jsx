import { useEffect, useRef } from "react";
import notifee, { AndroidImportance } from "@notifee/react-native";
import { useSocket } from "../context/SocketContext";

export default function NotificationListener() {
  const socketRef = useSocket();
  const channelCreated = useRef(false);

  useEffect(() => {
    const socket = socketRef?.socket;
    if (!socket) return;

    let handler;

    const setup = async () => {
      try {
        // Create channel only once
        if (!channelCreated.current) {
          await notifee.createChannel({
            id: "messages",
            name: "Messages",
            importance: AndroidImportance.HIGH,
          });
          channelCreated.current = true;
        }

        handler = async (data) => {
          console.log("Notification received:", data);

          try {
            await notifee.displayNotification({
              title: data.title,
              body: data.body,
              android: {
                channelId: "messages",
                pressAction: { id: "default" },
              },
            });
          } catch (err) {
            console.log("displayNotification error:", err);
          }
        };

        socket.on("newNotification", handler);
      } catch (err) {
        console.log("NotificationListener error:", err);
      }
    };

    setup();

    return () => {
      if (socket && handler) {
        socket.off("newNotification", handler);
      }
    };
  }, [socketRef?.socket]);

  return null;
}