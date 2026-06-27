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

const OtherProfile = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { userId } = route.params;
    const { user } = useAuth();

    const socketRef = useSocket();
    const socket = socketRef?.socket;
    const [otherUser, setOtherUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [requestStatus, setRequestStatus] = useState('none');

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

    React.useEffect(() => {
        fetchUserProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

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

            setOtherUser(data);
            setRequestStatus(data.requestStatus || "none");
        } catch (err) {
            console.log(err);
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
                socket.emit("sendFriendRequest", {
                    receiverId: userId,
                    senderId: user._id,
                    senderName: user.username,
                    senderAvatar: user.avatar
                })
            }
        } catch (err) {
            console.log(err);
        }
    };

    const navigateToChat = () => {
        const openChat = async () => {
            try {
                const response = await fetch(`${BACKEND_URL}/api/chat/findOrCreate`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        userId1: user?._id,   //  logged-in user
                        userId2: otherUser?._id,      // user clicked on
                        chatName: otherUser?.username,
                    }),
                });
                const chat = await response.json();
                // Navigate to Chat screen with the chatId
                navigation.navigate("Chat", { chatId: chat._id });
            } catch (err) {
                console.log(err);
            }
        };

        openChat();

    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#FFD740" />
            </View>
        );
    }

    if (!otherUser) {
        return (
            <ImageBackground
                source={require("../images/chat_bg.png")}
                style={styles.backgroundImage}
            >
                <View style={styles.overlay} />
                <SafeAreaView style={{ flex: 1 }}>
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

    const totalWins = (otherUser.wins?.classic || 0) + (otherUser.wins?.fast || 0) +
        (otherUser.wins?.power || 0) + (otherUser.wins?.private || 0);

    return (
        <ImageBackground
            source={require("../images/chat_bg.png")}
            style={styles.backgroundImage}
        >
            <View style={styles.overlay} />
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
                            activeOpacity={0.7}
                        >
                            <Icon name="arrow-left" size={16} color="#fff" />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Player Profile</Text>
                        <View style={{ flex: 1 }} />
                    </View>

                    {/* PROFILE CARD */}
                    <View style={styles.profileCard}>
                        {/* Avatar Section */}
                        <View style={styles.avatarContainer}>
                            <View style={styles.avatarRing}>
                                <View style={styles.avatarCircle}>
                                    <Text style={styles.avatarText}>{otherUser.avatar || "🎮"}</Text>
                                </View>
                                <View style={styles.levelBadge}>
                                    <Icon name="star" size={12} color="#FFD740" />
                                    <Text style={styles.levelBadgeText}>{otherUser.level}</Text>
                                </View>
                            </View>

                            <Text style={styles.username}>{otherUser.username}</Text>
                            <Text style={styles.playerId}>ID: {otherUser.playerId}</Text>
                        </View>

                        {/* Stats Grid */}
                        <View style={styles.statsGrid}>
                            {/* Row 1 */}
                            <View style={styles.statBox}>
                                <View style={styles.statIconBox}>
                                    <Icon name="trophy" size={18} color="#FFD740" />
                                </View>
                                <Text style={styles.statLabel}>Wins</Text>
                                <Text style={styles.statValue}>{totalWins}</Text>
                            </View>

                            <View style={styles.statBox}>
                                <View style={styles.statIconBox}>
                                    <Icon name="gamepad" size={18} color="#7EB3FF" />
                                </View>
                                <Text style={styles.statLabel}>Games</Text>
                                <Text style={styles.statValue}>{otherUser.totalGamesPlayed || 0}</Text>
                            </View>

                            {/* Row 2 */}
                            <View style={styles.statBox}>
                                <View style={styles.statIconBox}>
                                    <Icon name="coins" size={18} color="#FFD740" />
                                </View>
                                <Text style={styles.statLabel}>Coins</Text>
                                <Text style={styles.statValue}>{otherUser.money || 0}</Text>
                            </View>

                            <View style={styles.statBox}>
                                <View style={styles.statIconBox}>
                                    <Icon name="bolt" size={18} color="#7EB3FF" />
                                </View>
                                <Text style={styles.statLabel}>XP</Text>
                                <Text style={styles.statValue}>{otherUser.totalXp || 0}</Text>
                            </View>

                            {/* Row 3 */}
                            <View style={styles.statBox}>
                                <View style={styles.statIconBox}>
                                    <Icon name="fire" size={18} color="#FF6B35" />
                                </View>
                                <Text style={styles.statLabel}>Streak</Text>
                                <Text style={styles.statValue}>{otherUser.daysLoggedIn || 0}</Text>
                            </View>

                            <View style={styles.statBox}>
                                <View style={styles.statIconBox}>
                                    <Icon name="calendar" size={18} color="#7EB3FF" />
                                </View>
                                <Text style={styles.statLabel}>Days</Text>
                                <Text style={styles.statValue}>{otherUser.daysLoggedIn || 0}</Text>
                            </View>
                        </View>
                    </View>

                    {/* ACTION BUTTONS */}
                    <View style={styles.actionSection}>
                        {/* Message Button */}
                        <TouchableOpacity
                            style={styles.messageBtn}
                            onPress={navigateToChat}
                            activeOpacity={0.75}
                        >
                            <Icon name="comments" size={18} color="#fff" />
                            <Text style={styles.messageBtnText}>Message</Text>
                        </TouchableOpacity>

                        {/* Friend Status / Add Friend */}
                        {requestStatus === "friends" || otherUser.friends?.some(id => id.toString() === user._id) ? (
                            <View style={styles.friendStatusBtn}>
                                <Icon name="check-circle" size={18} color="#00E676" />
                                <Text style={styles.friendStatusText}>Friends</Text>
                            </View>
                        ) : requestStatus === "sent" || otherUser.pendingRequests?.some(id => id.toString() === user._id) ? (
                            <View style={styles.pendingStatusBtn}>
                                <Icon name="hourglass-half" size={18} color="#FFD740" />
                                <Text style={styles.pendingStatusText}>Pending</Text>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.addFriendBtn}
                                onPress={sendFriendRequest}
                                activeOpacity={0.75}
                            >
                                <Icon name="user-plus" size={18} color="#3D2000" />
                                <Text style={styles.addFriendText}>Add Friend</Text>
                            </TouchableOpacity>
                        )}
                    </View>

                    {/* REPORT BUTTON */}
                    <TouchableOpacity
                        style={styles.reportBtn}
                        activeOpacity={0.7}
                        onPress={() => setShowReportSheet(true)}
                    >
                        <Icon name="flag" size={16} color="#ff6b6b" />
                        <Text style={styles.reportBtnText}>Report User</Text>
                    </TouchableOpacity>
                </ScrollView>

                {/* REPORT MODAL */}
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
                                    <Icon name="check-circle" size={48} color="#00E676" />
                                    <Text style={styles.reportSentText}>Report Submitted</Text>
                                    <Text style={styles.reportSentSub}>
                                        Thank you. We'll review this shortly.
                                    </Text>
                                </View>
                            ) : (
                                <>
                                    <View style={styles.reportSheetHeader}>
                                        <Text style={styles.reportSheetTitle}>
                                            Report {otherUser.username}
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
                                        { label: "Cheating / Hacking", icon: "chess-knight" },
                                        { label: "Harassment", icon: "exclamation-circle" },
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

    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(10, 15, 50, 0.75)",
    },

    scrollContent: {
        paddingBottom: 20,
        paddingHorizontal: 14,
    },

    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

    /* Header */
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        paddingHorizontal: 8,
        marginBottom: 12,
        gap: 12,
    },

    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "rgba(255, 215, 64, 0.2)",
        borderWidth: 1.5,
        borderColor: "rgba(255, 215, 64, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },

    headerTitle: {
        fontSize: 18,
        fontWeight: "800",
        color: "#fff",
        letterSpacing: 0.3,
    },

    /* Profile Card */
    profileCard: {
        backgroundColor: "rgba(80, 162, 235, 0.12)",
        borderRadius: 24,
        borderWidth: 1.5,
        borderColor: "rgba(255, 215, 64, 0.25)",
        padding: 20,
        marginBottom: 16,
        overflow: "hidden",
    },

    avatarContainer: {
        alignItems: "center",
        marginBottom: 20,
        gap: 8,
    },

    avatarRing: {
        position: "relative",
        width: 100,
        height: 100,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 8,
    },

    avatarCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: "rgba(30, 50, 130, 0.6)",
        borderWidth: 3,
        borderColor: "#FFD740",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
    },

    avatarText: {
        fontSize: 48,
    },

    levelBadge: {
        position: "absolute",
        bottom: -2,
        right: -2,
        backgroundColor: "#FFD740",
        width: 42,
        height: 42,
        borderRadius: 21,
        justifyContent: "center",
        alignItems: "center",
        gap: 2,
        flexDirection: "row",
        borderWidth: 2.5,
        borderColor: "#1E3282",
        shadowColor: "#FFD740",
        shadowOpacity: 0.6,
        shadowRadius: 8,
        elevation: 6,
    },

    levelBadgeText: {
        fontSize: 12,
        fontWeight: "900",
        color: "#1E3282",
    },

    username: {
        fontSize: 26,
        fontWeight: "900",
        color: "#fff",
        letterSpacing: 0.5,
    },

    playerId: {
        fontSize: 12,
        color: "rgba(255, 255, 255, 0.65)",
        fontWeight: "600",
        letterSpacing: 1,
    },

    /* Stats Grid */
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 12,
        justifyContent: "space-between",
    },

    statBox: {
        width: "48%",
        backgroundColor: "rgba(255, 255, 255, 0.06)",
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255, 215, 64, 0.15)",
        padding: 14,
        alignItems: "center",
        gap: 6,
    },

    statIconBox: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: "rgba(255, 215, 64, 0.12)",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "rgba(255, 215, 64, 0.25)",
    },

    statLabel: {
        fontSize: 11,
        fontWeight: "700",
        color: "rgba(255, 255, 255, 0.6)",
        letterSpacing: 0.5,
    },

    statValue: {
        fontSize: 20,
        fontWeight: "900",
        color: "#fff",
    },

    /* Action Section */
    actionSection: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 12,
        justifyContent: "space-between",
    },

    messageBtn: {
        flex: 1,
        height: 52,
        borderRadius: 14,
        backgroundColor: "#7EB3FF",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        shadowColor: "#7EB3FF",
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 6,
    },

    messageBtnText: {
        fontSize: 15,
        fontWeight: "800",
        color: "#fff",
        letterSpacing: 0.3,
    },

    addFriendBtn: {
        flex: 1,
        height: 52,
        borderRadius: 14,
        backgroundColor: "#FFD740",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        shadowColor: "#FFD740",
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 6,
    },

    addFriendText: {
        fontSize: 15,
        fontWeight: "800",
        color: "#3D2000",
        letterSpacing: 0.3,
    },

    friendStatusBtn: {
        flex: 1,
        height: 52,
        borderRadius: 14,
        backgroundColor: "rgba(0, 230, 118, 0.15)",
        borderWidth: 2,
        borderColor: "rgba(0, 230, 118, 0.5)",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
    },

    friendStatusText: {
        fontSize: 15,
        fontWeight: "800",
        color: "#00E676",
        letterSpacing: 0.3,
    },

    pendingStatusBtn: {
        flex: 1,
        height: 52,
        borderRadius: 14,
        backgroundColor: "rgba(255, 215, 64, 0.15)",
        borderWidth: 2,
        borderColor: "rgba(255, 215, 64, 0.5)",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
    },

    pendingStatusText: {
        fontSize: 15,
        fontWeight: "800",
        color: "#FFD740",
        letterSpacing: 0.3,
    },

    /* Report Button */
    reportBtn: {
        width: "100%",
        height: 48,
        borderRadius: 12,
        backgroundColor: "rgba(220, 30, 30, 0.15)",
        borderWidth: 1.5,
        borderColor: "rgba(220, 30, 30, 0.4)",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
    },

    reportBtnText: {
        fontSize: 14,
        fontWeight: "700",
        color: "#ff6b6b",
        letterSpacing: 0.2,
    },

    /* Report Modal */
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.65)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
    },

    reportSheet: {
        width: "100%",
        maxWidth: 360,
        backgroundColor: "#0d1f4a",
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: "rgba(255, 60, 60, 0.3)",
        padding: 20,
        shadowColor: "#000",
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 10,
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
        marginTop: 8,
    },

    reportOption: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        paddingVertical: 13,
        paddingHorizontal: 14,
        borderRadius: 12,
        backgroundColor: "rgba(255, 255, 255, 0.06)",
        borderWidth: 1.5,
        borderColor: "rgba(255, 255, 255, 0.1)",
        marginBottom: 8,
    },

    reportOptionSelected: {
        backgroundColor: "rgba(220, 30, 30, 0.65)",
        borderColor: "rgba(255, 100, 100, 0.5)",
    },

    reportOptionText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#bbb",
        flex: 1,
    },

    reportSubmitBtn: {
        marginTop: 8,
        height: 48,
        borderRadius: 12,
        backgroundColor: "#DC1E1E",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#DC1E1E",
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 6,
    },

    reportSubmitText: {
        fontSize: 15,
        fontWeight: "800",
        color: "#fff",
        letterSpacing: 0.3,
    },

    reportSentWrap: {
        alignItems: "center",
        paddingVertical: 20,
        gap: 12,
    },

    reportSentText: {
        fontSize: 18,
        fontWeight: "900",
        color: "#fff",
    },

    reportSentSub: {
        fontSize: 13,
        color: "#7EB3FF",
        textAlign: "center",
    },
});