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
    Modal, 
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute, useNavigation } from "@react-navigation/native";
import { BACKEND_URL } from "../config/backend";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSocket } from "../context/SocketContext";
import { showAlert2 } from "./CustomAlert2";
import { useAuth } from "../context/AuthContext";

const OtherProfile = ({ myId, myUsername, myAvatar }) => {
    const route = useRoute();
    const navigation = useNavigation();
    const { userId } = route.params;
    const { user }= useAuth();

    const socketRef = useSocket();
    const socket = socketRef?.socket;
    //const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [requestStatus, setRequestStatus] = useState(user.requestStatus || 'none');
    const [myUser, setMyUser] = useState(null);

    const [showReportSheet, setShowReportSheet] = useState(false);
    const [reportReason, setReportReason] = useState("");
    const [reportSent, setReportSent] = useState(false);
    const [reportLoading, setReportLoading] = useState(false);

    const submitReport = async () => {
        if (!reportReason) return;
        setReportLoading(true);
        try {
            const token = await AsyncStorage.getItem("authToken");
            const res = await fetch(`${BACKEND_URL}/api/report/report/${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": token,
                },
                body: JSON.stringify({ reason: reportReason }),
            });
            console.log(res);
            if (res.ok) {
                setReportSent(true);
                setTimeout(() => {
                    setShowReportSheet(false);
                    setReportSent(false);
                    setReportReason("");
                }, 1800);
            }
        } catch (err) {
            console.log("Report error:", err);
        } finally {
            setReportLoading(false);
        }
    };

    // useEffect(() => {
    //     fetchUserProfile();
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, []);

    React.useEffect(() => {
        const getMyUser = async () => {
            try {
                const token = await AsyncStorage.getItem("authToken");
                const res = await fetch(`${BACKEND_URL}/api/auth/getuser`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "auth-token": token,
                    },
                });
                const json = await res.json();
                setMyUser(json);
            } catch (e) {
                console.log(e);
            }
        };
        getMyUser();
    }, []);

    // const fetchUserProfile = async () => {
    //     try {
    //         const token = await AsyncStorage.getItem("authToken");

    //         const res = await fetch(`${BACKEND_URL}/api/auth/user/${userId}`, {
    //             headers: {
    //                 "Content-Type": "application/json",
    //                 "auth-token": token,
    //             },
    //         });

    //         const data = await res.json();

    //         setUser(data);
    //         setRequestStatus(data.requestStatus || "none");
    //     } catch (err) {
    //         console.log(err);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

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
                socket.emit("sendFriendRequest", {
                    receiverId: userId,
                    senderId: myUser._id,
                    senderName: myUser.username,
                    senderAvatar: myUser.avatar
                })
            }
        } catch (err) {
            console.log(err);
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
                            <Text style={styles.statValue}>{(user.wins?.classic + user?.wins?.fast + user?.wins?.power + user?.wins?.private) || 0}</Text>
                            <Text style={styles.statLabel}>WINS</Text>
                        </View>

                        <View style={[styles.statCard, styles.statCardLevel]}>
                            <View style={styles.statIconWrap}>
                                <Text style={styles.statIconEmoji}>🎮</Text>
                            </View>
                            <Text style={styles.statValue}>{user.totalGamesPlayed}</Text>
                            <Text style={styles.statLabel}>Games played</Text>
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
                                <Text style={styles.streakTitle}>Maximum Streak</Text>
                                <Text style={styles.streakValue}>
                                    {user.daysLoggedIn || 0} Days
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
                    {requestStatus === "friends" ||user.friends?.some(id => id.toString() === myUser._id) ? (
                        <View style={styles.friendBadge}>
                            <Icon name="check-circle" size={18} color="#00E676" />
                            <Text style={styles.friendText}>Friends</Text>
                        </View>
                    ) : requestStatus === "sent" || user.pendingRequests?.some(id => id.toString() === myUser._id) ? (
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

                    {/* REPORT BUTTON */}
                    <TouchableOpacity
                        style={styles.reportBtn}
                        activeOpacity={0.8}
                        onPress={() => setShowReportSheet(true)}
                    >
                        <Icon name="exclamation-triangle" size={15} color="#f0c9c9" />
                        <Text style={styles.reportText}>Report User</Text>
                    </TouchableOpacity>
                </ScrollView>

                {/*
                  ✅ FIX: Modal moved outside the ScrollView (Modals render in their
                  own native top-level layer anyway, so nesting inside ScrollView
                  was harmless but a little misleading — keeping it as a sibling
                  makes the structure clearer).

                  ✅ FIX: added `transparent` + `animationType="fade"` so it behaves
                  like a real bottom-sheet/dialog overlay instead of a default
                  opaque full-screen white Modal.

                  ✅ FIX: added `onRequestClose` — required on Android or you'll get
                  a console warning/back-button crash on some RN versions.

                  ✅ FIX: `visible={showReportSheet}` is now the source of truth
                  instead of conditionally mounting/unmounting the whole Modal —
                  this also lets the fade/slide animation actually play.
                */}
                <Modal
                    visible={showReportSheet}
                    transparent
                    animationType="fade"
                    onRequestClose={() => {
                        setShowReportSheet(false);
                        setReportReason("");
                    }}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.reportSheet}>
                            {reportSent ? (
                                <View style={styles.reportSentWrap}>
                                    <Text style={{ fontSize: 36 }}>✅</Text>
                                    <Text style={styles.reportSentText}>Report Submitted</Text>
                                    <Text style={styles.reportSentSub}>
                                        Thank you. We'll review this shortly.
                                    </Text>
                                </View>
                            ) : (
                                <>
                                    <View style={styles.reportSheetHeader}>
                                        <Text style={styles.reportSheetTitle}>
                                            Report {user.username}
                                        </Text>
                                        <TouchableOpacity onPress={() => {
                                            setShowReportSheet(false);
                                            setReportReason("");
                                        }}>
                                            <Icon name="times" size={18} color="#aaa" />
                                        </TouchableOpacity>
                                    </View>

                                    <Text style={styles.reportSheetSub}>
                                        Select a reason
                                    </Text>

                                    {[
                                        { label: "Cheating / Hacking", icon: "skull-crossbones" },
                                        { label: "Harassment", icon: "angry" },
                                        { label: "Spam", icon: "ban" },
                                        { label: "Inappropriate username", icon: "user-slash" },
                                        { label: "Other", icon: "ellipsis-h" },
                                    ].map(({ label, icon }) => (
                                        <TouchableOpacity
                                            key={label}
                                            style={[
                                                styles.reportOption,
                                                reportReason === label && styles.reportOptionSelected,
                                            ]}
                                            onPress={() => setReportReason(label)}
                                            activeOpacity={0.8}
                                        >
                                            <Icon
                                                name={icon}
                                                size={14}
                                                color={reportReason === label ? "#fff" : "#aaa"}
                                            />
                                            <Text
                                                style={[
                                                    styles.reportOptionText,
                                                    reportReason === label && { color: "#fff", fontWeight: "700" },
                                                ]}
                                            >
                                                {label}
                                            </Text>
                                            {reportReason === label && (
                                                <Icon
                                                    name="check"
                                                    size={13}
                                                    color="#fff"
                                                    style={{ marginLeft: "auto" }}
                                                />
                                            )}
                                        </TouchableOpacity>
                                    ))}

                                    <TouchableOpacity
                                        style={[
                                            styles.reportSubmitBtn,
                                            !reportReason && { opacity: 0.4 },
                                        ]}
                                        onPress={() => {
                                            showAlert2({
                                                type: 'confirm',
                                                title: 'Are you sure?',
                                                message: 'After submission their account will freeze until proven innocent. In case of false report, your account will be banned.',
                                                onConfirm: submitReport
                                            })
                                        }}
                                        disabled={!reportReason || reportLoading}
                                        activeOpacity={0.85}
                                    >
                                        {reportLoading ? (
                                            <ActivityIndicator size="small" color="#fff" />
                                        ) : (
                                            <Text style={styles.reportSubmitText}>Submit Report</Text>
                                        )}
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    </View>
                </Modal>
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

    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.55)",
        justifyContent: "center",
        alignItems: "center",
    },

    /* Report Sheet */
    reportSheet: {
        width: "92%",
        backgroundColor: "#0d1f4a",
        borderRadius: 24,
        borderWidth: 2,
        borderColor: "rgba(255,60,60,0.35)",
        padding: 20,
        shadowColor: "#000",
        shadowOpacity: 0.5,
        shadowRadius: 16,
        elevation: 12,
    },
    reportSheetHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 4,
    },
    reportSheetTitle: {
        fontSize: 17,
        fontWeight: "800",
        color: "#fff",
    },
    reportSheetSub: {
        fontSize: 12,
        color: "#7EB3FF",
        fontWeight: "600",
        marginBottom: 14,
        marginTop: 2,
    },
    reportOption: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 13,
        paddingHorizontal: 16,
        borderRadius: 14,
        backgroundColor: "rgba(255,255,255,0.06)",
        borderWidth: 1.5,
        borderColor: "rgba(255,255,255,0.1)",
        marginBottom: 8,
    },
    reportOptionSelected: {
        backgroundColor: "rgba(220,30,30,0.75)",
        borderColor: "rgba(255,80,80,0.6)",
    },
    reportOptionText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#bbb",
    },
    reportSubmitBtn: {
        marginTop: 6,
        height: 52,
        borderRadius: 16,
        backgroundColor: "#DC1E1E",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#DC1E1E",
        shadowOpacity: 0.6,
        shadowRadius: 10,
        elevation: 8,
    },
    reportSubmitText: {
        fontSize: 16,
        fontWeight: "800",
        color: "#fff",
        letterSpacing: 0.3,
    },
    reportSentWrap: {
        alignItems: "center",
        paddingVertical: 20,
        gap: 10,
    },
    reportSentText: {
        fontSize: 20,
        fontWeight: "900",
        color: "#fff",
    },
    reportSentSub: {
        fontSize: 13,
        color: "#7EB3FF",
        textAlign: "center",
    },
});