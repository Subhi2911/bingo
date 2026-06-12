/* eslint-disable react-native/no-inline-styles */
import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Modal,
    Pressable,
    TextInput,
} from "react-native";
import { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { BACKEND_URL } from "../config/backend";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScrollView } from "react-native";
import { showAlert2 } from "./CustomAlert2";

// ─── Day labels anchored to real calendar day ────────────────────────────────
// JS getDay(): 0=Sun,1=Mon,2=Tue,3=Wed,4=Thu,5=Fri,6=Sat
// We want Mon=0 … Sun=6 (streak day index)
const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

// Returns 0 (Mon) … 6 (Sun) for today
const getTodayIndex = () => {
    const jsDay = new Date().getDay(); // 0=Sun … 6=Sat
    return (jsDay + 6) % 7;            // shift so Mon=0
};

// Mystery box possible prizes
const MYSTERY_BOX_PRIZES = [
    { label: "50 coins",  type: "coins",  value: 50 },
    { label: "200 coins", type: "coins",  value: 200 },
    { label: "500 coins", type: "coins",  value: 500 },
    { label: "2 XP",      type: "xp",     value: 2 },
    { label: "10 XP",     type: "xp",     value: 10 },
    { label: "25 XP",     type: "xp",     value: 25 },
    { label: "+1 Day",    type: "days",   value: 1 },
];

