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
        icon: "📋",
        title: "1. Acceptance of Terms",
        body: `By downloading, installing, or playing ${APP_NAME}, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use the app.\n\nWe may update these terms from time to time. Continued use of the app after changes constitutes your acceptance of the revised terms.`,
    },
    {
        icon: "🎮",
        title: "2. Eligibility",
        body: `You must be at least 13 years old to use ${APP_NAME}. By using the app you confirm that you meet this age requirement. Users under 18 should review these terms with a parent or guardian.\n\nWe reserve the right to terminate accounts that we believe belong to users who do not meet the eligibility criteria.`,
    },
    {
        icon: "🪙",
        title: "3. In-Game Currency & Rewards",
        body: `${APP_NAME} uses virtual currency (coins) and rewards that have no real-world monetary value. Virtual items cannot be exchanged for real money, transferred, or sold outside the app.\n\nDaily rewards, spins, and bonuses are provided at our discretion and may be modified or removed at any time without notice.`,
    },
    {
        icon: "🏆",
        title: "4. Fair Play",
        body: `You agree not to:\n• Use cheats, bots, exploits, or automation tools\n• Manipulate game outcomes through unauthorized means\n• Collude with other players to gain unfair advantages\n• Harass, abuse, or threaten other players\n\nViolation of fair play rules may result in immediate account suspension or permanent ban without refund.`,
    },
    {
        icon: "👤",
        title: "5. User Accounts",
        body: `You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.\n\nEach user may hold only one account. Creating multiple accounts to gain advantages is prohibited and may result in all associated accounts being banned.`,
    },
    {
        icon: "🎭",
        title: "6. Avatars & Usernames",
        body: `Usernames and avatars must not be offensive, impersonate other people, or violate third-party rights. We reserve the right to remove or change any username or avatar that we deem inappropriate, without notice.\n\nChanging your avatar will reset your game statistics. This action is irreversible.`,
    },
    {
        icon: "🔒",
        title: "7. Intellectual Property",
        body: `All content within ${APP_NAME} — including graphics, sounds, game mechanics, and text — is the exclusive property of the developer and is protected by applicable intellectual property laws.\n\nYou may not copy, reproduce, distribute, or create derivative works from any part of the app without explicit written permission.`,
    },
    {
        icon: "⚠️",
        title: "8. Disclaimers",
        body: `${APP_NAME} is provided "as is" without warranties of any kind. We do not guarantee uninterrupted or error-free service. We are not liable for any loss of data, virtual items, or progress resulting from technical issues, server downtime, or app updates.\n\nGame features, modes, and rules may change at any time.`,
    },
    {
        icon: "🚫",
        title: "9. Termination",
        body: `We reserve the right to suspend or permanently terminate your account at any time, with or without cause, including but not limited to violations of these terms.\n\nUpon termination, all virtual currency, items, progress, and rewards associated with your account will be forfeited.`,
    },
    {
        icon: "✉️",
        title: "10. Contact",
        body: `If you have questions about these Terms of Service, please contact us at:\n\n${CONTACT_EMAIL}`,
    },
];

export default function TermsOfService() {
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
            style={{ flex: 1 }}
            resizeMode="cover">
            <SafeAreaView style={styles.safe}>

                {/* Sticky animated header */}
                <Animated.View style={[styles.header, { backgroundColor: headerBg ,}]}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Icon name="arrow-left" style={styles.backArrow} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Terms of Service</Text>
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
                        <Text style={styles.heroEmoji}>📜</Text>
                        <Text style={styles.heroTitle}>Terms of Service</Text>
                        <Text style={styles.heroSub}>Last updated: {LAST_UPDATED}</Text>
                        <View style={styles.heroPill}>
                            <Text style={styles.heroPillText}>Please read carefully before playing</Text>
                        </View>
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
                            By using {APP_NAME} you agree to these terms.
                        </Text>
                        <Text style={styles.footerEmail}>{CONTACT_EMAIL}</Text>
                    </View>

                    <View style={{ height: 40 }} />
                </Animated.ScrollView>


            </SafeAreaView >
        </ImageBackground >

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

    // Card
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
        textAlign: "center",
        fontWeight: "600",
    },
    footerEmail: {
        color: T.CARD,
        fontSize: 13,
        textDecorationLine: "underline",
    },
});