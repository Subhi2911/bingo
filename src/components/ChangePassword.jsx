/* eslint-disable react-native/no-inline-styles */
import React, { useState, useRef } from "react";
import {
    View, Text, StyleSheet, TouchableOpacity,
    TextInput, ImageBackground, Animated,
    ActivityIndicator, KeyboardAvoidingView,
    Platform, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/FontAwesome5";
import { BACKEND_URL } from "../config/backend";
import { showAlert2 } from "./CustomAlert2";

// ─── Same tokens as Profile / Terms / Privacy ─────────────────────────────────
const T = {
    GLASS: "rgba(15,35,5,0.78)",
    GLASS_BORDER: "rgba(255,255,255,0.10)",
    INK: "#F0EDD8",
    INK_MED: "#C8C4A0",
    INK_LIGHT: "#8A9070",
    GOLD: "#E8920A",
    GOLD_BG: "rgba(232,146,10,0.18)",
    LABEL: "#A8C878",
    DIV: "rgba(255,255,255,0.08)",
    DANGER: "#F87171",
    DANGER_BG: "rgba(248,113,113,0.12)",
};

// ─── Step definitions ─────────────────────────────────────────────────────────
const STEPS = [
    { key: "current",  label: "Current password",  placeholder: "Enter your current password" },
    { key: "new",      label: "New password",       placeholder: "At least 6 characters" },
    { key: "confirm",  label: "Confirm new password", placeholder: "Re-enter new password" },
];

// ─── Password strength ────────────────────────────────────────────────────────
function getStrength(pw) {
    if (!pw) return { level: 0, label: "", color: "transparent" };
    let score = 0;
    if (pw.length >= 6)  score++;
    if (pw.length >= 10) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (score <= 1) return { level: 1, label: "Weak",   color: T.DANGER };
    if (score <= 3) return { level: 2, label: "Fair",   color: "#FBBF24" };
    return             { level: 3, label: "Strong", color: "#4ADE80" };
}

// ─── Single input field ───────────────────────────────────────────────────────
function PasswordField({ label, placeholder, value, onChangeText, error, showStrength }) {
    const [visible, setVisible] = useState(false);
    const strength = showStrength ? getStrength(value) : null;

    return (
        <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>{label}</Text>

            <View style={[styles.inputRow, error && styles.inputRowError]}>
                <TextInput
                    style={styles.input}
                    placeholder={placeholder}
                    placeholderTextColor={T.INK_LIGHT}
                    value={value}
                    onChangeText={onChangeText}
                    secureTextEntry={!visible}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
                <TouchableOpacity onPress={() => setVisible(v => !v)} style={styles.eyeBtn}>
                    <Icon name={visible ? "eye-slash" : "eye"} size={15} color={T.INK_LIGHT} />
                </TouchableOpacity>
            </View>

            {/* Strength bar (new password only) */}
            {showStrength && value.length > 0 && (
                <View style={styles.strengthRow}>
                    <View style={styles.strengthTrack}>
                        {[1, 2, 3].map(i => (
                            <View
                                key={i}
                                style={[
                                    styles.strengthSeg,
                                    { backgroundColor: i <= strength.level ? strength.color : "rgba(255,255,255,0.08)" },
                                ]}
                            />
                        ))}
                    </View>
                    <Text style={[styles.strengthLabel, { color: strength.color }]}>
                        {strength.label}
                    </Text>
                </View>
            )}

            {error ? <Text style={styles.fieldError}>{error}</Text> : null}
        </View>
    );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function ChangePassword() {
    const navigation = useNavigation();

    const [current,  setCurrent]  = useState("");
    const [newPw,    setNewPw]    = useState("");
    const [confirm,  setConfirm]  = useState("");
    const [errors,   setErrors]   = useState({});
    const [loading,  setLoading]  = useState(false);

    // Shake animation for errors
    const shakeAnim = useRef(new Animated.Value(0)).current;

    const shake = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 8,  duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 6,  duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0,  duration: 40, useNativeDriver: true }),
        ]).start();
    };

    // ── Validate ──────────────────────────────────────────────────────────────
    const validate = () => {
        const e = {};
        if (!current.trim())          e.current = "Please enter your current password.";
        if (!newPw.trim())            e.newPw   = "Please enter a new password.";
        else if (newPw.length < 6)    e.newPw   = "Must be at least 6 characters.";
        else if (newPw === current)   e.newPw   = "New password must differ from current.";
        if (!confirm.trim())          e.confirm = "Please confirm your new password.";
        else if (confirm !== newPw)   e.confirm = "Passwords do not match.";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (!validate()) { shake(); return; }
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem("authToken");
            const res = await fetch(`${BACKEND_URL}/api/auth/change-password`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", "auth-token": token },
                body: JSON.stringify({ currentPassword: current, newPassword: newPw }),
            });
            const json = await res.json();

            if (json.success) {
                showAlert2({
                    type: "success",
                    title: "Password changed!",
                    message: "Your password has been updated successfully.",
                    onConfirm: () => navigation.goBack(),
                });
                setCurrent(""); setNewPw(""); setConfirm("");
            } else {
                // Map server error back to the right field
                if (json.error?.toLowerCase().includes("current")) {
                    setErrors({ current: json.error });
                } else {
                    setErrors({ newPw: json.error });
                }
                shake();
            }
        } catch {
            showAlert2({ type: "error", title: "Error", message: "Could not connect to server." });
        } finally {
            setLoading(false);
        }
    };

    // ── Checklist (shows while typing new password) ───────────────────────────
    const checks = [
        { label: "At least 6 characters",      pass: newPw.length >= 6 },
        { label: "Contains a number",           pass: /[0-9]/.test(newPw) },
        { label: "Contains an uppercase letter",pass: /[A-Z]/.test(newPw) },
        { label: "Matches confirmation",        pass: confirm.length > 0 && confirm === newPw },
    ];

    return (
        <ImageBackground
            source={require("../images/message_bg.png")}
            style={styles.bg}
            resizeMode="cover"
        >
            <View style={styles.bgTint} />

            <SafeAreaView style={styles.safe}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Icon name="arrow-left" size={16} color={T.INK} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Change Password</Text>
                    <View style={{ width: 36 }} />
                </View>

                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    style={{ flex: 1 }}
                >
                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        {/* Hero */}
                        <View style={styles.hero}>
                            <View style={styles.heroIconWrap}>
                                <Text style={{ fontSize: 36 }}>🔑</Text>
                            </View>
                            <Text style={styles.heroTitle}>Update your password</Text>
                            <Text style={styles.heroSub}>
                                Choose a strong password you haven't used before
                            </Text>
                        </View>

                        {/* Section label */}
                        <View style={styles.sectionTitleRow}>
                            <View style={styles.sectionTitleBar} />
                            <Text style={styles.sectionTitle}>Password details</Text>
                        </View>

                        {/* Form card */}
                        <Animated.View
                            style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}
                        >
                            <PasswordField
                                label="Current password"
                                placeholder="Enter your current password"
                                value={current}
                                onChangeText={v => { setCurrent(v); setErrors(e => ({ ...e, current: null })); }}
                                error={errors.current}
                            />

                            <View style={styles.cardDivider} />

                            <PasswordField
                                label="New password"
                                placeholder="At least 6 characters"
                                value={newPw}
                                onChangeText={v => { setNewPw(v); setErrors(e => ({ ...e, newPw: null })); }}
                                error={errors.newPw}
                                showStrength
                            />

                            <View style={styles.cardDivider} />

                            <PasswordField
                                label="Confirm new password"
                                placeholder="Re-enter new password"
                                value={confirm}
                                onChangeText={v => { setConfirm(v); setErrors(e => ({ ...e, confirm: null })); }}
                                error={errors.confirm}
                            />
                        </Animated.View>

                        {/* Checklist — visible once user starts typing new pw */}
                        {newPw.length > 0 && (
                            <View style={styles.checklistCard}>
                                <View style={styles.sectionTitleRow}>
                                    <View style={styles.sectionTitleBar} />
                                    <Text style={styles.sectionTitle}>Requirements</Text>
                                </View>
                                {checks.map((c, i) => (
                                    <View key={i} style={styles.checkRow}>
                                        <Icon
                                            name={c.pass ? "check-circle" : "circle"}
                                            size={14}
                                            color={c.pass ? "#4ADE80" : T.INK_LIGHT}
                                        />
                                        <Text style={[styles.checkLabel, c.pass && { color: "#4ADE80" }]}>
                                            {c.label}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Submit button */}
                        <TouchableOpacity
                            style={[styles.submitBtn, loading && { opacity: 0.6 }]}
                            onPress={handleSubmit}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading
                                ? <ActivityIndicator color="#fff" />
                                : (
                                    <View style={styles.submitInner}>
                                        <Icon name="lock" size={15} color="#fff" />
                                        <Text style={styles.submitText}>Update Password</Text>
                                    </View>
                                )
                            }
                        </TouchableOpacity>

                        {/* Forgot link */}
                        <TouchableOpacity
                            style={styles.forgotBtn}
                            onPress={() => navigation.navigate("ForgotPassword")}
                        >
                            <Text style={styles.forgotText}>
                                Forgot current password?{" "}
                                <Text style={{ color: T.GOLD, fontWeight: "700" }}>Reset it</Text>
                            </Text>
                        </TouchableOpacity>

                        <View style={{ height: 48 }} />
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </ImageBackground>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    bg: { flex: 1 },
    bgTint: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(5,18,2,0.84)",
    },
    safe: { flex: 1 },

    // Header
    header: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: 16, paddingVertical: 14,
    },
    backBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: "rgba(255,255,255,0.10)",
        justifyContent: "center", alignItems: "center",
        borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
    },
    headerTitle: {
        fontSize: 20, fontWeight: "800", color: T.INK, letterSpacing: 0.3,
    },

    scrollContent: { paddingHorizontal: 16, paddingBottom: 24 },

    // Hero
    hero: { alignItems: "center", paddingVertical: 24, gap: 8 },
    heroIconWrap: {
        width: 76, height: 76, borderRadius: 38,
        backgroundColor: T.GLASS,
        borderWidth: 1, borderColor: T.GLASS_BORDER,
        justifyContent: "center", alignItems: "center",
        marginBottom: 4,
        shadowColor: T.GOLD, shadowOpacity: 0.2, shadowRadius: 12, elevation: 6,
    },
    heroTitle: { color: T.INK, fontSize: 22, fontWeight: "800", letterSpacing: 0.2 },
    heroSub:   { color: T.INK_LIGHT, fontSize: 13, textAlign: "center", maxWidth: "80%" },

    // Section label
    sectionTitleRow: {
        flexDirection: "row", alignItems: "center", gap: 8,
        marginBottom: 10, marginTop: 4, marginLeft: 2,
    },
    sectionTitleBar: {
        width: 4, height: 14, borderRadius: 2, backgroundColor: T.GOLD,
    },
    sectionTitle: {
        color: T.LABEL, fontSize: 12, fontWeight: "800",
        letterSpacing: 1.1, textTransform: "uppercase",
    },

    // Glass card
    card: {
        backgroundColor: T.GLASS,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: T.GLASS_BORDER,
        marginBottom: 14,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.4,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 12,
        elevation: 6,
        paddingVertical: 6,
    },
    cardDivider: { height: 1, backgroundColor: T.DIV, marginHorizontal: 16 },

    // Checklist card
    checklistCard: {
        backgroundColor: T.GLASS,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: T.GLASS_BORDER,
        padding: 16,
        marginBottom: 20,
        gap: 4,
    },
    checkRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 4 },
    checkLabel: { color: T.INK_LIGHT, fontSize: 13 },

    // Field
    fieldWrap: { paddingHorizontal: 16, paddingVertical: 14 },
    fieldLabel: { color: T.INK_MED, fontSize: 12, fontWeight: "700", marginBottom: 8, letterSpacing: 0.5, textTransform: "uppercase" },
    inputRow: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.07)",
        borderWidth: 1.5, borderColor: "rgba(255,255,255,0.12)",
        borderRadius: 14, paddingHorizontal: 14,
    },
    inputRowError: { borderColor: T.DANGER },
    input: {
        flex: 1, height: 48, fontSize: 15, color: T.INK,
        paddingVertical: 0,
    },
    eyeBtn: { padding: 8 },

    // Strength bar
    strengthRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 },
    strengthTrack: { flexDirection: "row", gap: 4, flex: 1 },
    strengthSeg: { flex: 1, height: 4, borderRadius: 2 },
    strengthLabel: { fontSize: 11, fontWeight: "700", width: 44, textAlign: "right" },

    // Field error
    fieldError: { color: T.DANGER, fontSize: 12, marginTop: 6 },

    // Submit
    submitBtn: {
        backgroundColor: T.GOLD,
        borderRadius: 16, paddingVertical: 16,
        alignItems: "center", justifyContent: "center",
        shadowColor: T.GOLD, shadowOpacity: 0.4, shadowRadius: 10, elevation: 5,
        marginBottom: 14,
    },
    submitInner: { flexDirection: "row", alignItems: "center", gap: 10 },
    submitText: { color: "#fff", fontSize: 16, fontWeight: "800" },

    // Forgot
    forgotBtn: { alignItems: "center", paddingVertical: 4 },
    forgotText: { color: T.INK_LIGHT, fontSize: 13 },
});