const HomeScreen = ({ setSelected, setSearchResults }) => {
    const navigation = useNavigation();
    const [showRewardsModal, setShowRewardsModal] = React.useState(false);
    const [user, setUser] = React.useState(null);
    const [query, setQuery] = React.useState("");

    // Mystery box state
    const [mysteryPrize, setMysteryPrize] = React.useState(null);
    const [showMysteryModal, setShowMysteryModal] = React.useState(false);

    const launchGame = (mode) => {
        navigation.navigate(mode);
    };

    React.useEffect(() => {
        const getUser = async () => {
            try {
                const token = await AsyncStorage.getItem("authToken");
                const response = await fetch(`${BACKEND_URL}/api/auth/getuser`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "auth-token": token,
                    },
                });
                const json = await response.json();
                setUser(json);
            } catch (error) {
                console.error(error);
            }
        };
        getUser();
    }, []);

    // ─── Daily reward map ────────────────────────────────────────────────────
    // Day 4 is now "Mystery Box" — backend will resolve the actual prize
    const dailyReward = {
        1: "100 coins",
        2: "2 XP",
        3: "150 coins",
        4: "Mystery Box",
        5: "1x Spin",
        6: "4 XP",
        7: "1000 coins",
    };

    // ─── Can claim? ──────────────────────────────────────────────────────────
    const lastClaim = user?.lastDailyClaim
        ? new Date(user.lastDailyClaim).getTime()
        : null;

    const canClaim =
        !lastClaim ||
        Date.now() - lastClaim >= 24 * 60 * 60 * 1000;

    // ─── Which day slot to highlight (1-indexed, 1–7) ───────────────────────
    // BUG FIX: use real calendar weekday, not daysLoggedIn count
    const todayIndex = getTodayIndex();        // 0–6, Mon=0
    const todaySlot  = todayIndex + 1;         // 1–7

    // A slot is "done" if user claimed it already today or on a prior streak day
    // We compare against daysLoggedIn so past days stay checked
    const isSlotDone = (slot) => {
        if (!user) return false;
        const days = user.daysLoggedIn || 0;
        if (days === 0) return false;
        // If streak covers this slot and today's slot is past it
        return slot < todaySlot && days >= slot;
    };

    const isSlotToday = (slot) => slot === todaySlot;

    // ─── Claim handler ───────────────────────────────────────────────────────
    const handleClaimRewards = async () => {
        try {
            const token = await AsyncStorage.getItem("authToken");
            const response = await fetch(`${BACKEND_URL}/api/games/daily-claim`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": token,
                },
            });
            const json = await response.json();

            if (!response.ok) {
                showAlert2({ type: "error", title: json.message || "Could not claim reward" });
                return;
            }

            setUser(json.user);

            // ── Mystery Box: show random prize modal ─────────────────────────
            if (json.mysteryPrize) {
                // Backend resolved and applied the prize; just show what it was
                setMysteryPrize(json.mysteryPrize);
                setShowMysteryModal(true);
            } else {
                showAlert2({ type: "reward", title: "Daily reward claimed!" });
            }
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        console.log("lastDailyClaim:", user?.lastDailyClaim);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ─── Next day reward label ───────────────────────────────────────────────
    const currentDayReward = dailyReward[todaySlot] || "Bonus";
    const nextDaySlot       = (todaySlot % 7) + 1;
    const nextDayReward     = dailyReward[nextDaySlot] || "Bonus";

    return (
        <View style={styles.container}>

            {/* ── Mystery Box Modal ─────────────────────────────────────── */}
            <Modal
                visible={showMysteryModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowMysteryModal(false)}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => setShowMysteryModal(false)}
                >
                    <Pressable style={styles.mysteryBox} onPress={() => {}}>
                        <Text style={styles.mysteryEmoji}>🎁</Text>
                        <Text style={styles.mysteryTitle}>Mystery Box!</Text>
                        <Text style={styles.mysterySubtitle}>You won</Text>
                        <Text style={styles.mysteryPrizeText}>
                            {mysteryPrize?.label || "a prize"}
                        </Text>
                        <TouchableOpacity
                            style={styles.mysteryBtn}
                            onPress={() => setShowMysteryModal(false)}
                        >
                            <Text style={styles.mysteryBtnText}>Awesome!</Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>

            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                    paddingHorizontal: 22,
                    paddingTop: 8,
                    paddingBottom: 120,
                }}
            >
                {/* DAILY REWARD CARD */}
                <Pressable style={styles.rewardCard} onPress={() => setShowRewardsModal(true)}>

                    {/* Top row: info + button */}
                    <View style={styles.rewardTopRow}>
                        <View>
                            <View style={styles.rewardTag}>
                                <Icon name="calendar" size={11} color="#FFD67A" />
                                <Text style={styles.rewardTagText}>Daily Reward</Text>
                            </View>
                            <Text style={styles.rewardVal}>
                                {canClaim ? currentDayReward : nextDayReward}
                            </Text>
                            <Text style={styles.rewardDesc}>
                                {canClaim
                                    ? `Day ${todaySlot} — available now`
                                    : `Day ${nextDaySlot} up next`}
                            </Text>
                        </View>

                        <TouchableOpacity
                            style={[styles.claimBtn, !canClaim && styles.claimBtnOff]}
                            onPress={handleClaimRewards}
                            disabled={!canClaim}
                        >
                            <Icon
                                name={canClaim ? "gift" : "clock"}
                                size={13}
                                color={canClaim ? "#1E1740" : "#A9A6C1"}
                            />
                            <Text style={[styles.claimBtnText, !canClaim && styles.claimBtnTextOff]}>
                                {canClaim ? "Claim" : "Tomorrow"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* 7-day pip tracker — anchored to Mon–Sun */}
                    <View style={styles.daysTrack}>
                        {[1, 2, 3, 4, 5, 6, 7].map((slot, i) => {
                            const done  = isSlotDone(slot);
                            const today = isSlotToday(slot);
                            return (
                                <React.Fragment key={slot}>
                                    {i > 0 && (
                                        <View style={[styles.dayLine, done && styles.dayLineDone]} />
                                    )}
                                    <View style={styles.dayItem}>
                                        <View style={[
                                            styles.dayCircle,
                                            done  && styles.dayCircleDone,
                                            today && styles.dayCircleToday,
                                        ]}>
                                            {done
                                                ? <Icon name="check" size={10} color="#1E1740" />
                                                : <Text style={[styles.dayNum, today && { color: "#FFD67A" }]}>{slot}</Text>
                                            }
                                        </View>
                                        {/* BUG FIX: label tied to real weekday position */}
                                        <Text style={styles.dayLbl}>{DAY_LABELS[i]}</Text>
                                    </View>
                                </React.Fragment>
                            );
                        })}
                    </View>

                    {/* Streak line */}
                    <View style={styles.streakRow}>
                        <View style={styles.streakDot} />
                        <Text style={styles.streakText}>
                            <Text style={{ color: GOLD }}>
                                {user?.daysLoggedIn || 0}-day streak
                            </Text>
                            {user?.daysLoggedIn > 0 ? " — keep it up!" : " — claim today to start!"}
                        </Text>
                    </View>

                </Pressable>

                {/* HEADER */}
                <View style={styles.header}>
                    <Text style={styles.username}>{user?.username}</Text>

                    <View style={styles.headerRight}>
                        <View style={styles.statBox}>
                            <Image source={require("../images/xpicon.png")} style={styles.statIcon} />
                            <Text style={styles.xpText}>{user?.totalXp || 0} XP</Text>
                        </View>

                        <View style={styles.statBox}>
                            <Icon name="coins" size={16} color="#FFD67A" />
                            <Text style={styles.coinText}>{user?.money}</Text>
                        </View>
                    </View>
                </View>

                {/* XP LEVEL CARD */}
                <View style={styles.levelCard}>
                    <View style={styles.levelAndXp}>
                        <View>
                            <Text style={styles.levelTitle}>LEVEL {user?.level}</Text>
                        </View>
                        <View style={styles.statBoxLevel}>
                            <Image source={require("../images/xpicon.png")} style={styles.statIcon} />
                            <Text style={styles.xpText}>{user?.levelXp || 0} XP</Text>
                        </View>
                    </View>

                    <View style={styles.progressBar}>
                        <View
                            style={[
                                styles.progressFill,
                                { width: `${(user?.levelXp % 100)}%` },
                            ]}
                        />
                    </View>

                    <View style={styles.starRow}>
                        {[0, 20, 40, 60, 80, 100].map((mark, i) => (
                            <View key={i} style={styles.starWrapper}>
                                {i !== 0 && (
                                    <>
                                        <Icon
                                            name="star"
                                            size={18}
                                            color={(user?.levelXp % 100) >= mark ? "#FFD67A" : "#555"}
                                            solid={(user?.levelXp % 100) >= mark}
                                        />
                                        <Text style={styles.starText}>{mark}</Text>
                                    </>
                                )}
                            </View>
                        ))}
                    </View>
                </View>

                {/* PLAY GRID */}
                <View style={styles.playGrid}>
                    <PlayCard icon="dot-circle" label="Classic"      entryFee={20} onPress={() => launchGame("Classic")} />
                    <PlayCard icon="bolt"       label="Fast"          entryFee={15} onPress={() => launchGame("Fast")} />
                    <PlayCard icon="magic"      label="Power Bingo"  entryFee={40} onPress={() => launchGame("Power")} />
                    <PlayCard icon="lock"       label="Private Room" entryFee={0}  onPress={() => launchGame("Private")} />
                </View>

                {/* ACTIONS */}
                <View style={styles.actionsRow}>
                    <Action icon="tasks"        label="Missions" onPress={() => navigation.navigate("Missions")} />
                    <Action icon="medal"        label="Ranking"  onPress={() => navigation.navigate("Ranking")} />
                    <Action icon="user-friends" label="Friends"  onPress={() => navigation.navigate("Friends")} />
                </View>

            </ScrollView>
        </View>
    );
};

