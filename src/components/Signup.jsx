/* eslint-disable react-native/no-inline-styles */
import {
    StyleSheet, Text, View, TextInput,
    TouchableOpacity, Alert, Animated, ScrollView
} from 'react-native';
import React, { useState, useRef } from 'react';
import { BACKEND_URL } from "../config/backend";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { showAlert2 } from './CustomAlert2';

const STEPS = ['Email', 'Verify', 'Account'];

const StepIndicator = ({ step }) => (
    <View style={styles.stepRow}>
        {STEPS.map((label, i) => {
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
                                ? <Text style={styles.stepCheckmark}>✓</Text>
                                : <Text style={[styles.stepNum, active && styles.stepNumActive]}>{idx}</Text>
                            }
                        </View>
                        <Text style={[styles.stepLabel, active && styles.stepLabelActive]}>{label}</Text>
                    </View>
                    {i < STEPS.length - 1 && (
                        <View style={[styles.stepLine, step > idx && styles.stepLineDone]} />
                    )}
                </React.Fragment>
            );
        })}
    </View>
);

const Signup = () => {
    const [credentials, setCredentials] = useState({ username: '', email: '', password: '', cpassword: '' });
    const [step, setStep] = useState(1);
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const fadeAnim = useRef(new Animated.Value(1)).current;

    const animateStep = (fn) => {
        Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
            fn();
            Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
        });
    };

    const onChange = (name, value) => setCredentials(prev => ({ ...prev, [name]: value }));

    const handleSendEmail = async () => {
        if (!credentials.email) {showAlert2({ type: 'error', title: 'Error', message: 'Email required.' }); return; }
        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/emailverification/sendemailotp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: credentials.email })
            });
            const data = await res.json();
            if (res.ok) { animateStep(() => setStep(2)); }
            else {showAlert2({ type: 'error', title: 'Failed', message: data.error||'Something went wrong.' }); }
        } finally { setLoading(false); }
    };

    const handleVerifyOtp = async () => {
        if (!otp) { showAlert2({ type: 'error', title: 'Error', message: 'OTP required' }); return; }
        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/emailverification/verifyemailotp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: credentials.email, otp })
            });
            const data = await res.json();
            if (res.ok) { animateStep(() => setStep(3)); }
            else { showAlert2({ type: 'error', title: 'Invalid OTP', message: data.error||'Try Again' });}
        } finally { setLoading(false); }
    };

    const handleSignup = async () => {
        if (!credentials.username || !credentials.password) {
            showAlert2({ type: 'error', title: 'Error', message: 'All fields required.' }); return;
        }
        if (credentials.password !== credentials.cpassword) {
            showAlert2({ type: 'error', title: 'Error', message: 'Passwords do not match.' }); return;
        }
        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: credentials.username,
                    email: credentials.email,
                    password: credentials.password
                })
            });
            const data = await res.json();
            if (res.ok) {
                await AsyncStorage.setItem("authToken", data.authToken);
                showAlert2({ type: 'success', title: 'Account Created!' });
                navigation.navigate("AvatarSelection");
            } else {
                showAlert2({ type: 'error', title: 'Error!' ,message: "Signup failed."})
            }
        } catch (error) {
            console.log("Signup error:", error);
        } finally { setLoading(false); }
    };

    const passwordsMatch = credentials.password === credentials.cpassword || !credentials.cpassword;

    return (
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <StepIndicator step={step} />

            <Animated.View style={{ opacity: fadeAnim, width: '100%' }}>

                {/* Step 1 — Email + Username */}
                {step === 1 && (
                    <View style={styles.fieldGroup}>
                        <View style={styles.field}>
                            <Text style={styles.label}>USERNAME</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Choose a username"
                                placeholderTextColor="rgba(255,255,255,0.25)"
                                value={credentials.username}
                                onChangeText={(v) => onChange("username", v)}
                                autoCapitalize="none"
                            />
                        </View>
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
                        <TouchableOpacity
                            style={[styles.btn, loading && styles.btnDisabled]}
                            onPress={handleSendEmail}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.btnText}>{loading ? "Sending…" : "Send OTP →"}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Step 2 — OTP */}
                {step === 2 && (
                    <View style={styles.fieldGroup}>
                        <View style={styles.emailBadge}>
                            <Text style={styles.emailBadgeLabel}>Code sent to</Text>
                            <Text style={styles.emailBadgeValue}>{credentials.email}</Text>
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.label}>VERIFICATION CODE</Text>
                            <TextInput
                                style={[styles.input, styles.otpInput]}
                                placeholder="000000"
                                placeholderTextColor="rgba(255,255,255,0.25)"
                                value={otp}
                                onChangeText={setOtp}
                                keyboardType="number-pad"
                                maxLength={6}
                            />
                        </View>
                        <TouchableOpacity
                            style={[styles.btn, loading && styles.btnDisabled]}
                            onPress={handleVerifyOtp}
                            disabled={loading}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.btnText}>{loading ? "Verifying…" : "Verify code →"}</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Step 3 — Password */}
                {step === 3 && (
                    <View style={styles.fieldGroup}>
                        <View style={styles.field}>
                            <Text style={styles.label}>PASSWORD</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Min. 6 characters"
                                placeholderTextColor="rgba(255,255,255,0.25)"
                                secureTextEntry
                                value={credentials.password}
                                onChangeText={(v) => onChange("password", v)}
                            />
                        </View>
                        <View style={styles.field}>
                            <Text style={styles.label}>CONFIRM PASSWORD</Text>
                            <TextInput
                                style={[styles.input, !passwordsMatch && styles.inputError]}
                                placeholder="Repeat password"
                                placeholderTextColor="rgba(255,255,255,0.25)"
                                secureTextEntry
                                value={credentials.cpassword}
                                onChangeText={(v) => onChange("cpassword", v)}
                            />
                            {!passwordsMatch && (
                                <Text style={styles.errorText}>Passwords don't match</Text>
                            )}
                        </View>
                        <TouchableOpacity
                            style={[styles.btn, (loading || !passwordsMatch) && styles.btnDisabled]}
                            onPress={handleSignup}
                            disabled={loading || !passwordsMatch}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.btnText}>{loading ? "Creating account…" : "Create account →"}</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </Animated.View>
        </ScrollView>
    );
};

