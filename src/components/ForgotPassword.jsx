/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, { useState, useRef, useEffect } from "react";
import {
    View, Text, StyleSheet, TouchableOpacity,
    TextInput, ImageBackground, Animated,
    ActivityIndicator, KeyboardAvoidingView,
    Platform, ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { BACKEND_URL } from "../config/backend";
import { showAlert2 } from "./CustomAlert2";

// ─── Same tokens as Profile / ChangePassword ─────────────────────────────────
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
};

// ─── Step config ──────────────────────────────────────────────────────────────
const STEP_CONFIG = [
    { key: "email",    icon: "📧", title: "Forgot password?",      sub: "Enter your account email and we'll send you a 6-digit OTP." },
    { key: "otp",      icon: "🔢", title: "Check your email",      sub: "We sent a 6-digit code. Enter it below." },
    { key: "password", icon: "🔑", title: "Set new password",      sub: "Choose a strong password you haven't used before." },
];

// ─── OTP single-digit box ─────────────────────────────────────────────────────
function OtpInput({ value, onChange, onBackspace, inputRef, isFocused }) {
    return (
        <TextInput
            ref={inputRef}
            style={[styles.otpBox, isFocused && styles.otpBoxFocused, value && styles.otpBoxFilled]}
            value={value}
            onChangeText={v => { if (/^\d?$/.test(v)) onChange(v); }}
            onKeyPress={({ nativeEvent }) => { if (nativeEvent.key === "Backspace" && !value) onBackspace(); }}
            keyboardType="number-pad"
            maxLength={1}
            textAlign="center"
            selectionColor={T.GOLD}
            caretHidden
        />
    );
}

