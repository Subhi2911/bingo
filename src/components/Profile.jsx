/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef } from "react";
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, Switch, Alert, Modal, Animated,
    ActivityIndicator,
    ImageBackground
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { BACKEND_URL } from "../config/backend";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/FontAwesome5";
import { showAlert2 } from "./CustomAlert2";

// ─── Theme ───────────────────────────────────────────────────────────────────
const T = {
    BG: "#7DC20A",          // lime green background
    CARD: "#4A7C00",        // dark green card
    BORDER: "#5A9400",      // medium green border
    GOLD: "#462700",        // primary gold accent — avatar ring, stat values
    GOLD_DIM: "#7e6500",    // lighter gold
    WHITE: "#FFFFFF",
    SUB: "#D9F99D",         // light yellow-green — readable on dark green cards
    DANGER: "#900101",      // red for destructive
    DANGER_BG: "#1A0000",
    NAV: "#2D5A00",         // dark green nav
    DIVIDER: "#3D6B0066",   // dark green divider
};

// ─── Avatar pool (same emoji set the app uses) ───────────────────────────────
const AVATARS =
    [
        '🐵', '🐶', '🐱', '🦁',
        '🐯', '🦊', '🐮', '🐭',
        '🐴', '🐸', '🐔', '🐍'
    ];

// ─── Reusable section card ────────────────────────────────────────────────────
function SettingCard({ children }) {
    return <View style={styles.card}>{children}</View>;
}

// ─── Single row ──────────────────────────────────────────────────────────────
function SettingRow({ icon, label, sub, right, onPress, danger, isLast }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={onPress ? 0.7 : 1}
            style={[styles.row, isLast && styles.rowLast]}
        >
            <View style={styles.rowIcon}>
                <Text style={styles.rowIconText}>{icon}</Text>
            </View>
            <View style={styles.rowContent}>
                <Text style={[styles.rowLabel, danger && { color: T.DANGER }]}>{label}</Text>
                {sub ? <Text style={styles.rowSub}>{sub}</Text> : null}
            </View>
            <View style={styles.rowRight}>{right}</View>
        </TouchableOpacity>
    );
}

function Divider() {
    return <View style={styles.divider} />;
}

