/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { View, Text, Animated, StyleSheet, TouchableOpacity } from "react-native";
import { useSocket } from "../context/SocketContext";

// Color themes keyed by notification type
const COLORS = {
    message: {
        CARD: "#4A1D52",   // Deep plum
        BORDER: "#C026D3", // Bright magenta
        GOLD: "#F9A8D4",   // Soft pink highlight
        SUB: "#F5D0FE",    // Light pink text
        DEEP: "#2A0E33",   // Very dark purple
    },
    friendRequest: {
        CARD: "#134E4A",   // Deep teal
        BORDER: "#14B8A6", // Bright teal
        GOLD: "#5EEAD4",   // Soft mint highlight
        SUB: "#CCFBF1",    // Light mint text
        DEEP: "#042F2E",   // Very dark teal
    },
};

// Fallback so styles never reference undefined if an unknown type arrives
const FALLBACK_COLORS = COLORS.message;

export default function MessageToast() {
    const socketRef = useSocket();
    const socket = socketRef?.socket;

    const [msg, setMsg] = useState(null);
    const slideAnim = useRef(new Animated.Value(-80)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const animRef = useRef(null);
    const navigation = useNavigation();

    useEffect(() => {
        if (!socket) return;

        const handler = (data) => {
            if (data.type !== "message" && data.type !== "friendRequest") return;

            // Cancel any running animation before starting a new one
            if (animRef.current) animRef.current.stop();

            setMsg(data);
            slideAnim.setValue(-80);
            fadeAnim.setValue(0);

            const sequence = Animated.sequence([
                // Slide + fade in together
                Animated.parallel([
                    Animated.spring(slideAnim, {
                        toValue: 0,
                        useNativeDriver: true,
                        damping: 18,
                        stiffness: 220,
                    }),
                    Animated.timing(fadeAnim, {
                        toValue: 1,
                        duration: 250,
                        useNativeDriver: true,
                    }),
                ]),
                Animated.delay(4000),
                // Fade + slide out together
                Animated.parallel([
                    Animated.timing(fadeAnim, {
                        toValue: 0,
                        duration: 350,
                        useNativeDriver: true,
                    }),
                    Animated.timing(slideAnim, {
                        toValue: -80,
                        duration: 350,
                        useNativeDriver: true,
                    }),
                ]),
            ]);

            animRef.current = sequence;
            sequence.start(({ finished }) => {
                if (finished) setMsg(null);
            });
        };

        socket.on("newNotification", handler);
        return () => {
            socket.off("newNotification", handler);
            if (animRef.current) animRef.current.stop();
        };
    }, [socket]);

    if (!msg) return null;

    // Resolve the correct color set at render time based on msg.type
    const c = COLORS[msg.type] ?? FALLBACK_COLORS;

    return (
        <Animated.View
            style={[
                styles.toast,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                    backgroundColor: c.CARD,
                    borderColor: c.BORDER,
                },
            ]}
        >
            <TouchableOpacity
                onPress={() => {
                    if (msg.type === "message") {
                        navigation.navigate("Chat", { chatId: msg.chatId });
                    } else if (msg.type === "friendRequest") {
                        navigation.navigate("Friends", {
                            screen: "Requests",
                            params: { userId: msg.senderId },
                        });
                    }
                }}
                style={styles.container}
            >
                {/* Left accent bar — color driven by type */}
                <View style={[styles.accentBar, { backgroundColor: c.GOLD }]} />

                {/* Avatar with gold ring */}
                <View style={[styles.avatarRing, { borderColor: c.GOLD, backgroundColor: c.DEEP }]}>
                    <Text style={styles.avatarEmoji}>
                        {msg.sender?.avatar || msg.senderAvatar || "🐟"}
                    </Text>
                </View>

                {/* Text content */}
                <View style={styles.textContainer}>
                    <Text style={[styles.name, { color: c.GOLD }]} numberOfLines={1}>
                        {msg.sender?.username || msg.title}
                    </Text>
                    <Text style={[styles.message, { color: c.SUB }]} numberOfLines={2}>
                        {msg.body}
                    </Text>
                </View>

                {/* Live dot */}
                <View style={[styles.liveDot, { backgroundColor: c.GOLD }]} />
            </TouchableOpacity>
        </Animated.View>
    );
}

// Static styles only — no color values here, those are applied inline above
const styles = StyleSheet.create({
    toast: {
        position: "absolute",
        top: 56,
        left: 12,
        right: 12,
        borderWidth: 1,
        borderRadius: 18,
        paddingVertical: 10,
        paddingRight: 14,
        elevation: 16,
        shadowColor: "#000",
        shadowOpacity: 0.4,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        zIndex: 99999,
        overflow: "hidden",
    },
    container: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingLeft: 18,
    },
    accentBar: {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: 3,
        borderTopLeftRadius: 18,
        borderBottomLeftRadius: 18,
    },
    avatarRing: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        justifyContent: "center",
        alignItems: "center",
        flexShrink: 0,
    },
    avatarEmoji: {
        fontSize: 22,
    },
    textContainer: {
        flex: 1,
        minWidth: 0,
    },
    name: {
        fontWeight: "700",
        fontSize: 14,
        marginBottom: 2,
    },
    message: {
        fontSize: 13,
        lineHeight: 18,
    },
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        flexShrink: 0,
        alignSelf: "flex-start",
        marginTop: 4,
    },
});