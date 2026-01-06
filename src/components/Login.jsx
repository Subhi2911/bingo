/* eslint-disable react-native/no-inline-styles */
import {
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
	Modal,
	Pressable,
	Alert,
} from "react-native";
import React, { useState } from "react";
import { BACKEND_URL } from "../config/backend";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const Login = () => {
	const [credentials, setCredentials] = useState({
		email: "",
		password: "",
	});

	const [otpEmail, setOtpEmail] = useState("");

	const [password, setPassword] = useState("");
	const [cpassword, setCpassword] = useState("");

	const [otp, setOtp] = useState("");

	const [loginModal, setLoginModal] = useState(false);

	const [loading, setLoading] = useState(false);

	const [step, setStep] = useState(1);

	const navigation = useNavigation();

	const onChange = (name, value) => {
		setCredentials({ ...credentials, [name]: value });
	};

	const handleLogin = async () => {
		try {
			setLoading(true);
			const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: credentials.email,
					password: credentials.password,
				}),
			});

			const data = await res.json();
			if (res.ok) {
				await AsyncStorage.setItem("authToken", data.authToken);
				navigation.navigate("Dashboard");
				Alert.alert("Success", "Login Successful!");
			} else {
				Alert.alert("Error", data.error || "Login failed");
			}
		} catch (err) {
			console.log(err);
		} finally {
			setLoading(false);
		}
	};
	const handleSendEmail = async () => {
		if (!otpEmail) {
			Alert.alert("Error", "Email required");
			return;
		}

		setLoading(true);
		try {
			const res = await fetch(`${BACKEND_URL}/api/auth/forgot-password`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: otpEmail })
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
			const res = await fetch(`${BACKEND_URL}/api/auth/verify-otp`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: otpEmail, otp })
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

	const handleResetPassword = async () => {
		if (!password) {
			Alert.alert("Error", "Password required");
			return;
		}
		try {
			const res = await fetch(`${BACKEND_URL}/api/auth/reset-password`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: otpEmail, newPassword: password })
			});
			const data = await res.json();
			if (res.ok) {
				Alert.alert("Success", "Password changed successfully!");
				setLoginModal(false);
			} else {
				Alert.alert("Failed", data.message || "Something went wrong");
			}
		} catch (err) {
			console.log(err);
		}

	}


	return (
		<View>
			<View style={{ width: "100%", marginTop: 20, gap: 10 }}>
				<Text style={styles.label}>Email</Text>
				<TextInput
					style={styles.input}
					placeholder="Enter your email"
					placeholderTextColor="grey"
					value={credentials.email}
					onChangeText={(v) => onChange("email", v)}
				/>

				<Text style={styles.label}>Password</Text>
				<TextInput
					style={styles.input}
					placeholder="Enter your password"
					placeholderTextColor="grey"
					secureTextEntry
					value={credentials.password}
					onChangeText={(v) => onChange("password", v)}
				/>

				<TouchableOpacity onPress={() => setLoginModal(true)}>
					<Text style={styles.link}>Forgot Password?</Text>
				</TouchableOpacity>

				<TouchableOpacity style={styles.btn} onPress={handleLogin}>
					<Text style={styles.btnText}>
						{loading ? "Logging in..." : "Login"}
					</Text>
				</TouchableOpacity>
			</View>

			{/*  OTP MODAL */}
			<Modal
				transparent
				animationType="fade"
				visible={loginModal}
				onRequestClose={() => setLoginModal(false)}
			>
				<Pressable
					style={styles.modalOverlay}
					onPress={() => setLoginModal(false)}
				>
					<Pressable style={styles.modalContent}>
						<Text style={styles.modalTitle}>Verify OTP</Text>

						<TextInput
							style={styles.modalInput}
							placeholder="Enter your email"
							placeholderTextColor="grey"
							value={otpEmail}
							onChangeText={setOtpEmail}
						/>
						{step === 1 && (
							<TouchableOpacity style={styles.modalBtn} onPress={handleSendEmail}>
								<Text style={styles.modalBtnText}>Send OTP</Text>
							</TouchableOpacity>
						)}



						{step === 2 && (
							<>
								<TextInput
									style={styles.modalInput}
									placeholder="Enter OTP"
									placeholderTextColor="grey"
									keyboardType="number-pad"
									maxLength={6}
									value={otp}
									onChangeText={setOtp}
								/>
								<TouchableOpacity style={styles.modalBtn} onPress={handleVerifyOtp}>
									<Text style={styles.modalBtnText}>Verify OTP</Text>
								</TouchableOpacity>
							</>)}

						{step === 3 && (
							<>

								<TextInput
									style={styles.modalInput}
									placeholder="Enter new password"
									placeholderTextColor="grey"
									secureTextEntry
									value={password}
									onChangeText={setPassword}
								/>

								<TextInput
									style={styles.modalInput}
									placeholder="Confirm password"
									placeholderTextColor="grey"
									secureTextEntry
									value={cpassword}
									onChangeText={setCpassword}
								/>
								<View style={{ width: "100%", alignItems: "flex-start" }}>
									<Text style={{ fontSize: 12, color: "grey" }}>
										Password must be at least 6 characters.
									</Text>
								</View>
								{password !== cpassword && (
									<View style={{ width: "100%", alignItems: "flex-start" }}>
										<Text style={{ fontSize: 12, color: "red" }}>
											Password do not match
										</Text>
									</View>
								)}

								<TouchableOpacity style={styles.modalBtn} onPress={handleResetPassword}>
									<Text style={styles.modalBtnText}>Reset Password</Text>
								</TouchableOpacity>
							</>)}
						<TouchableOpacity onPress={() => setLoginModal(false)}>
							<Text style={styles.cancelText}>Cancel</Text>
						</TouchableOpacity>
					</Pressable>
				</Pressable>
			</Modal>
		</View>
	);
};