export default Signup;

const styles = StyleSheet.create({
    /* Step indicator */
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
        borderColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    stepCircleActive: {
        borderColor: '#F8B55F',
        backgroundColor: 'rgba(248,181,95,0.15)',
    },
    stepCircleDone: {
        borderColor: '#F8B55F',
        backgroundColor: '#F8B55F',
    },
    stepNum: {
        fontSize: 12,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.35)',
    },
    stepNumActive: {
        color: '#F8B55F',
    },
    stepCheckmark: {
        fontSize: 13,
        color: '#fff',
        fontWeight: '700',
    },
    stepLabel: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.3)',
        fontWeight: '600',
        letterSpacing: 0.4,
    },
    stepLabelActive: {
        color: '#F8B55F',
    },
    stepLine: {
        flex: 1,
        height: 1.5,
        backgroundColor: 'rgba(255,255,255,0.12)',
        marginBottom: 16,
        marginHorizontal: 6,
    },
    stepLineDone: {
        backgroundColor: '#F8B55F',
    },

    /* Fields */
    fieldGroup: {
        width: '100%',
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
    inputError: {
        borderColor: 'rgba(255,107,107,0.6)',
        backgroundColor: 'rgba(255,107,107,0.06)',
    },
    otpInput: {
        letterSpacing: 10,
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
    },
    errorText: {
        fontSize: 12,
        color: '#ff8080',
        marginTop: 6,
        marginLeft: 2,
    },

    /* Email badge */
    emailBadge: {
        backgroundColor: 'rgba(248,181,95,0.1)',
        borderRadius: 10,
        padding: 12,
        marginBottom: 18,
        borderWidth: 1,
        borderColor: 'rgba(248,181,95,0.2)',
    },
    emailBadgeLabel: {
        fontSize: 11,
        color: 'rgba(255,255,255,0.4)',
        marginBottom: 2,
        letterSpacing: 0.3,
    },
    emailBadgeValue: {
        fontSize: 14,
        color: '#F8B55F',
        fontWeight: '600',
    },

    /* Button */
    btn: {
        width: '100%',
        height: 52,
        backgroundColor: '#F8B55F',
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 6,
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
});