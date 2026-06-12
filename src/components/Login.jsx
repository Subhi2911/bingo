/* eslint-disable react-native/no-inline-styles */
import {
    StyleSheet, Text, TextInput, TouchableOpacity,
    View, Modal, Pressable, Animated, KeyboardAvoidingView,
    Platform, ScrollView
} from 'react-native';
import React, { useState, useRef } from 'react';
import { BACKEND_URL } from "../config/backend";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useAlertToast } from './AlertToast';

const MODAL_STEPS = ['Email', 'Verify', 'Reset'];

const ModalStepIndicator = ({ step }) => (
    <View style={styles.stepRow}>
        {MODAL_STEPS.map((label, i) => {
            const idx = i + 1;
            const done = step > idx;
            const active = step === idx;
            return (
                <React.Fragment key={label}>
                    <View style={styles.stepItem}>
                        <View style={[
                            styles.stepCircle,
                            active && styles.stepCircleActive,
                            done && styles.stepCircleDone,
                        ]}>
                            {done
                                ? <Text style={styles.stepCheck}>✓</Text>
                                : <Text style={[styles.stepNum, active && styles.stepNumActive]}>{idx}</Text>
                            }
                        </View>
                        <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>{label}</Text>
                    </View>
                    {i < MODAL_STEPS.length - 1 && (
                        <View style={[styles.stepLine, step > idx && styles.stepLineDone]} />
                    )}
                </React.Fragment>
            );
        })}
    </View>
);

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [otpEmail, setOtpEmail] = useState('');
    const [password, setPassword] = useState('');
    const [cpassword, setCpassword] = useState('');
    const [otp, setOtp] = useState('');
    const [loginModal, setLoginModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [showPassword, setShowPassword] = useState(false);
    const fadeAnim = useRef(new Animated.Value(1)).current;
    const navigation = useNavigation();
    const { showToast } = useAlertToast();

    const onChange = (name, value) => setCredentials(prev => ({ ...prev, [name]: value }));

    const animateStep = (fn) => {
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
            fn();
            Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
        });
    };

    const closeModal = () => {
        setLoginModal(false);
        setStep(1);
        setOtpEmail('');
        setOtp('');
        setPassword('');
        setCpassword('');
    };

    const handleLogin = async () => {
        if (!credentials.email || !credentials.password) {
           showToast('error', 'Error', 'All fields are required.');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: credentials.email, password: credentials.password })
            });
            const data = await res.json();
            if (res.ok) {
                await AsyncStorage.setItem("authToken", data.authToken);
                navigation.navigate("Dashboard");
                showToast('success', 'Welcome back', 'Lets play!');
            } else {
                showToast('error', 'Login failed', data.error|| 'Invalid email or password. Please try again.');
            }
        } catch (err) {
            console.log(err);
        } finally { setLoading(false); }
    };

    const handleSendEmail = async () => {
        if (!otpEmail) { showToast('error', 'Error', 'Email required.'); return; }
        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: otpEmail })
            });
            const data = await res.json();
            if (res.ok) { 
                showToast('info', 'OTP sent', 'Check your email for the 6-digit code.');
                animateStep(() => setStep(2)); 
            }
            else { showToast('error', 'Failed', data.error|| 'Something went wrong');}
        } finally { setLoading(false); }
    };

    const handleVerifyOtp = async () => {
        if (!otp) { showToast('error', 'Failed', 'OTP required.'); return; }
        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: otpEmail, otp })
            });
            const data = await res.json();
            if (res.ok) { animateStep(() => setStep(3)); }
            else { showToast('error', 'Invalid OTP', data.error|| 'Please try again.');}
        } finally { setLoading(false); }
    };

    const handleResetPassword = async () => {
        if (!password) {showToast('error', 'Error', 'Password Required.'); return; }
        if (password !== cpassword) { showToast('error', 'Error', 'Passwords do not match.'); return; }
        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/reset-password`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: otpEmail, newPassword: password })
            });
            const data = await res.json();
            if (res.ok) {
                showToast('success', 'Password changed successfully.', 'Continue Loging in!');
                closeModal();
            } else {
                showToast('error', 'Error', data.error|| 'Something went Wrong.');
            }
        } catch (err) {
            console.log(err);
        } finally { setLoading(false); }
    };

    const passwordsMatch = password === cpassword || !cpassword;

    return (
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <View style={styles.container}>
                {/* Email */}
                <View style={styles.field}>
                    <Text style={styles.label}>EMAIL ADDRESS</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="you@example.com"
                        placeholderTextColor="rgba(255,255,255,0.25)"
                        value={credentials.email}
                        onChangeText={(v) => onChange("email", v)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                {/* Password */}
                <View style={styles.field}>
                    <Text style={styles.label}>PASSWORD</Text>
                    <View style={styles.passwordRow}>
                        <TextInput
                            style={[styles.input, { flex: 1 }]}
                            placeholder="Enter your password"
                            placeholderTextColor="rgba(255,255,255,0.25)"
                            secureTextEntry={!showPassword}
                            value={credentials.password}
                            onChangeText={(v) => onChange("password", v)}
                        />
                        <TouchableOpacity
                            style={styles.eyeBtn}
                            onPress={() => setShowPassword(p => !p)}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Forgot */}
                <TouchableOpacity
                    onPress={() => setLoginModal(true)}
                    style={styles.forgotRow}
                    hitSlop={{ top: 8, bottom: 8 }}
                >
                    <Text style={styles.forgotText}>Forgot password?</Text>
                </TouchableOpacity>

                {/* Login button */}
                <TouchableOpacity
                    style={[styles.btn, loading && styles.btnDisabled]}
                    onPress={handleLogin}
                    disabled={loading}
                    activeOpacity={0.8}
                >
                    <Text style={styles.btnText}>{loading ? "Logging in…" : "Log in →"}</Text>
                </TouchableOpacity>

                {/* ── Forgot Password Modal ── */}
                <Modal
                    transparent
                    animationType="slide"
                    visible={loginModal}
                    onRequestClose={closeModal}
                >
                    <KeyboardAvoidingView
                        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                        style={{ flex: 1 }}
                    >
                        <Pressable style={styles.modalOverlay} onPress={closeModal}>
                            <Pressable style={styles.modalCard} onPress={() => {}}>

                                {/* Drag handle */}
                                <View style={styles.modalHandle} />

                                {/* Header */}
                                <View style={styles.modalHeader}>
                                    <View>
                                        <Text style={styles.modalTitle}>Reset password</Text>
                                        <Text style={styles.modalSubtitle}>We'll get you back in</Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={closeModal}
                                        style={styles.closeBtn}
                                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                    >
                                        <Text style={styles.modalClose}>✕</Text>
                                    </TouchableOpacity>
                                </View>

                                <ModalStepIndicator step={step} />

                                <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>

                                    {/* Step 1 */}
                                    {step === 1 && (
                                        <>
                                            <Text style={styles.modalHint}>
                                                Enter your email and we'll send a 6-digit code.
                                            </Text>
                                            <TextInput
                                                style={styles.modalInput}
                                                placeholder="you@example.com"
                                                placeholderTextColor="#bbb"
                                                value={otpEmail}
                                                onChangeText={setOtpEmail}
                                                keyboardType="email-address"
                                                autoCapitalize="none"
                                            />
                                            <TouchableOpacity
                                                style={[styles.modalBtn, loading && styles.modalBtnDisabled]}
                                                onPress={handleSendEmail}
                                                disabled={loading}
                                                activeOpacity={0.8}
                                            >
                                                <Text style={styles.modalBtnText}>{loading ? "Sending…" : "Send code →"}</Text>
                                            </TouchableOpacity>
                                        </>
                                    )}

                                    {/* Step 2 */}
                                    {step === 2 && (
                                        <>
                                            <View style={styles.modalEmailBadge}>
                                                <Text style={styles.modalEmailBadgeLabel}>Code sent to</Text>
                                                <Text style={styles.modalEmailBadgeText}>{otpEmail}</Text>
                                            </View>
                                            <TextInput
                                                style={[styles.modalInput, styles.modalOtpInput]}
                                                placeholder="000000"
                                                placeholderTextColor="#ccc"
                                                keyboardType="number-pad"
                                                maxLength={6}
                                                value={otp}
                                                onChangeText={setOtp}
                                            />
                                            <TouchableOpacity
                                                style={[styles.modalBtn, loading && styles.modalBtnDisabled]}
                                                onPress={handleVerifyOtp}
                                                disabled={loading}
                                                activeOpacity={0.8}
                                            >
                                                <Text style={styles.modalBtnText}>{loading ? "Verifying…" : "Verify code →"}</Text>
                                            </TouchableOpacity>
                                        </>
                                    )}

                                    {/* Step 3 */}
                                    {step === 3 && (
                                        <>
                                            <TextInput
                                                style={styles.modalInput}
                                                placeholder="New password (min. 6 chars)"
                                                placeholderTextColor="#bbb"
                                                secureTextEntry
                                                value={password}
                                                onChangeText={setPassword}
                                            />
                                            <TextInput
                                                style={[styles.modalInput, !passwordsMatch && styles.modalInputError]}
                                                placeholder="Confirm new password"
                                                placeholderTextColor="#bbb"
                                                secureTextEntry
                                                value={cpassword}
                                                onChangeText={setCpassword}
                                            />
                                            {!passwordsMatch && (
                                                <Text style={styles.modalErrorText}>Passwords don't match</Text>
                                            )}
                                            <TouchableOpacity
                                                style={[styles.modalBtn, (loading || !passwordsMatch) && styles.modalBtnDisabled]}
                                                onPress={handleResetPassword}
                                                disabled={loading || !passwordsMatch}
                                                activeOpacity={0.8}
                                            >
                                                <Text style={styles.modalBtnText}>{loading ? "Saving…" : "Save new password →"}</Text>
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </Animated.View>

                                <TouchableOpacity onPress={closeModal} style={styles.cancelBtn}>
                                    <Text style={styles.cancelText}>Cancel</Text>
                                </TouchableOpacity>
                            </Pressable>
                        </Pressable>
                    </KeyboardAvoidingView>
                </Modal>
            </View>
        </ScrollView>
    );
};

export default Login;

const styles = StyleSheet.create({
    container: {
        width: '100%',
        paddingTop: 4,
    },
    field: {
        marginBottom: 14,
    },
    label: {
        fontSize: 11,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.4)',
        marginBottom: 7,
        letterSpacing: 0.8,
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: 'rgba(255,255,255,0.09)',
        borderRadius: 12,
        paddingHorizontal: 16,
        color: '#fff',
        fontSize: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
    },
    passwordRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    eyeBtn: {
        width: 50,
        height: 50,
        backgroundColor: 'rgba(255,255,255,0.09)',
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
    },
    eyeText: {
        fontSize: 16,
    },
    forgotRow: {
        alignItems: 'flex-end',
        marginBottom: 20,
        marginTop: -2,
    },
    forgotText: {
        color: '#F8B55F',
        fontSize: 13,
        fontWeight: '600',
    },
    btn: {
        width: '100%',
        height: 52,
        backgroundColor: '#F8B55F',
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#F8B55F',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
        elevation: 7,
    },
    btnDisabled: {
        backgroundColor: 'rgba(248,181,95,0.35)',
        shadowOpacity: 0,
        elevation: 0,
    },
    btnText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: 0.3,
    },

    /* Modal */
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.55)',
        justifyContent: 'flex-end',
    },
    modalCard: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        padding: 24,
        paddingBottom: 36,
        alignItems: 'center',
    },
    modalHandle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#e0e0e0',
        marginBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 24,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1a1a2e',
        marginBottom: 2,
    },
    modalSubtitle: {
        fontSize: 13,
        color: '#999',
    },
    closeBtn: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#f5f5f5',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalClose: {
        fontSize: 13,
        color: '#888',
        fontWeight: '600',
    },
    modalHint: {
        fontSize: 13,
        color: '#888',
        marginBottom: 16,
        lineHeight: 20,
    },
    modalEmailBadge: {
        backgroundColor: '#FFF8EE',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 14,
        marginBottom: 16,
        width: '100%',
        borderWidth: 1,
        borderColor: 'rgba(248,181,95,0.25)',
    },
    modalEmailBadgeLabel: {
        fontSize: 11,
        color: '#bbb',
        marginBottom: 2,
        letterSpacing: 0.3,
    },
    modalEmailBadgeText: {
        fontSize: 14,
        color: '#C07A1A',
        fontWeight: '600',
    },
    modalInput: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#ebebeb',
        borderRadius: 12,
        paddingHorizontal: 16,
        marginBottom: 12,
        color: '#1a1a2e',
        fontSize: 15,
        backgroundColor: '#fafafa',
    },
    modalOtpInput: {
        letterSpacing: 10,
        fontSize: 26,
        fontWeight: '700',
        textAlign: 'center',
    },
    modalInputError: {
        borderColor: '#ffaaaa',
        backgroundColor: '#fff8f8',
    },
    modalErrorText: {
        fontSize: 12,
        color: '#ff5555',
        alignSelf: 'flex-start',
        marginTop: -6,
        marginBottom: 10,
        marginLeft: 2,
    },
    modalBtn: {
        backgroundColor: '#F8B55F',
        width: '100%',
        height: 50,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 4,
        shadowColor: '#F8B55F',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 5,
    },
    modalBtnDisabled: {
        backgroundColor: 'rgba(248,181,95,0.4)',
        shadowOpacity: 0,
        elevation: 0,
    },
    modalBtnText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
        letterSpacing: 0.2,
    },
    cancelBtn: {
        marginTop: 18,
    },
    cancelText: {
        color: '#bbb',
        fontSize: 14,
    },

    /* Step indicator (modal) */
    stepRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        width: '100%',
    },
    stepItem: {
        alignItems: 'center',
        gap: 5,
    },
    stepCircle: {
        width: 30,
        height: 30,
        borderRadius: 15,
        borderWidth: 1.5,
        borderColor: '#e0e0e0',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f8f8',
    },
    stepCircleActive: {
        borderColor: '#F8B55F',
        backgroundColor: '#FFF8EE',
    },
    stepCircleDone: {
        borderColor: '#F8B55F',
        backgroundColor: '#F8B55F',
    },
    stepNum: {
        fontSize: 12,
        fontWeight: '600',
        color: '#ccc',
    },
    stepNumActive: {
        color: '#F8B55F',
    },
    stepCheck: {
        fontSize: 13,
        color: '#fff',
        fontWeight: '700',
    },
    stepLabel: {
        fontSize: 10,
        color: '#ccc',
        fontWeight: '600',
        letterSpacing: 0.4,
    },
    stepLabelActive: {
        color: '#F8B55F',
    },
    stepLine: {
        flex: 1,
        height: 1.5,
        backgroundColor: '#ebebeb',
        marginBottom: 16,
        marginHorizontal: 6,
    },
    stepLineDone: {
        backgroundColor: '#F8B55F',
    },
});