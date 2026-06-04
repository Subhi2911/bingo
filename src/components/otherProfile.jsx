/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    ImageBackground,
    ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute, useNavigation } from "@react-navigation/native";
import { BACKEND_URL } from "../config/backend";
import { SafeAreaView } from "react-native-safe-area-context";

const OtherProfile = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { userId } = route.params;

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [requestStatus, setRequestStatus] = useState("none");

    useEffect(() => {
        fetchUserProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchUserProfile = async () => {
        try {
            const token = await AsyncStorage.getItem("authToken");

            const res = await fetch(`${BACKEND_URL}/api/auth/user/${userId}`, {
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": token,
                },
            });

            const data = await res.json();
            console.log("Fetched user:", data);

            setUser(data);
            setRequestStatus(data.requestStatus || "none");
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const sendFriendRequest = async () => {
        try {
            const token = await AsyncStorage.getItem("authToken");

            const res = await fetch(`${BACKEND_URL}/api/auth/send-request/${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": token,
                },
            });

            if (res.ok) {
                setRequestStatus("sent");
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#FFD740" />
            </View>
        );
    }

    if (!user) {
        return (
            <ImageBackground
                source={require("../images/chat_bg.png")}
                style={styles.backgroundImage}
            >
                <SafeAreaView>
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backBtn}
                            onPress={() => navigation.goBack()}
                        >
                            <Icon name="arrow-left" size={16} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Player Profile</Text>
                    </View>
                    <View style={styles.center}>
                        <Text style={{ color: "#fff" }}>User not found</Text>
                    </View>
                </SafeAreaView>
            </ImageBackground>
        );
    }

    return (
        <ImageBackground
            source={require("../images/chat_bg.png")}
            style={styles.backgroundImage}
        >
            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* HEADER */}
                    <View style={styles.header}>
                        <TouchableOpacity
                            style={styles.backBtn}
                            onPress={() => navigation.goBack()}
                            activeOpacity={0.8}
                        >
                            <Icon name="arrow-left" size={15} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Player Profile</Text>
                    </View>

                    {/* AVATAR */}
                    <View style={styles.avatarSection}>
                        <View style={styles.avatarWrap}>
                            <View style={styles.avatarRing} />
                            <View style={styles.avatarInner}>
                                <Text style={styles.avatarEmoji}>
                                    {user.avatar || "🐟"}
                                </Text>
                            </View>
                            <View style={styles.levelBadge}>
                                <Text style={styles.levelText}>Lv {user.level}</Text>
                            </View>
                        </View>

                        <Text style={styles.username}>{user.username}</Text>

                        <View style={styles.onlineRow}>
                            <View style={styles.onlineDot} />
                            <Text style={styles.onlineLabel}>Online now</Text>
                        </View>

                        <View style={styles.idChip}>
                            <Text style={styles.idText}>ID: {user.playerId}</Text>
                        </View>
                    </View>

                    {/* STATS */}
                    <View style={styles.statsGrid}>
                        <View style={[styles.statCard, styles.statCardWins]}>
                            <View style={styles.statIconWrap}>
                                <Text style={styles.statIconEmoji}>🏆</Text>
                            </View>
                            <Text style={styles.statValue}>{user.wins?.length || 0}</Text>
                            <Text style={styles.statLabel}>WINS</Text>
                        </View>

                        <View style={[styles.statCard, styles.statCardLevel]}>
                            <View style={styles.statIconWrap}>
                                <Text style={styles.statIconEmoji}>⭐</Text>
                            </View>
                            <Text style={styles.statValue}>{user.level}</Text>
                            <Text style={styles.statLabel}>LEVEL</Text>
                        </View>

                        <View style={[styles.statCard, styles.statCardXP]}>
                            <View style={styles.statIconWrap}>
                                <Text style={styles.statIconEmoji}>⚡</Text>
                            </View>
                            <Text style={styles.statValue}>{user.totalXp || 0}</Text>
                            <Text style={styles.statLabel}>XP</Text>
                        </View>
                    </View>

                    {/* STREAK CARD */}
                    <View style={styles.streakCard}>
                        <View style={styles.streakLeft}>
                            <View style={styles.fireWrap}>
                                <Text style={{ fontSize: 26 }}>🔥</Text>
                            </View>
                            <View>
                                <Text style={styles.streakTitle}>Current Streak</Text>
                                <Text style={styles.streakValue}>
                                    {user.streak || 0} Wins
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* BADGES */}
                    <View style={styles.badgesRow}>
                        {["🥉", "🔥", "👑", "🎯"].map((badge, i) => (
                            <View key={i} style={styles.badgeChip}>
                                <Text style={{ fontSize: 24 }}>{badge}</Text>
                            </View>
                        ))}
                    </View>

                    {/* FRIEND ACTION */}
                    {requestStatus === "friends" ? (
                        <View style={styles.friendBadge}>
                            <Icon name="check-circle" size={18} color="#00E676" />
                            <Text style={styles.friendText}>Friends</Text>
                        </View>
                    ) : requestStatus === "sent" ? (
                        <View style={styles.pendingBadge}>
                            <Icon name="clock" size={16} color="#FFD740" />
                            <Text style={styles.pendingText}>Request Sent</Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.addFriendBtn}
                            onPress={sendFriendRequest}
                            activeOpacity={0.85}
                        >
                            <Icon name="user-plus" size={17} color="#3D2000" />
                            <Text style={styles.addFriendText}>Add Friend</Text>
                        </TouchableOpacity>
                    )}

                    {/* REPORT */}
                    <TouchableOpacity style={styles.reportBtn} activeOpacity={0.8}>
                        <Icon name="exclamation-triangle" size={15} color="#f0c9c9" />
                        <Text style={styles.reportText}>Report User</Text>
                    </TouchableOpacity>
                </ScrollView>
            </SafeAreaView>
        </ImageBackground>
    );
};

export default OtherProfile;

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        resizeMode: "cover",
    },

    scrollContent: {
        paddingBottom: 36,
        alignItems: "center",
    },

    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#1565C0",
    },

    /* Header */
    header: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        paddingHorizontal: 18,
        paddingTop: 12,
        marginBottom: 18,
        gap: 12,
    },
    backBtn: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: "rgba(0,0,0,0.28)",
        borderWidth: 1.5,
        borderColor: "rgba(255,255,255,0.4)",
        justifyContent: "center",
        alignItems: "center",
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: "#fff",
        letterSpacing: 0.2,
    },

    /* Avatar */
    avatarSection: {
        alignItems: "center",
        marginBottom: 6,
        gap: 8,
    },
    avatarWrap: {
        width: 116,
        height: 116,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 4,
    },
    avatarRing: {
        position: "absolute",
        width: 116,
        height: 116,
        borderRadius: 58,
        borderWidth: 4,
        borderColor: "#FFD740",
        shadowColor: "#FFD740",
        shadowOpacity: 0.8,
        shadowRadius: 14,
        elevation: 10,
    },
    avatarInner: {
        width: 104,
        height: 104,
        borderRadius: 52,
        backgroundColor: "#0a0a0a",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },
    avatarEmoji: {
        fontSize: 62,
        textAlign: "center",
        textAlignVertical: "center",
    },
    levelBadge: {
        position: "absolute",
        bottom: -2,
        right: -2,
        backgroundColor: "#FFD740",
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 20,
        borderWidth: 2.5,
        borderColor: "#1565C0",
        shadowColor: "#000",
        shadowOpacity: 0.35,
        shadowRadius: 4,
        elevation: 5,
    },
    levelText: {
        fontSize: 11,
        fontWeight: "900",
        color: "#3D2000",
    },
    username: {
        fontSize: 24,
        fontWeight: "900",
        color: "#fff",
        letterSpacing: 0.4,
        textShadowColor: "rgba(0,0,0,0.4)",
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 6,
    },
    onlineRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    onlineDot: {
        width: 9,
        height: 9,
        borderRadius: 5,
        backgroundColor: "#00E676",
        shadowColor: "#00E676",
        shadowOpacity: 1,
        shadowRadius: 6,
        elevation: 3,
    },
    onlineLabel: {
        fontSize: 13,
        fontWeight: "700",
        color: "#00E676",
    },
    idChip: {
        backgroundColor: "rgba(0,0,0,0.25)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.22)",
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 5,
    },
    idText: {
        fontSize: 12,
        fontWeight: "600",
        color: "rgba(255,255,255,0.75)",
        letterSpacing: 0.5,
    },

    /* Stats */
    statsGrid: {
        flexDirection: "row",
        width: "92%",
        justifyContent: "space-between",
        marginTop: 22,
        gap: 8,
    },
    statCard: {
        flex: 1,
        borderRadius: 22,
        borderWidth: 2,
        paddingVertical: 18,
        alignItems: "center",
        gap: 5,
        shadowColor: "#000",
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 8,
    },
    statCardWins: {
        backgroundColor: "#1035A0",
        borderColor: "#3A6AE8",
    },
    statCardLevel: {
        backgroundColor: "#1035A0",
        borderColor: "#3A6AE8",
    },
    statCardXP: {
        backgroundColor: "#1035A0",
        borderColor: "#3A6AE8",
    },
    statIconWrap: {
        width: 46,
        height: 46,
        borderRadius: 15,
        backgroundColor: "rgba(255,255,255,0.14)",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1.5,
        borderColor: "rgba(255,255,255,0.22)",
    },
    statIconEmoji: { fontSize: 23 },
    statValue: {
        fontSize: 32,
        fontWeight: "900",
        color: "#fff",
        letterSpacing: -0.5,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: "800",
        color: "#7EB3FF",
        letterSpacing: 1.4,
    },

    /* Streak */
    streakCard: {
        width: "92%",
        marginTop: 10,
        backgroundColor: "#1035A0",
        borderRadius: 22,
        borderWidth: 2,
        borderColor: "#3A6AE8",
        padding: 18,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 8,
    },
    streakLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
    },
    fireWrap: {
        width: 54,
        height: 54,
        borderRadius: 17,
        backgroundColor: "rgba(255,100,30,0.28)",
        borderWidth: 1.5,
        borderColor: "rgba(255,120,50,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    streakTitle: {
        fontSize: 12,
        fontWeight: "600",
        color: "#7EB3FF",
        marginBottom: 2,
    },
    streakValue: {
        fontSize: 28,
        fontWeight: "900",
        color: "#fff",
    },
    streakRight: {
        alignItems: "flex-end",
    },
    weekLabel: {
        fontSize: 11,
        fontWeight: "600",
        color: "#7EB3FF",
        marginBottom: 8,
    },
    weekDots: {
        flexDirection: "row",
        gap: 5,
    },
    dot: {
        width: 11,
        height: 11,
        borderRadius: 6,
        backgroundColor: "rgba(255,255,255,0.15)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.12)",
    },
    dotActive: {
        backgroundColor: "#FF6B35",
        borderColor: "#FF8C5A",
        shadowColor: "#FF6B35",
        shadowOpacity: 0.9,
        shadowRadius: 5,
        elevation: 4,
    },

    /* Badges */
    badgesRow: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 14,
        marginTop: 14,
    },
    badgeChip: {
        width: 58,
        height: 58,
        borderRadius: 18,
        backgroundColor: "#1035A0",
        borderWidth: 2,
        borderColor: "#3A6AE8",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
    },

    /* Buttons */
    addFriendBtn: {
        width: "92%",
        height: 58,
        marginTop: 22,
        borderRadius: 18,
        backgroundColor: "#FFD740",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
        shadowColor: "#FFB300",
        shadowOpacity: 0.7,
        shadowRadius: 14,
        elevation: 10,
    },
    addFriendText: {
        fontSize: 17,
        fontWeight: "900",
        color: "#3D2000",
        letterSpacing: 0.3,
    },
    reportBtn: {
        width: "92%",
        height: 52,
        marginTop: 12,
        borderRadius: 18,
        backgroundColor: "rgba(220, 30, 30, 0.97)",
        borderWidth: 2,
        borderColor: "rgba(255,60,60,0.45)",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 10,
    },
    reportText: {
        fontSize: 15,
        fontWeight: "700",
        color: "#f5d3d3",
    },

    /* Status badges */
    friendBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginTop: 22,
        backgroundColor: "rgba(0,230,118,0.14)",
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: "rgba(0,230,118,0.4)",
        width: "92%",
        justifyContent: "center",
    },
    friendText: {
        color: "#00E676",
        fontWeight: "800",
        fontSize: 16,
    },
    pendingBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginTop: 22,
        backgroundColor: "rgba(255,215,64,0.14)",
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: "rgba(255,215,64,0.4)",
        width: "92%",
        justifyContent: "center",
    },
    pendingText: {
        color: "#FFD740",
        fontWeight: "800",
        fontSize: 16,
    },
});