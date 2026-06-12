/* eslint-disable react-native/no-inline-styles */
import React, { useRef } from "react";
import {
    View, Text, StyleSheet, TouchableOpacity,
    Animated, ImageBackground,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome5";

// ─── Same tokens as Profile ───────────────────────────────────────────────────
const T = {
    GLASS: "rgba(15,35,5,0.78)",
    GLASS_DARK: "rgba(10,25,3,0.88)",
    GLASS_BORDER: "rgba(255,255,255,0.10)",

    INK: "#F0EDD8",
    INK_MED: "#C8C4A0",
    INK_LIGHT: "#8A9070",

    GOLD: "#E8920A",
    GOLD_BG: "rgba(232,146,10,0.18)",

    LABEL: "#A8C878",
    DIV: "rgba(255,255,255,0.08)",
};

const LAST_UPDATED = "June 1, 2026";
const APP_NAME = "Bingo Bing";
const CONTACT_EMAIL = "littleaalu.appie@gmail.com";

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

    return (
        <ImageBackground
            source={require("../images/message_bg.png")}
            style={styles.bg}
            resizeMode="cover"
        >
            {/* Same dark overlay as Profile */}
            <View style={styles.bgTint} />

            <SafeAreaView style={styles.safe}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <Icon name="arrow-left" size={16} color={T.INK} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Terms of Service</Text>
                    <View style={{ width: 36 }} />
                </View>

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
                        <View style={styles.heroIconWrap}>
                            <Text style={styles.heroEmoji}>📜</Text>
                        </View>
                        <Text style={styles.heroTitle}>Terms of Service</Text>
                        <Text style={styles.heroSub}>Last updated: {LAST_UPDATED}</Text>
                        <View style={styles.heroPill}>
                            <Text style={styles.heroPillText}>Please read carefully before playing</Text>
                        </View>
                    </View>

                    {/* Section label */}
                    <View style={styles.sectionTitleRow}>
                        <View style={styles.sectionTitleBar} />
                        <Text style={styles.sectionTitle}>Sections</Text>
                    </View>

                    {/* Cards */}
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

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>
                            By using {APP_NAME} you agree to these terms.
                        </Text>
                        <Text style={styles.footerEmail}>{CONTACT_EMAIL}</Text>
                    </View>

                    <View style={{ height: 48 }} />
                </Animated.ScrollView>
            </SafeAreaView>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    bg: { flex: 1 },
    bgTint: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(5,18,2,0.84)",
    },
    safe: { flex: 1 },

    // ── Header ──
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 14,
    },
    backBtn: {
        width: 36, height: 36, borderRadius: 18,
        backgroundColor: "rgba(255,255,255,0.10)",
        justifyContent: "center", alignItems: "center",
        borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
    },
    headerTitle: {
        fontSize: 20, fontWeight: "800", color: T.INK,
        letterSpacing: 0.3,
    },

    scroll: { flex: 1 },
    scrollContent: { paddingHorizontal: 16, paddingBottom: 24 },

    // ── Hero ──
    hero: {
        alignItems: "center",
        paddingVertical: 28,
        gap: 8,
    },
    heroIconWrap: {
        width: 80, height: 80, borderRadius: 40,
        backgroundColor: T.GLASS,
        borderWidth: 1, borderColor: T.GLASS_BORDER,
        justifyContent: "center", alignItems: "center",
        marginBottom: 4,
        shadowColor: T.GOLD, shadowOpacity: 0.2, shadowRadius: 12, elevation: 6,
    },
    heroEmoji: { fontSize: 40 },
    heroTitle: {
        color: T.INK, fontSize: 24, fontWeight: "800", letterSpacing: 0.2,
    },
    heroSub: {
        color: T.INK_LIGHT, fontSize: 13,
    },
    heroPill: {
        marginTop: 4,
        backgroundColor: T.GOLD_BG,
        borderRadius: 20,
        paddingHorizontal: 14, paddingVertical: 6,
        borderWidth: 1, borderColor: T.GOLD,
    },
    heroPillText: {
        color: T.GOLD, fontSize: 12, fontWeight: "600",
    },

    // ── Section label (same as Profile) ──
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

    // ── Card (same glass as Profile) ──
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
        padding: 16,
    },
    cardHeader: {
        flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10,
    },
    iconBox: {
        width: 38, height: 38, borderRadius: 10,
        backgroundColor: "rgba(255,255,255,0.07)",
        justifyContent: "center", alignItems: "center",
        borderWidth: 1, borderColor: T.GLASS_BORDER,
    },
    iconEmoji: { fontSize: 20 },
    cardTitle: {
        color: T.GOLD, fontSize: 15, fontWeight: "700",
        flex: 1, flexWrap: "wrap",
    },
    cardDivider: {
        height: 1, backgroundColor: T.DIV, marginBottom: 12,
    },
    cardBody: {
        color: T.INK_MED, fontSize: 14, lineHeight: 22,
    },

    // ── Footer ──
    footer: {
        alignItems: "center", paddingVertical: 24, gap: 6,
    },
    footerText: {
        color: T.INK_LIGHT, fontSize: 13, textAlign: "center", fontWeight: "600",
    },
    footerEmail: {
        color: T.GOLD, fontSize: 13, textDecorationLine: "underline",
    },
});