function SectionTitle({ label }) {
    return <Text style={styles.sectionTitle}>{label}</Text>;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Settings({ route }) {
    const navigation = useNavigation();

    // Pull user from route params or refetch
    const [user, setUser] = useState(null);
    const [notifications, setNotifications] = useState(true);
    const [soundFx, setSoundFx] = useState(true);
    const [haptics, setHaptics] = useState(true);

    // Avatar picker modal
    const [avatarModal, setAvatarModal] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar ?? "🐟");
    const [saving, setSaving] = useState(false);
    const modalAnim = useRef(new Animated.Value(0)).current;

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
                setUser(json);
            } catch (e) {
                console.log(e);
            }
        };
        getMyUser();
    }, []);

    const openAvatarModal = () => {
        setAvatarModal(true);
        Animated.spring(modalAnim, {
            toValue: 1, useNativeDriver: true, damping: 18, stiffness: 200,
        }).start();
    };

    const closeAvatarModal = () => {
        Animated.timing(modalAnim, {
            toValue: 0, duration: 200, useNativeDriver: true,
        }).start(() => setAvatarModal(false));
    };

    // ── Save avatar & reset stats ─────────────────────────────────────────────
    const confirmAvatarChange = () => {
        showAlert2({
            type: 'confirm', title: "Reset your stats?", message: "Changing your avatar will reset your wins, level, XP, stars, and streak to zero. This cannot be undone.",
            onConfirm: () => { saveAvatar() }
        });
        // Alert.alert(
        //     "Reset your stats?",
        //     "Changing your avatar will reset your wins, level, XP, stars, and streak to zero. This cannot be undone.",
        //     [
        //         { text: "Cancel", style: "cancel" },
        //         {
        //             text: "Change & Reset",
        //             style: "destructive",
        //             onPress: () => saveAvatar(),
        //         },
        //     ]
        // );
    };

    const saveAvatar = async () => {
        setSaving(true);
        try {
            const token = await AsyncStorage.getItem("authToken");
            const res = await fetch(`${BACKEND_URL}/api/auth/change-avatar`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": token,
                },
                body: JSON.stringify({ avatar: selectedAvatar }),
            });
            const json = await res.json();
            if (json.success) {
                setUser((u) => ({ ...u, avatar: selectedAvatar }));
                closeAvatarModal();
                //Alert.alert("Done!", "Avatar updated and stats reset.");
                showAlert2({ type: 'success', title: 'Done!', message: 'Avatar updated and stats reset' });
            } else {
                showAlert2({ type: 'error', title: 'Error', message: json.error || 'Something went wrong' });
            }
        } catch (e) {
            showAlert2({ type: 'error', title: 'Error', message: 'Could not connect to server.' });
        } finally {
            setSaving(false);
        }
    };

    // ── Logout ────────────────────────────────────────────────────────────────
    const handleLogout = () => {
        showAlert2({
            type: 'confirm', title: 'Log out', message: 'Are you sure you want to log out?', onConfirm: async () => {
                await AsyncStorage.removeItem("authToken");
                navigation.reset({ index: 0, routes: [{ name: "Login" }] });
            },
        })
        // Alert.alert("Log out", "Are you sure you want to log out?", [
        //     { text: "Cancel", style: "cancel" },
        //     {
        //         text: "Log out",
        //         style: "destructive",
        //         onPress: async () => {
        //             await AsyncStorage.removeItem("authToken");
        //             navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        //         },
        //     },
        // ]);
    };

    // ── Delete account ────────────────────────────────────────────────────────
    const handleDeleteAccount = () => {
        showAlert2({
            type: 'confirm', title: 'Delete account', message: 'This will permanently delete your account and all data. There is no going back.',
            onConfirm: async () => {
                try {
                    const token = await AsyncStorage.getItem("authToken");
                    await fetch(`${BACKEND_URL}/api/auth/delete-account`, {
                        method: "DELETE",
                        headers: { "auth-token": token },
                    });
                    await AsyncStorage.clear();
                    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
                } catch {
                    Alert.alert("Error", "Could not delete account.");
                }
            },
        });
        // Alert.alert(
        //     "Delete account",
        //     "This will permanently delete your account and all data. There is no going back.",
        //     [
        //         { text: "Cancel", style: "cancel" },
        //         {
        //             text: "Delete",
        //             style: "destructive",
        //             onPress: async () => {
        //                 try {
        //                     const token = await AsyncStorage.getItem("authToken");
        //                     await fetch(`${BACKEND_URL}/api/auth/delete-account`, {
        //                         method: "DELETE",
        //                         headers: { "auth-token": token },
        //                     });
        //                     await AsyncStorage.clear();
        //                     navigation.reset({ index: 0, routes: [{ name: "Login" }] });
        //                 } catch {
        //                     Alert.alert("Error", "Could not delete account.");
        //                 }
        //             },
        //         },
        //     ]
        // );
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <ImageBackground
            source={require("../images/message_bg.png")}
            style={styles.background}
            resizeMode="cover">
            <SafeAreaView style={styles.safe}>
                <ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Icon
                            name="arrow-left"
                            size={26}
                            color="#000"
                            onPress={() => navigation.goBack()}
                        />
                        <Text style={styles.headerTitle}>Settings</Text>
                        <View style={{ width: 36 }} />
                    </View>

                    {/* Profile summary */}
                    <View style={styles.profileRow}>
                        <TouchableOpacity onPress={openAvatarModal} style={styles.avatarWrap}>
                            <Text style={styles.avatarEmoji}>{user?.avatar || "🐟"}</Text>
                            <View style={styles.avatarEditBadge}>
                                <Text style={styles.avatarEditIcon}>✏️</Text>
                            </View>
                        </TouchableOpacity>
                        <View style={styles.profileInfo}>
                            <Text style={styles.profileName}>{user?.username ?? "—"}</Text>
                            <Text style={styles.profileEmail}>{user?.email ?? "—"}</Text>
                            <View style={styles.profileBadge}>
                                <Text style={styles.profileBadgeText}>Level {user?.level ?? 1}</Text>
                            </View>
                        </View>
                    </View>

                    {/* ── Account ── */}
                    <SectionTitle label="Account" />
                    <SettingCard>
                        <SettingRow
                            icon="🎭"
                            label="Change avatar"
                            sub="Resets all stats to zero"
                            onPress={openAvatarModal}
                            right={<Text style={styles.chevron}>›</Text>}
                        />
                        <Divider />
                        <SettingRow
                            icon="🔑"
                            label="Change password"
                            onPress={() => navigation.navigate("ChangePassword")}
                            right={<Text style={styles.chevron}>›</Text>}
                            isLast
                        />
                    </SettingCard>

                    {/* ── Game ── */}
                    <SectionTitle label="Game" />
                    <SettingCard>
                        <SettingRow
                            icon="🔔"
                            label="Notifications"
                            sub="Friend requests and messages"
                            right={
                                <Switch
                                    value={notifications}
                                    onValueChange={setNotifications}
                                    trackColor={{ false: T.GOLD_DIM, true: T.GOLD }}
                                    thumbColor={T.WHITE}
                                />
                            }
                        />
                        <Divider />
                        <SettingRow
                            icon="🎵"
                            label="Sound effects"
                            right={
                                <Switch
                                    value={soundFx}
                                    onValueChange={setSoundFx}
                                    trackColor={{ false: T.GOLD_DIM, true: T.GOLD }}
                                    thumbColor={T.WHITE}
                                />
                            }
                        />
                        <Divider />
                        <SettingRow
                            icon="📳"
                            label="Haptic feedback"
                            right={
                                <Switch
                                    value={haptics}
                                    onValueChange={setHaptics}
                                    trackColor={{ false: T.GOLD_DIM, true: T.GOLD }}
                                    thumbColor={T.WHITE}
                                />
                            }
                            isLast
                        />
                    </SettingCard>

                    {/* ── Stats ── */}
                    <SectionTitle label="Stats" />
                    <SettingCard>
                        <View style={styles.statsGrid}>
                            {[
                                { label: "Total XP", value: user?.totalXp ?? 0, icon: "⭐" },
                                { label: "Rank", value: `#${user?.rank ?? "—"}`, icon: "🏆" },
                                { label: "Stars", value: `${user?.stars ?? 0} / 5`, icon: "✨" },
                                { label: "Days logged in", value: user?.daysLoggedIn ?? 0, icon: "📅" },
                            ].map((stat) => (
                                <View key={stat.label} style={styles.statBox}>
                                    <Text style={styles.statIcon}>{stat.icon}</Text>
                                    <Text style={styles.statValue}>{stat.value}</Text>
                                    <Text style={styles.statLabel}>{stat.label}</Text>
                                </View>
                            ))}
                        </View>
                    </SettingCard>

                    {/* ── About ── */}
                    <SectionTitle label="About" />
                    <SettingCard>
                        <SettingRow
                            icon="📋"
                            label="Terms of service"
                            onPress={() => navigation.navigate("TermsOfService")}
                            right={<Text style={styles.chevron}>›</Text>}
                        />
                        <Divider />
                        <SettingRow
                            icon="🔒"
                            label="Privacy policy"
                            onPress={() => navigation.navigate("PrivacyPolicy")}
                            right={<Text style={styles.chevron}>›</Text>}
                        />
                        <Divider />
                        <SettingRow
                            icon="ℹ️"
                            label="App version"
                            right={<Text style={styles.versionText}>1.0.0</Text>}
                            isLast
                        />
                    </SettingCard>

                    {/* ── Danger zone ── */}
                    <SectionTitle label="Account actions" />
                    <SettingCard>
                        <SettingRow
                            icon="🚪"
                            label="Log out"
                            danger
                            onPress={handleLogout}
                            right={<Text style={[styles.chevron, { color: T.DANGER }]}>›</Text>}
                        />
                        <Divider />
                        <SettingRow
                            icon="🗑️"
                            label="Delete account"
                            sub="Permanently removes all data"
                            danger
                            onPress={handleDeleteAccount}
                            right={<Text style={[styles.chevron, { color: T.DANGER }]}>›</Text>}
                            isLast
                        />
                    </SettingCard>

                    <View style={{ height: 40 }} />
                </ScrollView>

                {/* ── Avatar picker modal ── */}
                <Modal visible={avatarModal} transparent animationType="none">
                    <View style={styles.modalOverlay}>
                        <Animated.View
                            style={[
                                styles.modalSheet,
                                {
                                    transform: [{
                                        translateY: modalAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [400, 0],
                                        }),
                                    }],
                                    opacity: modalAnim,
                                },
                            ]}
                        >
                            <View style={styles.modalHandle} />
                            <Text style={styles.modalTitle}>Pick an avatar</Text>
                            <Text style={styles.modalSub}>
                                Changing your avatar resets all stats to zero.
                            </Text>

                            {/* Grid */}
                            <View style={styles.avatarGrid}>
                                {AVATARS.map((emoji) => (
                                    <TouchableOpacity
                                        key={emoji}
                                        onPress={() => setSelectedAvatar(emoji)}
                                        style={[
                                            styles.avatarOption,
                                            selectedAvatar === emoji && styles.avatarOptionSelected,
                                        ]}
                                    >
                                        <Text style={styles.avatarOptionEmoji}>{emoji}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            {/* Preview */}
                            <View style={styles.previewRow}>
                                <View style={styles.previewCircle}>
                                    <Text style={styles.previewEmoji}>{selectedAvatar}</Text>
                                </View>
                                <Text style={styles.previewLabel}>
                                    {selectedAvatar === user?.avatar
                                        ? "Current avatar"
                                        : "New avatar selected"}
                                </Text>
                            </View>

                            {/* Actions */}
                            <View style={styles.modalActions}>
                                <TouchableOpacity onPress={closeAvatarModal} style={styles.btnCancel}>
                                    <Text style={styles.btnCancelText}>Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={confirmAvatarChange}
                                    style={[
                                        styles.btnConfirm,
                                        selectedAvatar === user?.avatar && styles.btnDisabled,
                                    ]}
                                    disabled={selectedAvatar === user?.avatar || saving}
                                >
                                    {saving ? (
                                        <ActivityIndicator color={T.NAV} />
                                    ) : (
                                        <Text style={[styles.btnConfirmText]}>
                                            Save & reset stats{"  "}
                                            <Text style={{ fontSize: 12, color: "#e1d11f", marginLeft: 4 }}>
                                                <Icon name="coins" size={12} color="#e1d11f" style={{ marginLeft: 3 }} /> 2000
                                            </Text>
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </Animated.View>
                    </View>
                </Modal>
            </SafeAreaView>
        </ImageBackground>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({


    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        paddingLeft: 12,
        color: '#000',
    },
    backBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: T.CARD,
        justifyContent: "center",
        alignItems: "center",
    },
    backArrow: {
        color: T.GOLD,
        fontSize: 20,
        lineHeight: 22,
    },

    // Profile row
    profileRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: T.CARD,
        borderWidth: 1,
        borderColor: T.BORDER,
        borderRadius: 20,
        padding: 16,
        marginBottom: 24,
        gap: 16,
    },
    avatarWrap: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: "#000",
        borderWidth: 2,
        borderColor: T.GOLD,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarEmoji: {
        fontSize: 40,
    },
    avatarEditBadge: {
        position: "absolute",
        bottom: -2,
        right: -2,
        backgroundColor: T.GOLD,
        width: 22,
        height: 22,
        borderRadius: 11,
        justifyContent: "center",
        alignItems: "center",
    },
    avatarEditIcon: {
        fontSize: 11,
    },
    profileInfo: {
        flex: 1,
        gap: 2,
    },
    profileName: {
        color: T.WHITE,
        fontSize: 18,
        fontWeight: "700",
    },
    profileEmail: {
        color: T.SUB,
        fontSize: 13,
    },
    profileBadge: {
        marginTop: 4,
        alignSelf: "flex-start",
        backgroundColor: "#7C3AED55",
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    profileBadgeText: {
        color: T.GOLD,
        fontSize: 12,
        fontWeight: "600",
    },

    // Section title
    sectionTitle: {
        color: T.GOLD,
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 1.2,
        textTransform: "uppercase",
        marginBottom: 8,
        marginLeft: 4,
    },

    // Card
    card: {
        backgroundColor: T.CARD,
        borderWidth: 1,
        borderColor: T.BORDER,
        borderRadius: 18,
        marginBottom: 20,
        overflow: "hidden",
    },

    // Row
    row: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 14,
        gap: 12,
        borderBottomWidth: 1,
        borderBottomColor: T.DIVIDER,
    },
    rowLast: {
        borderBottomWidth: 0,
    },
    rowIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "#7C3AED33",
        justifyContent: "center",
        alignItems: "center",
    },
    rowIconText: {
        fontSize: 18,
    },
    rowContent: {
        flex: 1,
    },
    rowLabel: {
        color: T.WHITE,
        fontSize: 15,
        fontWeight: "500",
    },
    rowSub: {
        color: T.SUB,
        fontSize: 12,
        marginTop: 2,
    },
    rowRight: {
        flexShrink: 0,
    },
    chevron: {
        color: T.SUB,
        fontSize: 22,
        lineHeight: 24,
    },
    versionText: {
        color: T.SUB,
        fontSize: 14,
    },
    divider: {
        height: 1,
        backgroundColor: T.DIVIDER,
        marginLeft: 64,
    },

    // Stats grid
    statsGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        padding: 12,
        gap: 10,
    },
    statBox: {
        width: "47%",
        backgroundColor: "#7C3AED22",
        borderRadius: 14,
        padding: 12,
        alignItems: "center",
        gap: 4,
    },
    statIcon: {
        fontSize: 22,
    },
    statValue: {
        color: T.GOLD,
        fontSize: 18,
        fontWeight: "700",
    },
    statLabel: {
        color: T.SUB,
        fontSize: 12,
        textAlign: "center",
    },

    // Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: "#00000088",
        justifyContent: "flex-end",
    },
    modalSheet: {
        backgroundColor: T.CARD,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        borderWidth: 1,
        borderColor: T.BORDER,
        padding: 20,
        paddingBottom: 36,
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: T.BORDER,
        borderRadius: 2,
        alignSelf: "center",
        marginBottom: 16,
    },
    modalTitle: {
        color: T.WHITE,
        fontSize: 20,
        fontWeight: "700",
        textAlign: "center",
    },
    modalSub: {
        color: T.DANGER,
        fontSize: 13,
        textAlign: "center",
        marginTop: 6,
        marginBottom: 16,
    },
    avatarGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 10,
        justifyContent: "center",
        marginBottom: 16,
    },
    avatarOption: {
        width: 52,
        height: 52,
        borderRadius: 14,
        backgroundColor: "#7C3AED22",
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor: "transparent",
    },
    avatarOptionSelected: {
        borderColor: T.GOLD,
        backgroundColor: "#F8B55F22",
    },
    avatarOptionEmoji: {
        fontSize: 28,
    },
    previewRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        marginBottom: 20,
    },
    previewCircle: {
        width: 52,
        height: 52,
        borderRadius: 26,
        backgroundColor: "#000",
        borderWidth: 2,
        borderColor: T.GOLD,
        justifyContent: "center",
        alignItems: "center",
    },
    previewEmoji: {
        fontSize: 28,
    },
    previewLabel: {
        color: T.SUB,
        fontSize: 14,
    },
    modalActions: {
        flexDirection: "row",
        gap: 12,
    },
    btnCancel: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: T.BORDER,
        alignItems: "center",
    },
    btnCancelText: {
        color: T.SUB,
        fontSize: 15,
        fontWeight: "600",
    },
    btnConfirm: {
        flex: 2,
        paddingVertical: 14,
        borderRadius: 14,
        backgroundColor: T.GOLD,
        alignItems: "center",
    },
    btnDisabled: {
        opacity: 0.4,
    },
    btnConfirmText: {
        color: T.WHITE,
        fontSize: 15,
        fontWeight: "700",
    },
});