const PlayCard = ({ icon, label, entryFee, onPress }) => (
    <TouchableOpacity style={styles.playCard} onPress={onPress}>
        <View style={styles.cardTop}>
            <Icon name={icon} size={26} color="#FFD67A" />
            {entryFee > 0 && (
                <View style={styles.feeBadge}>
                    <Text style={styles.feeText}>🪙 {entryFee}</Text>
                </View>
            )}
        </View>
        <Text style={styles.playLabel}>{label}</Text>
        {entryFee > 0
            ? <Text style={styles.playHint}>Entry Fee</Text>
            : <Text style={styles.playHint}>Free Room</Text>
        }
    </TouchableOpacity>
);

const Action = ({ icon, label, onPress }) => (
    <TouchableOpacity style={styles.actionBox} onPress={onPress}>
        <Icon name={icon} size={24} color="#FFD67A" />
        <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
);

export default HomeScreen;

const CARD   = "#2A244A";
const BORDER = "#4A4370";
const GOLD   = "#FFD67A";
const TEXT   = "#FFFFFF";
const SUB    = "#A9A6C1";

const styles = StyleSheet.create({
    container: { flex: 1 },

    // ── Mystery modal ──────────────────────────────────────────────────────
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.65)",
        alignItems: "center",
        justifyContent: "center",
    },
    mysteryBox: {
        backgroundColor: CARD,
        borderRadius: 24,
        borderWidth: 1.5,
        borderColor: GOLD,
        padding: 32,
        alignItems: "center",
        width: 280,
    },
    mysteryEmoji:     { fontSize: 52, marginBottom: 8 },
    mysteryTitle:     { color: GOLD, fontSize: 22, fontWeight: "700", marginBottom: 4 },
    mysterySubtitle:  { color: SUB,  fontSize: 14, marginBottom: 6 },
    mysteryPrizeText: { color: TEXT, fontSize: 28, fontWeight: "800", marginBottom: 24 },
    mysteryBtn: {
        backgroundColor: GOLD,
        borderRadius: 22,
        paddingHorizontal: 36,
        paddingVertical: 12,
    },
    mysteryBtnText: { color: "#1E1740", fontWeight: "700", fontSize: 15 },

    // ── Reward card ────────────────────────────────────────────────────────
    rewardCard: {
        backgroundColor: CARD,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: BORDER,
        overflow: "hidden",
        marginBottom: 20,
    },
    rewardTopRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#3A3460",
    },
    rewardTag: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "rgba(255,214,122,0.12)",
        borderWidth: 0.5,
        borderColor: "rgba(255,214,122,0.35)",
        borderRadius: 20,
        paddingHorizontal: 9,
        paddingVertical: 2,
        alignSelf: "flex-start",
        marginBottom: 6,
    },
    rewardTagText: { color: "#FFD67A", fontSize: 11 },
    rewardVal:  { color: GOLD, fontSize: 20, fontWeight: "500", marginBottom: 2 },
    rewardDesc: { color: SUB,  fontSize: 12 },
    claimBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: GOLD,
        borderRadius: 22,
        paddingHorizontal: 18,
        paddingVertical: 10,
    },
    claimBtnOff:     { backgroundColor: "#3A3460" },
    claimBtnText:    { color: "#1E1740", fontSize: 13, fontWeight: "500" },
    claimBtnTextOff: { color: SUB },

    // ── Day tracker ────────────────────────────────────────────────────────
    daysTrack: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 14,
        paddingTop: 12,
        paddingBottom: 4,
    },
    dayItem:       { alignItems: "center", gap: 4 },
    dayLine:       { flex: 1, height: 2, backgroundColor: "#3A3460", marginBottom: 14 },
    dayLineDone:   { backgroundColor: GOLD },
    dayCircle: {
        width: 30, height: 30, borderRadius: 15,
        borderWidth: 1.5, borderColor: BORDER,
        backgroundColor: "#1E1740",
        alignItems: "center", justifyContent: "center",
    },
    dayCircleDone:  { backgroundColor: GOLD, borderColor: GOLD },
    dayCircleToday: { borderWidth: 2, borderColor: GOLD },
    dayNum:  { fontSize: 11, color: SUB },
    dayLbl:  { fontSize: 9,  color: "#6B6790" },
    streakRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 14,
        paddingBottom: 12,
    },
    streakDot:  { width: 6, height: 6, borderRadius: 3, backgroundColor: GOLD },
    streakText: { fontSize: 11, color: SUB },

    // ── Header ─────────────────────────────────────────────────────────────
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 20,
    },
    username: { color: TEXT, fontSize: 22, fontWeight: "bold" },
    headerRight: { flexDirection: "row", gap: 12 },
    statBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        padding: 8,
    },
    statBoxLevel: { flexDirection: "row", gap: 6, alignItems: "center", marginBottom: 10 },
    statIcon:  { width: 20, height: 20 },
    xpText:    { color: "#39D353", fontWeight: "bold" },
    coinText:  { color: GOLD,      fontWeight: "bold" },

    // ── Level card ─────────────────────────────────────────────────────────
    levelCard: {
        backgroundColor: CARD,
        borderRadius: 20,
        padding: 18,
        borderWidth: 1,
        borderColor: BORDER,
        marginBottom: 20,
    },
    levelAndXp: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    levelTitle:   { color: GOLD, fontWeight: "bold", marginBottom: 10 },
    progressBar:  { height: 10, backgroundColor: BORDER, borderRadius: 10, overflow: "hidden" },
    progressFill: { height: "100%", backgroundColor: GOLD },
    starRow:      { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
    starWrapper:  { alignItems: "center" },
    starText:     { color: SUB, fontSize: 10 },

    // ── Play grid ──────────────────────────────────────────────────────────
    playGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    playCard: {
        width: "48%",
        backgroundColor: CARD,
        borderRadius: 18,
        padding: 18,
        marginBottom: 15,
        borderWidth: 1.2,
        borderColor: BORDER,
    },
    cardTop:  { flexDirection: "row", justifyContent: "space-between" },
    feeBadge: { borderWidth: 1, borderColor: GOLD, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
    feeText:  { color: GOLD, fontSize: 12 },
    playLabel:{ marginTop: 14, color: TEXT, fontSize: 18, fontWeight: "bold" },
    playHint: { color: SUB, fontSize: 12 },

    // ── Actions ────────────────────────────────────────────────────────────
    actionsRow: { flexDirection: "row", justifyContent: "space-around", marginBottom: 30 },
    actionBox:  { alignItems: "center" },
    actionText: { color: TEXT, marginTop: 4 },
});