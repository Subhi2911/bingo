/* eslint-disable no-unused-vars */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef } from "react";
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, Switch, Modal, Animated,
    ActivityIndicator, ImageBackground, TextInput,
    KeyboardAvoidingView, Platform, Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { BACKEND_URL } from "../config/backend";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/FontAwesome5";
import { showAlert2 } from "./CustomAlert2";
//import useNotificationPermission from '../hooks/useNotificationPermission';
import { useFocusEffect } from '@react-navigation/native'
import { getNotificationStatus, requestNotificationPermission } from "../hooks/useNotificationPermission";
import { useAuth } from "../context/AuthContext";

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
    // Dark glass cards — deep forest green at ~80% opacity
    GLASS: "rgba(15,35,5,0.78)",
    GLASS_DARK: "rgba(10,25,3,0.88)",
    GLASS_BORDER: "rgba(255,255,255,0.10)",
    GLASS_INNER: "rgba(255,255,255,0.06)",

    // Text on dark glass — cream/ivory scale
    INK: "#F0EDD8",           // warm cream — primary text
    INK_MED: "#C8C4A0",       // muted cream — subtitles, labels
    INK_LIGHT: "#8A9070",     // dim sage — sub-labels, placeholders

    // Accent — same gold, richer against dark
    GOLD: "#E8920A",
    GOLD_LIGHT: "#FDE68A",
    GOLD_BG: "rgba(232,146,10,0.18)",

    // Danger
    DANGER: "#F87171",
    DANGER_BG: "rgba(248,113,113,0.12)",

    // Section label
    LABEL: "#A8C878",         // soft lime — section titles

    // Divider
    DIV: "rgba(255,255,255,0.08)",
};

const AVATARS = ['🐵', '🐶', '🐱', '🦁', '🐯', '🦊', '🐮', '🐭', '🐴', '🐸', '🐔', '🐍'];

// ─── Sub-components ───────────────────────────────────────────────────────────
function GlassCard({ children, style }) {
    return <View style={[styles.card, style]}>{children}</View>;
}

function SectionTitle({ label }) {
    return (
        <View style={styles.sectionTitleRow}>
            <View style={styles.sectionTitleBar} />
            <Text style={styles.sectionTitle}>{label}</Text>
        </View>
    );
}

