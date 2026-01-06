/* eslint-disable react-native/no-inline-styles */
import { StyleSheet, Text, View, TextInput, TouchableHighlight, TouchableOpacity, Alert } from 'react-native'
import React, { useState } from 'react'
import { BACKEND_URL } from "../config/backend";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';


const Signup = () => {

    const [credentials, setCredentials] = useState({ username: '', email: '', password: '', cpassword: '' });
    const [step, setStep] = useState(1);
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();


    const onChange = (name, value) => {
        setCredentials({ ...credentials, [name]: value });
    };

    const handleSendEmail = async () => {
        if (!credentials.email) {
            Alert.alert("Error", "Email required");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/emailverification/sendemailotp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: credentials.email })
            });

            const data = await res.json();
            console.log(data);
            if (res.ok) {
                setStep(2);
            } else {
                Alert.alert("Failed", data.message || "Something went wrong");
            }

        } finally {
            setLoading(false);

        }

    };

    const handleVerifyOtp = async () => {
        if (!otp) {
            Alert.alert("Error", "OTP required");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/emailverification/verifyemailotp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: credentials.email, otp })
            });

            const data = await res.json();
            if (res.ok) {
                setStep(3);
            } else {
                Alert.alert("Invalid OTP", data.message || "Try again");
            }

        } finally {
            setLoading(false);
        }
    };

    const handleSignup = async () => {
        if (!credentials.username || !credentials.password) {
            Alert.alert("Error", "All fields required");
            return;
        }

        if (credentials.password !== credentials.cpassword) {
            Alert.alert("Error", "Passwords do not match");
            return;
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
            console.log(data);

            if (res.ok) {
                await AsyncStorage.setItem("authToken", data.authToken);
                navigation.navigate("Dashboard");
                Alert.alert("Success", "Account created!");
                setLoading(false);
            } else {
                Alert.alert("Error", data.error || "Signup failed");
            }

        } catch (error) {
            console.log("Signup error:", error);
        } finally {
            setLoading(false);

        }

    };

    return (
        <View>
            <View style={{ width: '100%', marginTop: 20, gap: 10 }}>

                <Text style={styles.label}>Username</Text>
                <TextInput
                    style={styles.input}
                    placeholder='Enter your username'
                    placeholderTextColor="grey"
                    value={credentials.username}
                    onChangeText={(v) => onChange("username", v)}
                />

                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    placeholder='Enter your email'
                    placeholderTextColor="grey"
                    value={credentials.email}
                    onChangeText={step===1?(v) => onChange("email", v):null}
                />

                {step === 1 && (
                    <TouchableHighlight
                        style={styles.btn}
                        onPress={handleSendEmail}
                    >
                        <Text style={styles.btnText}>
                            {loading ? "Sending..." : "Send OTP"}
                        </Text>
                    </TouchableHighlight>
                )}

                {step === 2 && (
                    <>
                        <Text style={styles.label}>Enter OTP</Text>
                        <TextInput
                            style={styles.input}
                            placeholder='Enter OTP'
                            placeholderTextColor="grey"
                            value={otp}
                            onChangeText={setOtp}
                        />

                        <TouchableHighlight
                            style={styles.btn}
                            onPress={handleVerifyOtp}
                        >
                            <Text style={styles.btnText}>
                                {loading ? 'Verifying...' : 'Verify OTP'}
                            </Text>
                        </TouchableHighlight>
                    </>
                )}

                {step === 3 && (
                    <>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder='Enter your password'
                            placeholderTextColor="grey"
                            secureTextEntry
                            value={credentials.password}
                            onChangeText={(v) => onChange("password", v)}
                        />

                        <Text style={styles.label}>Confirm Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder='Confirm your password'
                            placeholderTextColor="grey"
                            secureTextEntry
                            value={credentials.cpassword}
                            onChangeText={(v) => onChange("cpassword", v)}
                        />

                        {credentials.password !== credentials.cpassword && (
                            <Text style={{ color: 'red' }}>Passwords do not match</Text>
                        )}
                    </>
                )}
            </View>

            {step === 3 && (
                <TouchableOpacity style={styles.btn} onPress={handleSignup}>
                    <Text style={styles.btnText}>{loading ? "Please wait..." : "Sign Up"}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

export default Signup;

const styles = StyleSheet.create({
    input: {
        width: 300,
        height: 40,
        backgroundColor: '#fff',
        borderRadius: 5,
        paddingLeft: 10,
        marginBottom: 10,
        color: 'black'
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#fff'
    },
    btn: {
        backgroundColor: '#F8B55F',
        width: 120,
        height: 40,
        borderRadius: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    btnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500'
    }
});
