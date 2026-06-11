/* eslint-disable react-native/no-inline-styles */
import React, { useRef } from "react";
import {
    View, Text, StyleSheet, ScrollView,
    TouchableOpacity, Animated, ImageBackground
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Icon from 'react-native-vector-icons/FontAwesome5';

const T = {
    BG: "#7DC20A",
    CARD: "#4A7C00",
    BORDER: "#5A9400",
    GOLD: "#F8B55F",
    WHITE: "#FFFFFF",
    SUB: "#D9F99D",
    DARK: "#1A3D00",
    DIVIDER: "#3D6B0066",
};

const LAST_UPDATED = "June 1, 2025";
const APP_NAME = "Bingo Blitz";
const CONTACT_EMAIL = "support@bingoblitz.app";

const sections = [
    {
        icon: "🗂️",
        title: "1. Information We Collect",
        body: `When you create an account and use ${APP_NAME}, we collect:\n\n• Username and email address\n• Password (stored as an encrypted hash — never in plain text)\n• Avatar selection\n• Game statistics: wins, level, XP, stars, rank\n• Device push notification token (FCM) for in-app notifications\n• Session data: last login date, daily session count, days logged in\n• In-app activity: last spin date, daily reward claims, active chat data`,
    },
    {
        icon: "🎯",
        title: "2. How We Use Your Information",
        body: `We use the information we collect to:\n\n• Operate and maintain your game account\n• Deliver in-game notifications (friend requests, messages, game events)\n• Calculate and display leaderboards and rankings\n• Provide daily rewards, spin bonuses, and seasonal events\n• Detect and prevent cheating, fraud, or abuse\n• Respond to support requests\n• Improve gameplay experience and fix bugs`,
    },
    {
        icon: "🔗",
        title: "3. Friends & Social Features",
        body: `${APP_NAME} includes social features such as friend requests, friend lists, and in-app messaging. When you send or accept a friend request, both users' usernames and avatars become visible to each other.\n\nIn-app messages are stored on our servers to enable delivery when recipients are offline. Messages are not used for advertising or shared with third parties.`,
    },
    {
        icon: "🔔",
        title: "4. Push Notifications",
        body: `We use Firebase Cloud Messaging (FCM) to send push notifications. Your device token is stored securely and used solely for delivering game-related notifications such as friend requests, messages, and event reminders.\n\nYou can disable push notifications at any time through your device's system settings or within the app's Settings screen.`,
    },
    {
        icon: "🤝",
        title: "5. Third-Party Services",
        body: `We use the following third-party services:\n\n• MongoDB Atlas — secure cloud database for storing user data\n• Firebase Cloud Messaging — push notification delivery\n• Socket.IO — real-time multiplayer and messaging infrastructure\n\nThese services have their own privacy policies. We do not sell your data to advertisers or data brokers.`,
    },
    {
        icon: "🧒",
        title: "6. Children's Privacy",
        body: `${APP_NAME} is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13.\n\nIf you are a parent or guardian and believe your child has provided us with personal information, please contact us at ${CONTACT_EMAIL} and we will promptly delete that information.`,
    },
    {
        icon: "🛡️",
        title: "7. Data Security",
        body: `We take reasonable technical and organizational measures to protect your data, including:\n\n• Passwords hashed using bcrypt\n• Auth tokens (JWT) with expiration\n• HTTPS for all API communication\n• No storage of payment or financial information\n\nNo method of transmission over the internet is 100% secure. We cannot guarantee absolute security, but we work hard to protect your data.`,
    },
    {
        icon: "✏️",
        title: "8. Your Rights",
        body: `You have the right to:\n\n• Access the personal data we hold about you\n• Request correction of inaccurate data\n• Request deletion of your account and all associated data\n• Withdraw consent for notifications at any time\n\nTo exercise these rights, contact us at ${CONTACT_EMAIL} or use the "Delete account" option in the Settings screen.`,
    },
    {
        icon: "🗃️",
        title: "9. Data Retention",
        body: `We retain your account data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where we are required to retain it for legal or compliance reasons.\n\nGame statistics and leaderboard entries may be anonymized and retained for analytical purposes after account deletion.`,
    },
    {
        icon: "🌍",
        title: "10. International Users",
        body: `${APP_NAME} is operated from India. If you access the app from outside India, your data may be transferred to and processed in India or other countries where our service providers operate.\n\nBy using the app, you consent to the transfer of your information to countries that may have different data protection rules than your country.`,
    },
    {
        icon: "🔄",
        title: "11. Changes to This Policy",
        body: `We may update this Privacy Policy from time to time. When we make significant changes, we will notify you via in-app notification or update the "Last updated" date at the top of this page.\n\nContinued use of ${APP_NAME} after changes are posted constitutes your acceptance of the revised policy.`,
    },
    {
        icon: "✉️",
        title: "12. Contact Us",
        body: `For any privacy-related questions, requests, or concerns, please reach out to us at:\n\n${CONTACT_EMAIL}\n\nWe aim to respond to all privacy inquiries within 7 business days.`,
    },
];

export default function PrivacyPolicy() {
    const navigation = useNavigation();
    const scrollY = useRef(new Animated.Value(0)).current;

    const headerBg = scrollY.interpolate({
        inputRange: [0, 60],
        outputRange: ["#7DC20Aff", "#4A7C00ff"],
        extrapolate: "clamp",
    });

    return (
        <ImageBackground
            source={require("../images/message_bg.png")}
            style={{flex:1}}
            resizeMode="cover">
            <SafeAreaView  style={styles.safe}>
                {/* Sticky animated header */}
                <Animated.View style={[styles.header, { backgroundColor: headerBg }]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Icon name="arrow-left" style={styles.backArrow} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Privacy Policy</Text>
                    <View style={{ width: 36 }} />
                </Animated.View>

                <Animated.ScrollView
                    style={styles.scroll}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: scrollY } } }],
                        { useNativeDriver: false }
                    )}
                    scrollEventThrottle={16}
                >
                    {/* Hero */}
                    <View style={styles.hero}>
                        <Text style={styles.heroEmoji}>🔒</Text>
                        <Text style={styles.heroTitle}>Privacy Policy</Text>
                        <Text style={styles.heroSub}>Last updated: {LAST_UPDATED}</Text>
                        <View style={styles.heroPill}>
                            <Text style={styles.heroPillText}>Your data, explained clearly</Text>
                        </View>
                    </View>

                    {/* Intro blurb */}
                    <View style={styles.introCard}>
                        <Text style={styles.introText}>
                            We believe you should know exactly what data {APP_NAME} collects and why.
                            This policy explains it plainly — no legal jargon.
                        </Text>
                    </View>

                    {/* Sections */}
                    {sections.map((s, i) => (
                        <View key={i} style={styles.card}>
                            <View style={styles.cardHeader}>
                                <View style={styles.iconBox}>
                                    <Text style={styles.iconEmoji}>{s.icon}</Text>
                                </View>
                                <Text style={styles.cardTitle}>{s.title}</Text>
                            </View>
                            <View style={styles.cardDivider} />
                            <Text style={styles.cardBody}>{s.body}</Text>
                        </View>
                    ))}

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            Questions about your privacy?
                        </Text>
                        <Text style={styles.footerEmail}>{CONTACT_EMAIL}</Text>
                    </View>

                    <View style={{ height: 40 }} />
                </Animated.ScrollView>
            </SafeAreaView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    safe: {
        flex: 1,

    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
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
    headerTitle: {
        color: T.WHITE,
        fontSize: 18,
        fontWeight: "700",
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
    },

    // Hero
    hero: {
        alignItems: "center",
        paddingVertical: 28,
        gap: 8,
    },
    heroEmoji: {
        fontSize: 56,
    },
    heroTitle: {
        color: T.DARK,
        fontSize: 26,
        fontWeight: "800",
    },
    heroSub: {
        color: T.DARK,
        fontSize: 13,
        opacity: 0.7,
    },
    heroPill: {
        marginTop: 4,
        backgroundColor: T.CARD,
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: T.BORDER,
    },
    heroPillText: {
        color: T.GOLD,
        fontSize: 12,
        fontWeight: "600",
    },

    // Intro
    introCard: {
        backgroundColor: T.CARD,
        borderWidth: 1,
        borderColor: T.BORDER,
        borderRadius: 18,
        padding: 16,
        marginBottom: 16,
        borderLeftWidth: 4,
        borderLeftColor: T.GOLD,
    },
    introText: {
        color: T.SUB,
        fontSize: 14,
        lineHeight: 22,
    },

    // Cards
    card: {
        backgroundColor: T.CARD,
        borderWidth: 1,
        borderColor: T.BORDER,
        borderRadius: 18,
        padding: 16,
        marginBottom: 14,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginBottom: 10,
    },
    iconBox: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: "#2D5A0044",
        justifyContent: "center",
        alignItems: "center",
    },
    iconEmoji: {
        fontSize: 20,
    },
    cardTitle: {
        color: T.GOLD,
        fontSize: 15,
        fontWeight: "700",
        flex: 1,
        flexWrap: "wrap",
    },
    cardDivider: {
        height: 1,
        backgroundColor: T.DIVIDER,
        marginBottom: 12,
    },
    cardBody: {
        color: T.SUB,
        fontSize: 14,
        lineHeight: 22,
    },

    // Footer
    footer: {
        alignItems: "center",
        paddingVertical: 24,
        gap: 6,
    },
    footerText: {
        color: T.DARK,
        fontSize: 13,
        fontWeight: "600",
    },
    footerEmail: {
        color: T.DARK,
        fontSize: 13,
        textDecorationLine: "underline",
    },
});