function SettingRow({ icon, label, sub, right, onPress, danger, isLast }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={onPress ? 0.65 : 1}
            style={[styles.row, isLast && styles.rowLast]}
        >
            <View style={[styles.rowIconWrap, danger && { backgroundColor: T.DANGER_BG }]}>
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

// ─── Edit field modal ─────────────────────────────────────────────────────────
function EditModal({ visible, title, placeholder, value, onClose, onSave, multiline }) {
    const [text, setText] = useState(value ?? "");
    const slideAnim = useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        if (visible) {
            setText(value ?? "");
            Animated.spring(slideAnim, { toValue: 1, useNativeDriver: true, damping: 20, stiffness: 220 }).start();
        } else {
            Animated.timing(slideAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start();
        }
    }, [visible]);

    return (
        <Modal visible={visible} transparent animationType="none">
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <View style={styles.editOverlay}>
                    <Animated.View style={[styles.editSheet, {
                        transform: [{ translateY: slideAnim.interpolate({ inputRange: [0, 1], outputRange: [300, 0] }) }],
                        opacity: slideAnim,
                    }]}>
                        <View style={styles.modalHandle} />
                        <Text style={styles.editTitle}>{title}</Text>
                        <TextInput
                            style={[styles.editInput, multiline && { height: 90, textAlignVertical: "top" }]}
                            value={text}
                            onChangeText={setText}
                            placeholder={placeholder}
                            placeholderTextColor={T.INK_LIGHT}
                            multiline={multiline}
                            autoFocus
                            maxLength={multiline ? 160 : 24}
                        />
                        {multiline && (
                            <Text style={styles.charCount}>{text.length}/160</Text>
                        )}
                        <View style={styles.editActions}>
                            <TouchableOpacity style={styles.editBtnCancel} onPress={onClose}>
                                <Text style={styles.editBtnCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.editBtnSave, !text.trim() && { opacity: 0.4 }]}
                                onPress={() => { if (text.trim()) onSave(text.trim()); }}
                                disabled={!text.trim()}
                            >
                                <Text style={styles.editBtnSaveText}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Profile() {
    const navigation = useNavigation();

    //const [user, setUser] = useState(null);
    const { user, setUser }= useAuth();
    const [notifications, setNotifications] = useState(true);
    const [soundFx, setSoundFx] = useState(true);
    const [haptics, setHaptics] = useState(true);

    // Avatar modal
    const [avatarModal, setAvatarModal] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar||"🐟");
    const [saving, setSaving] = useState(false);
    const avatarAnim = useRef(new Animated.Value(0)).current;

    // Edit modals
    const [editNameVisible, setEditNameVisible] = useState(false);
    const [editBioVisible, setEditBioVisible] = useState(false);
    const [savingField, setSavingField] = useState(false);
    //const { requestNotificationPermission } = useNotificationPermission();

    useFocusEffect(
        React.useCallback(() => {
            const loadStatus = async () => {
                const enabled = await getNotificationStatus();
                setNotifications(enabled);
            };

            loadStatus();
        }, [])
    );


    // React.useEffect(() => {
    //     (async () => {
    //         try {
    //             const token = await AsyncStorage.getItem("authToken");
    //             const res = await fetch(`${BACKEND_URL}/api/auth/getuser`, {
    //                 method: "POST",
    //                 headers: { "Content-Type": "application/json", "auth-token": token },
    //             });
    //             const json = await res.json();
    //             setUser(json);
    //             setSelectedAvatar(json?.avatar ?? "🐟");
    //         } catch (e) { console.log(e); }
    //     })();
    // }, []);

    // ── Avatar modal ──────────────────────────────────────────────────────────
    const openAvatarModal = () => {
        setAvatarModal(true);
        Animated.spring(avatarAnim, { toValue: 1, useNativeDriver: true, damping: 18, stiffness: 200 }).start();
    };

    const closeAvatarModal = () => {
        Animated.timing(avatarAnim, { toValue: 0, duration: 200, useNativeDriver: true })
            .start(() => setAvatarModal(false));
    };

    const confirmAvatarChange = () => {
        showAlert2({
            type: "confirm",
            title: "Reset your stats?",
            message: "Changing your avatar resets wins, level, XP, stars and streak to zero.",
            onConfirm: saveAvatar,
        });
    };

    const saveAvatar = async () => {
        setSaving(true);
        try {
            const token = await AsyncStorage.getItem("authToken");
            const res = await fetch(`${BACKEND_URL}/api/auth/change-avatar`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "auth-token": token },
                body: JSON.stringify({ avatar: selectedAvatar }),
            });
            const json = await res.json();
            if (json.success) {
                setUser(u => ({ ...u, avatar: selectedAvatar }));
                closeAvatarModal();
                showAlert2({ type: "success", title: "Done!", message: "Avatar updated and stats reset." });
            } else {
                showAlert2({ type: "error", title: "Error", message: json.error || "Something went wrong." });
            }
        } catch {
            showAlert2({ type: "error", title: "Error", message: "Could not connect to server." });
        } finally {
            setSaving(false);
        }
    };

    // ── Save name / bio ───────────────────────────────────────────────────────
    const saveField = async (field, value) => {
        setSavingField(true);
        try {
            const token = await AsyncStorage.getItem("authToken");
            const res = await fetch(`${BACKEND_URL}/api/auth/update-profile`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "auth-token": token },
                body: JSON.stringify({ [field]: value }),
            });
            const json = await res.json();
            if (json.success) {
                setUser(u => ({ ...u, [field]: value }));
                setEditNameVisible(false);
                setEditBioVisible(false);
            } else {
                showAlert2({ type: "error", title: "Error", message: json.error || "Update failed." });
            }
        } catch {
            showAlert2({ type: "error", title: "Error", message: "Could not connect to server." });
        } finally {
            setSavingField(false);
        }
    };

    // ── Logout / delete ───────────────────────────────────────────────────────
    const handleLogout = () => {
        showAlert2({
            type: "confirm", title: "Log out", message: "Are you sure you want to log out?",
            onConfirm: async () => {
                await AsyncStorage.removeItem("authToken");
                navigation.navigate("Home");
            },
        });
    };

    const handleDeleteAccount = () => {
        showAlert2({
            type: "confirm", title: "Delete account",
            message: "This permanently deletes your account and all data. There is no going back.",
            onConfirm: async () => {
                try {
                    const token = await AsyncStorage.getItem("authToken");
                    await fetch(`${BACKEND_URL}/api/auth/delete-account`, {
                        method: "DELETE", headers: { "auth-token": token },
                    });
                    await AsyncStorage.clear();
                    navigation.navigate("Home");
                } catch {
                    showAlert2({ type: 'error', title: 'Error', message: 'Could not delete account.' });
                }
            },
        });
    };

    //ask permission
    // Inside App component, add this useEffect
    React.useEffect(() => {
        requestNotificationPermission();
    }, []);

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <ImageBackground
            source={require("../images/message_bg.png")}
            style={styles.bg}
            resizeMode="cover"
        >
            {/* Frosted tint over the background */}
            <View style={styles.bgTint} />

            <SafeAreaView style={styles.safe}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* ── Header ── */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <Icon name="arrow-left" size={16} color={T.INK} />
                        </TouchableOpacity>
                        <Text style={styles.headerTitle}>Settings</Text>
                        <View style={{ width: 36 }} />
                    </View>

                    {/* ── Hero profile card ── */}
                    <GlassCard style={styles.heroCard}>
                        {/* Avatar */}
                        <TouchableOpacity onPress={openAvatarModal} style={styles.heroAvatarWrap}>
                            <Text style={styles.heroAvatarEmoji}>{user?.avatar ?? "🐟"}</Text>
                            <View style={styles.heroAvatarBadge}>
                                <Icon name="pen" size={9} color="#fff" />
                            </View>
                        </TouchableOpacity>

                        {/* Name row */}
                        <View style={styles.heroNameRow}>
                            <Text style={styles.heroName}>{user?.username ?? "—"}</Text>
                            <TouchableOpacity onPress={() => setEditNameVisible(true)} style={styles.heroEditBtn}>
                                <Icon name="pen" size={11} color={T.GOLD} />
                            </TouchableOpacity>
                        </View>

                        {/* Email */}
                        <Text style={styles.heroEmail}>{user?.email ?? "—"}</Text>

                        {/* Bio row */}
                        <TouchableOpacity onPress={() => setEditBioVisible(true)} style={styles.heroBioWrap}>
                            <Text style={[styles.heroBio, !user?.bio && { color: T.INK_LIGHT, fontStyle: "italic" }]}>
                                {user?.bio || "Tap to add a bio…"}
                            </Text>
                            <Icon name="pen" size={10} color={T.INK_LIGHT} style={{ marginLeft: 6 }} />
                        </TouchableOpacity>

                        {/* Level badge */}
                        <View style={styles.heroLevelBadge}>
                            <Text style={styles.heroLevelText}>⭐ Level {user?.level ?? 1}</Text>
                        </View>
                    </GlassCard>

                    {/* ── Stats ── */}
                    <SectionTitle label="Your stats" />
                    <View style={styles.statsGrid}>
                        {[
                            { icon: "🏆", label: "Wins", value: (user?.wins?.classic + user?.wins?.fast + user?.wins?.power) || 0 },
                            { icon: "✨", label: "Games Played", value: `${user?.totalGamesPlayed ?? 0}` },
                            { icon: "⚡", label: "Total XP", value: user?.totalXp ?? 0 },
                            { icon: "📅", label: "Days in", value: user?.daysLoggedIn ?? 0 },
                        ].map(stat => (
                            <GlassCard key={stat.label} style={styles.statCard}>
                                <Text style={styles.statIcon}>{stat.icon}</Text>
                                <Text style={styles.statValue}>{stat.value}</Text>
                                <Text style={styles.statLabel}>{stat.label}</Text>
                            </GlassCard>
                        ))}
                    </View>

                    {/* ── Account ── */}
                    <SectionTitle label="Account" />
                    <GlassCard>
                        <SettingRow
                            icon="🎭"
                            label="Change avatar"
                            sub="Resets all stats to zero"
                            onPress={openAvatarModal}
                            right={<Icon name="chevron-right" size={13} color={T.INK_LIGHT} />}
                        />
                        <Divider />
                        <SettingRow
                            icon="✏️"
                            label="Edit name"
                            sub={user?.username ?? "—"}
                            onPress={() => setEditNameVisible(true)}
                            right={<Icon name="chevron-right" size={13} color={T.INK_LIGHT} />}
                        />
                        <Divider />
                        <SettingRow
                            icon="💬"
                            label="Edit bio"
                            sub={user?.bio ? user.bio.slice(0, 30) + (user.bio.length > 30 ? "…" : "") : "Not set"}
                            onPress={() => setEditBioVisible(true)}
                            right={<Icon name="chevron-right" size={13} color={T.INK_LIGHT} />}
                        />
                        <Divider />
                        <SettingRow
                            icon="🔑"
                            label="Change password"
                            onPress={() => navigation.navigate("ChangePassword")}
                            right={<Icon name="chevron-right" size={13} color={T.INK_LIGHT} />}
                            isLast
                        />
                    </GlassCard>

                    {/* ── Game settings ── */}
                    <SectionTitle label="Game" />
                    <GlassCard>
                        <SettingRow
                            icon="🔔"
                            label="Notifications"
                            sub="Friend requests & messages"
                            right={
                                <Switch
                                    value={notifications}
                                    onValueChange={async (val) => {
                                        if (val) {
                                            const granted = await requestNotificationPermission();
                                            setNotifications(granted);
                                        } else {
                                            Linking.openSettings();
                                        }
                                    }}
                                    trackColor={{ false: "#ccc", true: T.GOLD }}
                                    thumbColor="#fff"
                                />
                            }
                        />
                        <Divider />
                        <SettingRow
                            icon="🎵"
                            label="Sound effects"
                            right={
                                <Switch value={soundFx} onValueChange={setSoundFx}
                                    trackColor={{ false: "#ccc", true: T.GOLD }}
                                    thumbColor="#fff" />
                            }
                        />
                        <Divider />
                        <SettingRow
                            icon="📳"
                            label="Haptic feedback"
                            right={
                                <Switch value={haptics} onValueChange={setHaptics}
                                    trackColor={{ false: "#ccc", true: T.GOLD }}
                                    thumbColor="#fff" />
                            }
                            isLast
                        />
                    </GlassCard>
                    {/* // ── Payment History ── */}
                    <SectionTitle label="Payments" />
                    <GlassCard>
                        <SettingRow
                            icon="💳"
                            label="Transaction history"
                            sub="View all your purchases"
                            onPress={() => navigation.navigate("Receipts")}
                            right={<Icon name="chevron-right" size={13} color={T.INK_LIGHT} />}
                        />
                        <Divider />
                        <SettingRow
                            icon="📊"
                            label="Payment statistics"
                            sub="View your spending summary"
                            onPress={() => navigation.navigate("PaymentStats")}
                            right={<Icon name="chevron-right" size={13} color={T.INK_LIGHT} />}
                            isLast
                        />
                    </GlassCard>

                    {/* ── About ── */}
                    <SectionTitle label="About" />
                    <GlassCard>
                        <SettingRow
                            icon="📋"
                            label="Terms of service"
                            onPress={() => navigation.navigate("TermsOfService")}
                            right={<Icon name="chevron-right" size={13} color={T.INK_LIGHT} />}
                        />
                        <Divider />
                        <SettingRow
                            icon="🔒"
                            label="Privacy policy"
                            onPress={() => navigation.navigate("PrivacyPolicy")}
                            right={<Icon name="chevron-right" size={13} color={T.INK_LIGHT} />}
                        />
                        <Divider />
                        <SettingRow
                            icon="ℹ️"
                            label="App version"
                            right={<Text style={styles.versionBadge}>1.0.0</Text>}
                            isLast
                        />
                    </GlassCard>



                    {/* ── Danger zone ── */}
                    <SectionTitle label="Account actions" />
                    <GlassCard>
                        <SettingRow
                            icon="🚪"
                            label="Log out"
                            danger
                            onPress={handleLogout}
                            right={<Icon name="chevron-right" size={13} color={T.DANGER} />}
                        />
                        <Divider />
                        <SettingRow
                            icon="🗑️"
                            label="Delete account"
                            sub="Permanently removes all data"
                            danger
                            onPress={handleDeleteAccount}
                            right={<Icon name="chevron-right" size={13} color={T.DANGER} />}
                            isLast
                        />
                    </GlassCard>

                    <View style={{ height: 48 }} />
                </ScrollView>
            </SafeAreaView>

            {/* ── Avatar picker modal ── */}
            <Modal visible={avatarModal} transparent animationType="none">
                <View style={styles.modalOverlay}>
                    <Animated.View style={[styles.avatarSheet, {
                        transform: [{ translateY: avatarAnim.interpolate({ inputRange: [0, 1], outputRange: [500, 0] }) }],
                        opacity: avatarAnim,
                    }]}>
                        <View style={styles.modalHandle} />
                        <Text style={styles.modalTitle}>Choose an avatar</Text>
                        <Text style={styles.modalWarn}>⚠️ Changing avatar resets all your stats</Text>

                        <View style={styles.avatarGrid}>
                            {AVATARS.map(emoji => (
                                <TouchableOpacity
                                    key={emoji}
                                    onPress={() => setSelectedAvatar(emoji)}
                                    style={[styles.avatarOption, selectedAvatar === emoji && styles.avatarOptionSel]}
                                >
                                    <Text style={styles.avatarEmoji}>{emoji}</Text>
                                    {selectedAvatar === emoji && (
                                        <View style={styles.avatarCheck}>
                                            <Icon name="check" size={8} color="#fff" />
                                        </View>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Preview */}
                        <View style={styles.previewRow}>
                            <View style={styles.previewCircle}>
                                <Text style={{ fontSize: 32 }}>{selectedAvatar}</Text>
                            </View>
                            <Text style={styles.previewLabel}>
                                {selectedAvatar === user?.avatar ? "Current avatar" : "New avatar selected"}
                            </Text>
                        </View>

                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.btnCancel} onPress={closeAvatarModal}>
                                <Text style={styles.btnCancelText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.btnConfirm, (selectedAvatar === user?.avatar || saving) && styles.btnDisabled]}
                                onPress={confirmAvatarChange}
                                disabled={selectedAvatar === user?.avatar || saving}
                            >
                                {saving
                                    ? <ActivityIndicator color="#fff" />
                                    : <Text style={styles.btnConfirmText}>Save & reset  🪙 2000</Text>
                                }
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </View>
            </Modal>

            {/* ── Edit name modal ── */}
            <EditModal
                visible={editNameVisible}
                title="Edit name"
                placeholder="Your display name"
                value={user?.username}
                onClose={() => setEditNameVisible(false)}
                onSave={v => saveField("username", v)}
            />

            {/* ── Edit bio modal ── */}
            <EditModal
                visible={editBioVisible}
                title="Edit bio"
                placeholder="Tell people a bit about yourself…"
                value={user?.bio}
                onClose={() => setEditBioVisible(false)}
                onSave={v => saveField("bio", v)}
                multiline
            />
        </ImageBackground>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    bg: { flex: 1 },
    bgTint: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(5,18,2,0.84)",  // deep dark overlay — kills the bright lime
    },
    safe: { flex: 1 },

    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 24,
    },

    // ── Header ──
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 14,
        paddingHorizontal: 4,
    },
    backBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: "rgba(255,255,255,0.10)",
        justifyContent: "center", alignItems: "center",
        borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
        shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 4, elevation: 2,
    },
    headerTitle: {
        fontSize: 20, fontWeight: "800", color: T.INK,
        letterSpacing: 0.3,
    },

    // ── Glass card ──
    card: {
        backgroundColor: T.GLASS,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: T.GLASS_BORDER,
        marginBottom: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.4,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 6,
    },

    // ── Hero card ──
    heroCard: {
        alignItems: "center",
        paddingTop: 24,
        paddingBottom: 20,
        paddingHorizontal: 20,
        marginBottom: 24,
        gap: 6,
    },
    heroAvatarWrap: {
        width: 82, height: 82, borderRadius: 41,
        backgroundColor: "rgba(0,0,0,0.06)",
        borderWidth: 3, borderColor: T.GOLD,
        justifyContent: "center", alignItems: "center",
        marginBottom: 4,
        shadowColor: T.GOLD, shadowOpacity: 0.35, shadowRadius: 10, elevation: 6,
    },
    heroAvatarEmoji: { fontSize: 46 },
    heroAvatarBadge: {
        position: "absolute", bottom: 0, right: 0,
        width: 24, height: 24, borderRadius: 12,
        backgroundColor: T.GOLD,
        justifyContent: "center", alignItems: "center",
        borderWidth: 2, borderColor: "#fff",
    },
    heroNameRow: {
        flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4,
    },
    heroName: {
        fontSize: 22, fontWeight: "800", color: T.INK,
        letterSpacing: 0.2,
    },
    heroEditBtn: {
        width: 26, height: 26, borderRadius: 13,
        backgroundColor: T.GOLD_BG,
        borderWidth: 1, borderColor: T.GOLD,
        justifyContent: "center", alignItems: "center",
    },
    heroEmail: {
        fontSize: 13, color: T.INK_MED, marginBottom: 2,
    },
    heroBioWrap: {
        flexDirection: "row", alignItems: "center",
        maxWidth: "90%",
    },
    heroBio: {
        fontSize: 13, color: T.INK_MED,
        textAlign: "center", lineHeight: 18, flexShrink: 1,
    },
    heroLevelBadge: {
        marginTop: 10,
        backgroundColor: T.GOLD_BG,
        borderWidth: 1, borderColor: T.GOLD,
        borderRadius: 20,
        paddingHorizontal: 14, paddingVertical: 4,
    },
    heroLevelText: {
        color: T.GOLD, fontWeight: "700", fontSize: 13,
    },

    // ── Section title ──
    sectionTitleRow: {
        flexDirection: "row", alignItems: "center", gap: 8,
        marginBottom: 10, marginTop: 4, marginLeft: 2,
    },
    sectionTitleBar: {
        width: 4, height: 14, borderRadius: 2,
        backgroundColor: T.GOLD,
    },
    sectionTitle: {
        color: T.LABEL, fontSize: 12, fontWeight: "800",
        letterSpacing: 1.1, textTransform: "uppercase",
    },

    // ── Stats grid ──
    statsGrid: {
        flexDirection: "row", flexWrap: "wrap",
        gap: 10, marginBottom: 16,
    },
    statCard: {
        width: "47.5%",
        alignItems: "center",
        paddingVertical: 16,
        paddingHorizontal: 8,
        gap: 4,
    },
    statIcon: { fontSize: 22 },
    statValue: { fontSize: 20, fontWeight: "800", color: T.GOLD },
    statLabel: { fontSize: 11, color: T.INK_MED, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.5 },

    // ── Setting row ──
    row: {
        flexDirection: "row", alignItems: "center",
        paddingHorizontal: 16, paddingVertical: 13,
        gap: 12,
        borderBottomWidth: 1, borderBottomColor: T.DIV,
    },
    rowLast: { borderBottomWidth: 0 },
    rowIconWrap: {
        width: 36, height: 36, borderRadius: 10,
        backgroundColor: "rgba(255,255,255,0.08)",
        justifyContent: "center", alignItems: "center",
    },
    rowIconText: { fontSize: 17 },
    rowContent: { flex: 1 },
    rowLabel: { color: T.INK, fontSize: 15, fontWeight: "600" },
    rowSub: { color: T.INK_LIGHT, fontSize: 12, marginTop: 1 },
    rowRight: { flexShrink: 0 },

    divider: { height: 1, backgroundColor: T.DIV, marginLeft: 64 },

    versionBadge: {
        backgroundColor: "rgba(255,255,255,0.08)",
        color: T.INK_MED, fontSize: 13, fontWeight: "600",
        paddingHorizontal: 10, paddingVertical: 3,
        borderRadius: 10,
    },

    // ── Avatar modal ──
    modalOverlay: {
        flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end",
    },
    avatarSheet: {
        backgroundColor: "rgba(18,40,8,0.97)",
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        borderTopWidth: 1, borderColor: "rgba(255,255,255,0.10)",
        padding: 20, paddingBottom: 36,
    },
    modalHandle: {
        width: 40, height: 4, backgroundColor: "#ccc",
        borderRadius: 2, alignSelf: "center", marginBottom: 16,
    },
    modalTitle: {
        color: T.INK, fontSize: 20, fontWeight: "800",
        textAlign: "center", marginBottom: 4,
    },
    modalWarn: {
        color: T.DANGER, fontSize: 13, textAlign: "center", marginBottom: 16,
    },
    avatarGrid: {
        flexDirection: "row", flexWrap: "wrap", gap: 10,
        justifyContent: "center", marginBottom: 16,
    },
    avatarOption: {
        width: 54, height: 54, borderRadius: 16,
        backgroundColor: "rgba(255,255,255,0.07)",
        justifyContent: "center", alignItems: "center",
        borderWidth: 2, borderColor: "transparent",
    },
    avatarOptionSel: {
        borderColor: T.GOLD,
        backgroundColor: T.GOLD_BG,
    },
    avatarEmoji: { fontSize: 28 },
    avatarCheck: {
        position: "absolute", top: -4, right: -4,
        width: 16, height: 16, borderRadius: 8,
        backgroundColor: T.GOLD,
        justifyContent: "center", alignItems: "center",
    },
    previewRow: {
        flexDirection: "row", alignItems: "center",
        justifyContent: "center", gap: 12, marginBottom: 20,
    },
    previewCircle: {
        width: 56, height: 56, borderRadius: 28,
        backgroundColor: "rgba(0,0,0,0.05)",
        borderWidth: 2, borderColor: T.GOLD,
        justifyContent: "center", alignItems: "center",
    },
    previewLabel: { color: T.INK_MED, fontSize: 14, fontWeight: "600" },

    modalActions: { flexDirection: "row", gap: 12 },
    btnCancel: {
        flex: 1, paddingVertical: 14, borderRadius: 14,
        borderWidth: 1.5, borderColor: "#ddd", alignItems: "center",
    },
    btnCancelText: { color: T.INK_MED, fontSize: 15, fontWeight: "600" },
    btnConfirm: {
        flex: 2, paddingVertical: 14, borderRadius: 14,
        backgroundColor: T.GOLD, alignItems: "center",
        shadowColor: T.GOLD, shadowOpacity: 0.4, shadowRadius: 8, elevation: 4,
    },
    btnDisabled: { opacity: 0.38 },
    btnConfirmText: { color: "#fff", fontSize: 15, fontWeight: "700" },

    // ── Edit modal ──
    editOverlay: {
        flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "flex-end",
    },
    editSheet: {
        backgroundColor: "rgba(18,40,8,0.97)",
        borderTopLeftRadius: 28, borderTopRightRadius: 28,
        padding: 20, paddingBottom: 36,
    },
    editTitle: {
        color: T.INK, fontSize: 18, fontWeight: "800",
        textAlign: "center", marginBottom: 16,
    },
    editInput: {
        backgroundColor: "rgba(255,255,255,0.07)",
        borderWidth: 1.5, borderColor: "rgba(255,255,255,0.12)",
        borderRadius: 14,
        paddingHorizontal: 14, paddingVertical: 12,
        fontSize: 15, color: T.INK,
        marginBottom: 4,
    },
    charCount: {
        color: T.INK_LIGHT, fontSize: 11, textAlign: "right",
        marginBottom: 16, marginRight: 4,
    },
    editActions: { flexDirection: "row", gap: 12, marginTop: 12 },
    editBtnCancel: {
        flex: 1, paddingVertical: 13, borderRadius: 14,
        borderWidth: 1.5, borderColor: "#ddd", alignItems: "center",
    },
    editBtnCancelText: { color: T.INK_MED, fontSize: 15, fontWeight: "600" },
    editBtnSave: {
        flex: 2, paddingVertical: 13, borderRadius: 14,
        backgroundColor: T.GOLD, alignItems: "center",
    },
    editBtnSaveText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});