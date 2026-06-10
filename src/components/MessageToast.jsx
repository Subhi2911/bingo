/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { View, Text, Animated, StyleSheet, TouchableOpacity } from "react-native";
import { useSocket } from "../context/SocketContext";

const CARD = "#4A1D52";  // Deep plum
const BORDER = "#C026D3";  // Bright magenta
const GOLD = "#F9A8D4";  // Soft pink highlight
const SUB = "#F5D0FE";  // Light pink text
const DEEP = "#2A0E33";  // Very dark purple

export default function MessageToast() {
    const socketRef = useSocket();
    const socket = socketRef?.socket;

    const [msg, setMsg] = useState(null);
    const slideAnim = useRef(new Animated.Value(-80)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const animRef = useRef(null);
    const navigation = useNavigation();

    useEffect(() => {
        console.log('llll', socket, 'socketRef', socketRef);
        if (!socket) return;

        const handler = (data) => {
            console.log("got data", data);
            if (data.type !== "message") return;

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

    return (

        <Animated.View
            style={[
                styles.toast,
                {
                    opacity: fadeAnim,
                    transform: [{ translateY: slideAnim }],
                },
            ]}

        >
            <TouchableOpacity
                onPress={() => {
                    console.log("Toast clicked", msg.chatId);
                    navigation.navigate("Chat", { chatId: msg.chatId });
                }}
                style={styles.container}
            >
                {/* Gold left accent bar */}
                <View style={styles.accentBar}   />

                {/* Avatar */}
                <View style={styles.avatarRing}>
                    <Text style={styles.avatarEmoji}>
                        {msg.sender?.avatar || "🐟"}
                    </Text>
                </View>

                {/* Text */}
                <View style={styles.textContainer}>
                    <Text style={styles.name} numberOfLines={1}>
                        {msg.sender?.username || msg.title}
                    </Text>
                    <Text style={styles.message} numberOfLines={2}>
                        {msg.body}
                    </Text>
                </View>

                {/* Live dot */}
                <View style={styles.liveDot} />
            </TouchableOpacity>
        </Animated.View >

    );
}

const styles = StyleSheet.create({
    toast: {
        position: "absolute",
        top: 56,
        left: 12,
        right: 12,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: CARD,
        borderWidth: 1,
        borderColor: BORDER,
        borderRadius: 18,
        paddingVertical: 10,
        paddingHorizontal: 14,
        gap: 12,
        elevation: 16,
        shadowColor: "#000",
        shadowOpacity: 0.4,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        zIndex: 99999,
        overflow: "hidden",
        marginHorizontal: 12,
    },
    container:{
        flexDirection:'row',
        alignItems: "center",
        padding:0,
        margin:0,
        gap:12,

    },
    // Left gold bar
    accentBar: {
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: 3,
        backgroundColor: GOLD,
        borderTopLeftRadius: 18,
        borderBottomLeftRadius: 18,
        marginRight:2,
    },
    avatarRing: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 2,
        borderColor: GOLD,
        backgroundColor: DEEP,
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
        color: GOLD,
        fontWeight: "700",
        fontSize: 14,
        marginBottom: 2,
    },
    message: {
        color: SUB,
        fontSize: 13,
        lineHeight: 18,
    },
    // Pulsing dot indicating live/unread
    liveDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: GOLD,
        flexShrink: 0,
        alignSelf: "flex-start",
        marginTop: 4,
    },
});