// ─── Password visibility field ────────────────────────────────────────────────
function PasswordField({ label, placeholder, value, onChangeText, error }) {
    const [visible, setVisible] = useState(false);
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
            {error ? <Text style={styles.fieldError}>{error}</Text> : null}
        </View>
    );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function ForgotPassword() {
    const navigation = useNavigation();

    const [step, setStep]       = useState(0); // 0=email, 1=otp, 2=newpw
    const [email, setEmail]     = useState("");
    const [otp, setOtp]         = useState(["", "", "", "", "", ""]);
    const [newPw, setNewPw]     = useState("");
    const [confirmPw, setConfirmPw] = useState("");
    const [errors, setErrors]   = useState({});
    const [loading, setLoading] = useState(false);

    // Resend OTP countdown
    const [countdown, setCountdown] = useState(0);
    useEffect(() => {
        if (countdown <= 0) return;
        const t = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown]);

    // OTP input refs
    const otpRefs = useRef([...Array(6)].map(() => React.createRef()));
    const [focusedOtp, setFocusedOtp] = useState(0);

    // Shake animation
    const shakeAnim = useRef(new Animated.Value(0)).current;
    const shake = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: 8,  duration: 55, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -8, duration: 55, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 5,  duration: 45, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -5, duration: 45, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0,  duration: 35, useNativeDriver: true }),
        ]).start();
    };

    // Step progress animation
    const progressAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        Animated.timing(progressAnim, {
            toValue: (step + 1) / 3,
            duration: 350,
            useNativeDriver: false,
        }).start();
    }, [step]);

    // ── Step 0: Send OTP ──────────────────────────────────────────────────────
    const handleSendOtp = async () => {
        if (!email.trim()) { setErrors({ email: "Please enter your email." }); shake(); return; }
        if (!/\S+@\S+\.\S+/.test(email)) { setErrors({ email: "Enter a valid email address." }); shake(); return; }
        setErrors({});
        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim().toLowerCase() }),
            });
            const json = await res.json();
            if (json.success) {
                setStep(1);
                setCountdown(60);
                setTimeout(() => otpRefs.current[0]?.current?.focus(), 300);
            } else {
                setErrors({ email: json.error || "No account found with this email." });
                shake();
            }
        } catch {
            showAlert2({ type: "error", title: "Error", message: "Could not connect to server." });
        } finally {
            setLoading(false);
        }
    };

    // ── Step 1: Verify OTP ────────────────────────────────────────────────────
    const handleVerifyOtp = async () => {
        const otpStr = otp.join("");
        if (otpStr.length < 6) { setErrors({ otp: "Please enter all 6 digits." }); shake(); return; }
        setErrors({});
        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim().toLowerCase(), otp: otpStr }),
            });
            const json = await res.json();
            if (json.success) {
                setStep(2);
            } else {
                setErrors({ otp: json.error || "Invalid or expired OTP." });
                setOtp(["", "", "", "", "", ""]);
                otpRefs.current[0]?.current?.focus();
                shake();
            }
        } catch {
            showAlert2({ type: "error", title: "Error", message: "Could not connect to server." });
        } finally {
            setLoading(false);
        }
    };

    // ── Step 2: Reset password ────────────────────────────────────────────────
    const handleResetPassword = async () => {
        const e = {};
        if (!newPw.trim())          e.newPw    = "Please enter a new password.";
        else if (newPw.length < 6)  e.newPw    = "Must be at least 6 characters.";
        if (!confirmPw.trim())      e.confirmPw = "Please confirm your password.";
        else if (confirmPw !== newPw) e.confirmPw = "Passwords do not match.";
        if (Object.keys(e).length) { setErrors(e); shake(); return; }
        setErrors({});
        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/reset-password`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim().toLowerCase(), newPassword: newPw }),
            });
            const json = await res.json();
            if (json.success) {
                showAlert2({
                    type: "success",
                    title: "Password reset!",
                    message: "Your password has been updated. You can now log in.",
                    onConfirm: () => navigation.navigate("Home"),
                });
            } else {
                showAlert2({ type: "error", title: "Error", message: json.error || "Something went wrong." });
            }
        } catch {
            showAlert2({ type: "error", title: "Error", message: "Could not connect to server." });
        } finally {
            setLoading(false);
        }
    };

    // ── Resend OTP ────────────────────────────────────────────────────────────
    const handleResend = async () => {
        if (countdown > 0) return;
        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim().toLowerCase() }),
            });
            const json = await res.json();
            if (json.success) {
                setOtp(["", "", "", "", "", ""]);
                setErrors({});
                setCountdown(60);
                setTimeout(() => otpRefs.current[0]?.current?.focus(), 100);
            }
        } catch {
            showAlert2({ type: "error", title: "Error", message: "Could not connect to server." });
        } finally {
            setLoading(false);
        }
    };

    // ── OTP box handlers ──────────────────────────────────────────────────────
    const handleOtpChange = (index, val) => {
        const next = [...otp];
        next[index] = val;
        setOtp(next);
        if (val && index < 5) {
            otpRefs.current[index + 1]?.current?.focus();
            setFocusedOtp(index + 1);
        }
    };
    const handleOtpBackspace = (index) => {
        if (index > 0) {
            otpRefs.current[index - 1]?.current?.focus();
            setFocusedOtp(index - 1);
        }
    };

    const cfg = STEP_CONFIG[step];

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
                    <TouchableOpacity
                        onPress={() => step > 0 ? setStep(s => s - 1) : navigation.goBack()}
                        style={styles.backBtn}
                    >
                        <Icon name="arrow-left" size={16} color={T.INK} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Reset Password</Text>
                    <View style={{ width: 36 }} />
                </View>

                {/* Progress bar */}
                <View style={styles.progressTrack}>
                    <Animated.View
                        style={[styles.progressFill, {
                            width: progressAnim.interpolate({
                                inputRange: [0, 1], outputRange: ["0%", "100%"],
                            }),
                        }]}
                    />
                </View>
                <View style={styles.stepPills}>
                    {["Email", "Verify", "Password"].map((label, i) => (
                        <View key={i} style={styles.stepPill}>
                            <View style={[styles.stepDot, i <= step && styles.stepDotActive]}>
                                {i < step
                                    ? <Icon name="check" size={8} color="#fff" />
                                    : <Text style={[styles.stepDotText, i === step && { color: "#fff" }]}>{i + 1}</Text>
                                }
                            </View>
                            <Text style={[styles.stepLabel, i <= step && { color: T.GOLD }]}>{label}</Text>
                        </View>
                    ))}
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
                                <Text style={{ fontSize: 36 }}>{cfg.icon}</Text>
                            </View>
                            <Text style={styles.heroTitle}>{cfg.title}</Text>
                            <Text style={styles.heroSub}>{cfg.sub}</Text>
                            {step === 1 && (
                                <View style={styles.emailBadge}>
                                    <Icon name="envelope" size={11} color={T.GOLD} />
                                    <Text style={styles.emailBadgeText}>{email}</Text>
                                </View>
                            )}
                        </View>

                        {/* Section label */}
                        <View style={styles.sectionTitleRow}>
                            <View style={styles.sectionTitleBar} />
                            <Text style={styles.sectionTitle}>
                                {step === 0 ? "Your email" : step === 1 ? "Enter code" : "New password"}
                            </Text>
                        </View>

                        {/* ── STEP 0: Email ── */}
                        {step === 0 && (
                            <Animated.View style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}>
                                <View style={styles.fieldWrap}>
                                    <Text style={styles.fieldLabel}>Email address</Text>
                                    <View style={[styles.inputRow, errors.email && styles.inputRowError]}>
                                        <Icon name="envelope" size={14} color={T.INK_LIGHT} style={{ marginRight: 10 }} />
                                        <TextInput
                                            style={[styles.input]}
                                            placeholder="you@example.com"
                                            placeholderTextColor={T.INK_LIGHT}
                                            value={email}
                                            onChangeText={v => { setEmail(v); setErrors({}); }}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                        />
                                    </View>
                                    {errors.email ? <Text style={styles.fieldError}>{errors.email}</Text> : null}
                                </View>
                            </Animated.View>
                        )}

                        {/* ── STEP 1: OTP ── */}
                        {step === 1 && (
                            <Animated.View style={{ transform: [{ translateX: shakeAnim }] }}>
                                <View style={styles.card}>
                                    <View style={styles.otpWrapper}>
                                        {otp.map((digit, i) => (
                                            <OtpInput
                                                key={i}
                                                inputRef={otpRefs.current[i]}
                                                value={digit}
                                                onChange={v => handleOtpChange(i, v)}
                                                onBackspace={() => handleOtpBackspace(i)}
                                                isFocused={focusedOtp === i}
                                            />
                                        ))}
                                    </View>
                                    {errors.otp ? (
                                        <Text style={[styles.fieldError, { textAlign: "center", marginBottom: 12 }]}>
                                            {errors.otp}
                                        </Text>
                                    ) : null}
                                </View>

                                {/* Resend */}
                                <TouchableOpacity
                                    onPress={handleResend}
                                    disabled={countdown > 0}
                                    style={styles.resendBtn}
                                >
                                    {countdown > 0 ? (
                                        <Text style={styles.resendText}>
                                            Resend code in{" "}
                                            <Text style={{ color: T.GOLD, fontWeight: "700" }}>{countdown}s</Text>
                                        </Text>
                                    ) : (
                                        <Text style={styles.resendText}>
                                            Didn't get it?{" "}
                                            <Text style={{ color: T.GOLD, fontWeight: "700" }}>Resend OTP</Text>
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </Animated.View>
                        )}

                        {/* ── STEP 2: New password ── */}
                        {step === 2 && (
                            <Animated.View style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}>
                                <PasswordField
                                    label="New password"
                                    placeholder="At least 6 characters"
                                    value={newPw}
                                    onChangeText={v => { setNewPw(v); setErrors(e => ({ ...e, newPw: null })); }}
                                    error={errors.newPw}
                                />
                                <View style={styles.cardDivider} />
                                <PasswordField
                                    label="Confirm new password"
                                    placeholder="Re-enter new password"
                                    value={confirmPw}
                                    onChangeText={v => { setConfirmPw(v); setErrors(e => ({ ...e, confirmPw: null })); }}
                                    error={errors.confirmPw}
                                />
                            </Animated.View>
                        )}

                        {/* CTA button */}
                        <TouchableOpacity
                            style={[styles.submitBtn, loading && { opacity: 0.6 }]}
                            onPress={step === 0 ? handleSendOtp : step === 1 ? handleVerifyOtp : handleResetPassword}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <View style={styles.submitInner}>
                                    <Icon
                                        name={step === 0 ? "paper-plane" : step === 1 ? "check" : "lock"}
                                        size={15} color="#fff"
                                    />
                                    <Text style={styles.submitText}>
                                        {step === 0 ? "Send OTP" : step === 1 ? "Verify Code" : "Reset Password"}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>

                        {/* Back to login */}
                        <TouchableOpacity style={styles.loginBtn} onPress={() => navigation.navigate("Home")}>
                            <Text style={styles.loginText}>
                                Remember your password?{" "}
                                <Text style={{ color: T.GOLD, fontWeight: "700" }}>Log in</Text>
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
    bgTint: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(5,18,2,0.84)" },
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
    headerTitle: { fontSize: 20, fontWeight: "800", color: T.INK, letterSpacing: 0.3 },

    // Progress
    progressTrack: {
        height: 3, backgroundColor: "rgba(255,255,255,0.08)",
        marginHorizontal: 16, borderRadius: 2, marginBottom: 14,
    },
    progressFill: {
        height: 3, backgroundColor: T.GOLD, borderRadius: 2,
    },
    stepPills: {
        flexDirection: "row", justifyContent: "space-between",
        paddingHorizontal: 24, marginBottom: 6,
    },
    stepPill: { alignItems: "center", gap: 4 },
    stepDot: {
        width: 22, height: 22, borderRadius: 11,
        backgroundColor: "rgba(255,255,255,0.08)",
        borderWidth: 1, borderColor: T.GLASS_BORDER,
        justifyContent: "center", alignItems: "center",
    },
    stepDotActive: { backgroundColor: T.GOLD, borderColor: T.GOLD },
    stepDotText: { color: T.INK_LIGHT, fontSize: 11, fontWeight: "700" },
    stepLabel: { color: T.INK_LIGHT, fontSize: 11, fontWeight: "600" },

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
    heroSub: { color: T.INK_LIGHT, fontSize: 13, textAlign: "center", maxWidth: "80%", lineHeight: 20 },
    emailBadge: {
        flexDirection: "row", alignItems: "center", gap: 6,
        backgroundColor: T.GOLD_BG, borderRadius: 20,
        paddingHorizontal: 12, paddingVertical: 5,
        borderWidth: 1, borderColor: T.GOLD,
        marginTop: 4,
    },
    emailBadgeText: { color: T.GOLD, fontSize: 12, fontWeight: "600" },

    // Section label
    sectionTitleRow: {
        flexDirection: "row", alignItems: "center", gap: 8,
        marginBottom: 10, marginTop: 4, marginLeft: 2,
    },
    sectionTitleBar: { width: 4, height: 14, borderRadius: 2, backgroundColor: T.GOLD },
    sectionTitle: {
        color: T.LABEL, fontSize: 12, fontWeight: "800",
        letterSpacing: 1.1, textTransform: "uppercase",
    },

    // Glass card
    card: {
        backgroundColor: T.GLASS,
        borderRadius: 20, borderWidth: 1, borderColor: T.GLASS_BORDER,
        marginBottom: 14, overflow: "hidden",
        shadowColor: "#000", shadowOpacity: 0.4,
        shadowOffset: { width: 0, height: 4 }, shadowRadius: 12, elevation: 6,
        paddingVertical: 6,
    },
    cardDivider: { height: 1, backgroundColor: T.DIV, marginHorizontal: 16 },

    // OTP
    otpWrapper: {
        flexDirection: "row", justifyContent: "center",
        gap: 10, paddingVertical: 20, paddingHorizontal: 16,
    },
    otpBox: {
        width: 44, height: 54, borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.07)",
        borderWidth: 1.5, borderColor: "rgba(255,255,255,0.12)",
        color: T.INK, fontSize: 22, fontWeight: "800",
    },
    otpBoxFocused: { borderColor: T.GOLD, backgroundColor: T.GOLD_BG },
    otpBoxFilled: { borderColor: T.LABEL },

    // Field
    fieldWrap: { paddingHorizontal: 16, paddingVertical: 14 },
    fieldLabel: {
        color: T.INK_MED, fontSize: 12, fontWeight: "700",
        marginBottom: 8, letterSpacing: 0.5, textTransform: "uppercase",
    },
    inputRow: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.07)",
        borderWidth: 1.5, borderColor: "rgba(255,255,255,0.12)",
        borderRadius: 14, paddingHorizontal: 14,
    },
    inputRowError: { borderColor: T.DANGER },
    input: { flex: 1, height: 48, fontSize: 15, color: T.INK, paddingVertical: 0 },
    eyeBtn: { padding: 8 },
    fieldError: { color: T.DANGER, fontSize: 12, marginTop: 6 },

    // Resend
    resendBtn: { alignItems: "center", paddingVertical: 8, marginBottom: 8 },
    resendText: { color: T.INK_LIGHT, fontSize: 13 },

    // Submit
    submitBtn: {
        backgroundColor: T.GOLD, borderRadius: 16, paddingVertical: 16,
        alignItems: "center", justifyContent: "center",
        shadowColor: T.GOLD, shadowOpacity: 0.4, shadowRadius: 10, elevation: 5,
        marginBottom: 14,
    },
    submitInner: { flexDirection: "row", alignItems: "center", gap: 10 },
    submitText: { color: "#fff", fontSize: 16, fontWeight: "800" },

    // Login link
    loginBtn: { alignItems: "center", paddingVertical: 4 },
    loginText: { color: T.INK_LIGHT, fontSize: 13 },
});