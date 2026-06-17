import React from "react";
import { View, Text, StyleSheet, ImageBackground } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { useRoute } from "@react-navigation/native";

const FrozenScreen = () => {
    const route = useRoute();
    const { message, freezeUntil, reason } = route.params;

    const isWrongfulReport = reason === 'wrongful_report';

    return (
        <ImageBackground
            source={require("../images/chat_bg.png")}
            style={styles.bg}
        >
            <View style={styles.card}>
                <Icon
                    name={isWrongfulReport ? "gavel" : "lock"}
                    size={54}
                    color={isWrongfulReport ? "#FFD740" : "#e74c3c"}
                />
                <Text style={styles.title}>
                    {isWrongfulReport ? "Account Restricted" : "Account Frozen"}
                </Text>
                <Text style={styles.message}>{message}</Text>

                {freezeUntil && (
                    <View style={styles.timerChip}>
                        <Icon name="clock" size={14} color="#FFD740" />
                        <Text style={styles.timerText}>
                            Until {new Date(freezeUntil).toLocaleDateString()}
                        </Text>
                    </View>
                )}

                {!freezeUntil && (
                    <Text style={styles.sub}>
                        Our team is reviewing the situation.{"\n"}You'll be notified once resolved.
                    </Text>
                )}

                <View style={styles.supportChip}>
                    <Icon name="envelope" size={13} color="#7EB3FF" />
                    <Text style={styles.supportText}>littleaalu.appie@gmail.com</Text>
                </View>
            </View>
        </ImageBackground>
    );
};

const styles = StyleSheet.create({
    bg: { flex: 1, justifyContent: "center", alignItems: "center" },
    card: {
        width: "88%",
        backgroundColor: "#0d1f4a",
        borderRadius: 28,
        borderWidth: 2,
        borderColor: "rgba(255,60,60,0.4)",
        padding: 30,
        alignItems: "center",
        gap: 14,
    },
    title: {
        fontSize: 24,
        fontWeight: "900",
        color: "#fff",
        textAlign: "center",
    },
    message: {
        fontSize: 14,
        color: "#bbb",
        textAlign: "center",
        lineHeight: 22,
    },
    timerChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "rgba(255,215,64,0.12)",
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: "rgba(255,215,64,0.4)",
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    timerText: { color: "#FFD740", fontWeight: "700", fontSize: 13 },
    sub: {
        fontSize: 13,
        color: "#7EB3FF",
        textAlign: "center",
        lineHeight: 20,
    },
    supportChip: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 6,
    },
    supportText: { color: "#7EB3FF", fontSize: 13 },
});

export default FrozenScreen;