export default Login;

const styles = StyleSheet.create({
	input: {
		width: 300,
		height: 40,
		backgroundColor: "#fff",
		borderRadius: 5,
		paddingLeft: 10,
		marginBottom: 10,
		color: "black",
	},
	label: {
		fontSize: 16,
		fontWeight: "500",
		color: "#fff",
	},
	btn: {
		backgroundColor: "#F8B55F",
		width: "100%",
		height: 40,
		borderRadius: 5,
		justifyContent: "center",
		alignItems: "center",
	},
	btnText: {
		color: "#fff",
		fontSize: 16,
		fontWeight: "500",
	},
	link: {
		color: "#F8B55F",
		textDecorationLine: "underline",
		marginTop: 10,
		fontSize: 14,
	},

	/* MODAL STYLES */
	modalOverlay: {
		flex: 1,
		backgroundColor: "rgba(0,0,0,0.5)",
		justifyContent: "center",
		alignItems: "center",
	},
	modalContent: {
		width: 280,
		backgroundColor: "#fff",
		borderRadius: 12,
		padding: 20,
		alignItems: "center",
	},
	modalTitle: {
		fontSize: 18,
		fontWeight: "600",
		marginBottom: 15,
	},
	modalInput: {
		width: "100%",
		height: 40,
		borderWidth: 1,
		borderColor: "#ddd",
		borderRadius: 5,
		paddingLeft: 10,
		marginBottom: 10,
		color: "#000",
	},
	modalBtn: {
		backgroundColor: "#F8B55F",
		width: "100%",
		height: 40,
		borderRadius: 5,
		justifyContent: "center",
		alignItems: "center",
		marginTop: 5,
	},
	modalBtnText: {
		color: "#fff",
		fontWeight: "600",
	},
	cancelText: {
		marginTop: 10,
		color: "#888",
		fontSize: 13,
	},
});
