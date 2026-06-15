/* eslint-disable react-native/no-inline-styles */
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState, useCallback } from 'react'
import Icon from "react-native-vector-icons/FontAwesome5";
import { useNavigation } from '@react-navigation/native';
import { BACKEND_URL } from '../config/backend';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from "react-native";
import { useSocket } from '../context/SocketContext';

const Messaging = () => {
    const navigation   = useNavigation();
    const [chats, setChats]         = useState([]);
    const [userData, setUserData]   = useState(null);
    const [loadingChats, setLoadingChats] = useState(true);
    const socketRef    = useSocket();
    const socket       = socketRef?.socket;
    const onlineUsers  = socketRef?.onlineUsers;

    // ── My user data ──────────────────────────────────────────────────────────
    useEffect(() => {
        const getMyUserData = async () => {
            try {
                const token    = await AsyncStorage.getItem("authToken");
                const response = await fetch(`${BACKEND_URL}/api/auth/getUser`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json", "auth-token": token },
                });
                const json = await response.json();
                setUserData(json);
            } catch (error) {
                console.log("Error fetching user data:", error);
            }
        };
        getMyUserData();
    }, []);

    // ── Emit online status ────────────────────────────────────────────────────
    useEffect(() => {
        if (userData?._id && socket) socket.emit("userOnline", userData._id);
    }, [userData, socket]);

    // ── Fetch chats ───────────────────────────────────────────────────────────
    const fetchChats = useCallback(async () => {
        if (!userData?._id) return;
        try {
            setLoadingChats(true);
            const response = await fetch(`${BACKEND_URL}/api/chat/user/${userData._id}`);
            const data     = await response.json();
            setChats(data);
        } catch (error) {
            console.log("Error fetching chats:", error);
        } finally {
            setLoadingChats(false);
        }
    }, [userData]);

    useEffect(() => { fetchChats(); }, [fetchChats]);

    // ── Socket: update last message + unread dot live ─────────────────────────
    // When a new message arrives, bump the relevant chat's lastMessage so the
    // dot and preview text update without a full refetch.
    useEffect(() => {
        if (!socket || !userData) return;

        const handleNewMessage = (message) => {
            setChats(prev =>
                prev.map(chat => {
                    if (chat._id !== message.chatId) return chat;
                    return {
                        ...chat,
                        lastMessage: {
                            ...message,
                            // seenBy comes from the socket payload; keep it as-is
                        },
                    };
                })
            );
        };

        // When the user opens a chat and marks messages seen, update the dot
        const handleSeen = ({ chatId, seenBy }) => {
            if (seenBy !== userData._id) return; // only care about our own reads
            setChats(prev =>
                prev.map(chat => {
                    if (chat._id !== chatId) return chat;
                    if (!chat.lastMessage) return chat;
                    return {
                        ...chat,
                        lastMessage: {
                            ...chat.lastMessage,
                            seenBy: [...new Set([...(chat.lastMessage.seenBy || []), seenBy])],
                        },
                    };
                })
            );
        };

        socket.on("receiveMessage", handleNewMessage);
        socket.on("message_seen",   handleSeen);

        return () => {
            socket.off("receiveMessage", handleNewMessage);
            socket.off("message_seen",   handleSeen);
        };
    }, [socket, userData]);

    // ── Helpers ───────────────────────────────────────────────────────────────
    const convertToDateAndDay = (timestamp) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    };

    // FIX: unread = lastMessage exists + sent by the OTHER user + I haven't seen it
    const isUnread = (chat) => {
        const lm = chat?.lastMessage;
        if (!lm) return false;

        const senderId = lm.sender?._id?.toString() || lm.sender?.toString();
        const myId     = userData?._id?.toString();

        // Only mark unread if the other person sent it (not me)
        if (senderId === myId) return false;

        // seenBy is an array of userIds — unread if my id is NOT in it
        const seenBy = lm.seenBy || [];
        return !seenBy.map(id => id.toString()).includes(myId);
    };

    // ── Row renderer ──────────────────────────────────────────────────────────
    const renderUsers = ({ item }) => {
        const otherUser = item.participants.find(
            p => p._id.toString() !== userData?._id?.toString()
        );

        const isOtherUserOnline = otherUser
            ? onlineUsers?.includes(otherUser._id)
            : false;

        const unread = isUnread(item);

        // Safe last message preview — lastMessage may be null
        const lastText = item?.lastMessage?.text;
        const preview  = lastText
            ? lastText.length > 28 ? `${lastText.substring(0, 28)}…` : lastText
            : "No messages yet";

        return (
            <TouchableOpacity
                style={styles.userContainer}
                onPress={() => navigation.navigate("Chat", { chatId: item._id })}
            >
                {/* Avatar */}
                <Text style={styles.avatarText}>{otherUser?.avatar || '🐟'}</Text>

                {/* Name + preview */}
                <View style={{ flex: 1 }}>
                    <View style={styles.nameRow}>
                        <Text style={[styles.username, unread && styles.usernameUnread]}>
                            {otherUser?.username}
                        </Text>
                        <Text style={{ color: isOtherUserOnline ? "#22c55e" : "#9ca3af", fontSize: 11, marginLeft: 6 }}>
                            {isOtherUserOnline ? "Online" : "Offline"}
                        </Text>
                    </View>

                    {/* Bold preview text if unread */}
                    <Text style={[styles.previewText, unread && styles.previewUnread]} numberOfLines={1}>
                        {preview}
                    </Text>
                </View>

                {/* Timestamp + unread dot */}
                <View style={styles.rightCol}>
                    <Text style={styles.dateText}>
                        {convertToDateAndDay(item?.lastMessage?.createdAt)}
                    </Text>

                    {/* FIX: only show dot when there's a genuinely unread message from the other user */}
                    {unread && <View style={styles.unreadDot} />}
                </View>
            </TouchableOpacity>
        );
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <View style={{ flex: 1 }}>
            <View style={styles.header}>
                <Text style={styles.MessagesText}>Messages</Text>
            </View>

            {loadingChats ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#F8B55F" />
                </View>
            ) : chats.length === 0 ? (
                <View style={styles.centered}>
                    <Text style={{ color: "#F8B55F" }}>No chats yet. Start the conversation!</Text>
                </View>
            ) : (
                <FlatList
                    data={chats}
                    keyExtractor={item => item._id}
                    renderItem={renderUsers}
                    contentContainerStyle={{ paddingBottom: 100 }}
                />
            )}
        </View>
    );
};

export default Messaging;

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    MessagesText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 16,
        color: '#ffffff',
    },
    centered: {
        marginTop: 40,
        alignItems: 'center',
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        backgroundColor: '#f4ddfc',
        marginHorizontal: 15,
        marginVertical: 5,
        borderRadius: 10,
        borderBottomColor: '#ddd',
    },
    avatarText: {
        fontSize: 32,
        marginRight: 16,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 2,
    },
    username: {
        fontSize: 16,
        fontWeight: '500',
        color: '#000',
    },
    usernameUnread: {
        fontWeight: '700',   // bolder name when unread
    },
    previewText: {
        color: '#6b6b6b',
        fontSize: 13,
    },
    previewUnread: {
        color: '#111',       // darker + bolder preview when unread
        fontWeight: '600',
    },
    rightCol: {
        alignItems: 'flex-end',
        gap: 6,
        marginLeft: 8,
    },
    dateText: {
        color: '#888',
        fontSize: 11,
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#7c3aed',  // purple to match your app theme
    },
});