/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Easing,
} from "react-native";
import Svg, { G, Path, Text as SvgText, Circle, Defs, RadialGradient, Stop } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRewardedAd } from "react-native-google-mobile-ads";
import { BACKEND_URL } from "../config/backend";
import { AD_UNIT_IDS } from "../config/ads";
import { useAuth } from "../context/AuthContext";

// ─── Theme (matches Profile / Settings screens) ───────────────────────────────
const T = {
    BG: "#7DC20A",
    CARD: "#4A7C00",
    BORDER: "#5A9400",
    GOLD: "#F8B55F",
    GOLD_DIM: "#FDE68A",
    WHITE: "#FFFFFF",
    SUB: "#D9F99D",
    DARK: "#1A3D00",
    DISABLED: "#3D6B0088",
    DISABLED_TEXT: "#7AAA3388",
    DANGER: "#F87171",
    OVERLAY: "rgba(0,0,0,0.72)",
};

// Vivid wheel slice colours — kept bright so they pop against the dark modal
const SLICE_COLORS = [
    "#FF6B6B", // coral red
    "#FFD93D", // sunny yellow
    "#6BCB77", // fresh green
    "#4D96FF", // sky blue
    "#FF9F1C", // amber
    "#B983FF", // soft violet
    "#00C2A8", // teal
];

const RADIUS = 130;
const CENTER = RADIUS;

export default function SpinWheelModal({ isOpen, onClose }) {
    const [rewards, setRewards] = useState([]);
    const [message, setMessage] = useState("");
    const [spinning, setSpinning] = useState(false);
    const [canSpin, setCanSpin] = useState(true);   // disabled when cooldown active
    const [cooldownMsg, setCooldownMsg] = useState("");

    const spinAnim = useRef(new Animated.Value(0)).current;
    const currentRotation = useRef(0);
    const glowAnim = useRef(new Animated.Value(0)).current;
    const { user, setUser } = useAuth();

    // ── Rewarded ad: free spin when on cooldown ───────────────────────────────
    const { isLoaded: spinAdLoaded, isEarnedReward, load: loadSpinAd, show: showSpinAd } = useRewardedAd(
        AD_UNIT_IDS.rewardedSpin,
        { requestNonPersonalizedAdsOnly: false }
    );

    useEffect(() => { loadSpinAd(); }, [loadSpinAd]);

    useEffect(() => {
        if (isEarnedReward) grantExtraSpin();
    }, [isEarnedReward]);

    const grantExtraSpin = async () => {
        try {
            const token = await AsyncStorage.getItem("authToken");
            const res = await fetch(`${BACKEND_URL}/api/rewards/grant-extra`, {
                method: "POST",
                headers: { "auth-token": token },
            });
            if (res.ok) {
                await checkCooldown(); // re-pull status so canSpin reflects the new extraSpins count
            }
        } catch (e) {
            console.log(e);
        } finally {
            loadSpinAd();
        }
    };

    // ── Pulse glow on the outer ring while idle ───────────────────────────────
    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(glowAnim, { toValue: 1, duration: 1200, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
                Animated.timing(glowAnim, { toValue: 0, duration: 1200, useNativeDriver: true, easing: Easing.inOut(Easing.ease) }),
            ])
        );
        loop.start();
        return () => loop.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Fetch rewards & check cooldown on open ────────────────────────────────
    useEffect(() => {
        if (!isOpen) return;
        setMessage("");

        fetch(`${BACKEND_URL}/api/spin/rewards`)
            .then((res) => res.json())
            .then((data) => setRewards(data));

        checkCooldown();
    }, [isOpen]);

    const checkCooldown = async () => {
        try {
            const token = await AsyncStorage.getItem("authToken");
            const res = await fetch(`${BACKEND_URL}/api/spin/status`, {
                headers: { "auth-token": token },
            });
            if (res.ok) {
                const data = await res.json();
                if (data.canSpin === false) {
                    setCanSpin(false);
                    setCooldownMsg(data.message || "Come back tomorrow for your next spin!");
                } else {
                    setCanSpin(true);
                    setCooldownMsg("");
                }
            }
        } catch {
            // If endpoint doesn't exist yet, default to allowing spin
            setCanSpin(true);
        }
    };

    // ── Core spin logic (preserved from original) ─────────────────────────────
    const spinWheel = async () => {
        if (rewards.length === 0 || spinning || !canSpin) return;

        setSpinning(true);
        setMessage("");

        const token = await AsyncStorage.getItem("authToken");

        const res = await fetch(`${BACKEND_URL}/api/spin/spin`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "auth-token": token,
            },
        });

        const result = await res.json();

        if (res.status !== 200) {
            setMessage(result.message || "You've already spun today!");
            setCanSpin(false);
            setCooldownMsg(result.message || "Come back tomorrow!");
            setSpinning(false);
            return;
        }

        setUser((prev) => ({
            ...prev,
            money: result.coins,
            totalXp: result.TotalXp,
        }));

        const segmentAngle = 360 / rewards.length;
        const winningAngle = 360 - (result.prizeIndex * segmentAngle + segmentAngle / 2);
        const finalRotation = currentRotation.current + 360 * 7 + winningAngle;

        Animated.timing(spinAnim, {
            toValue: finalRotation,
            duration: 4500,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start(() => {
            currentRotation.current = finalRotation % 360;
            spinAnim.setValue(currentRotation.current);
            const wonReward = rewards[result.prizeIndex];
            setMessage(`🎉 You won ${wonReward.label}!`);
            setSpinning(false);
            checkCooldown(); // refresh from server instead of assuming cooldown state
        });
    };

    // ── Render wheel slices (preserved from original) ─────────────────────────
    const renderSlices = () => {
        const angle = 360 / rewards.length;

        return rewards.map((reward, i) => {
            const startAngle = angle * i;
            const endAngle = startAngle + angle;
            const midAngle = startAngle + angle / 2;

            const x1 = CENTER + RADIUS * Math.cos((Math.PI * startAngle) / 180);
            const y1 = CENTER + RADIUS * Math.sin((Math.PI * startAngle) / 180);
            const x2 = CENTER + RADIUS * Math.cos((Math.PI * endAngle) / 180);
            const y2 = CENTER + RADIUS * Math.sin((Math.PI * endAngle) / 180);

            const textRadius = RADIUS * 0.62;
            const textX = CENTER + textRadius * Math.cos((Math.PI * midAngle) / 180);
            const textY = CENTER + textRadius * Math.sin((Math.PI * midAngle) / 180);

            return (
                <G key={i}>
                    <Path
                        d={`M${CENTER},${CENTER} L${x1},${y1} A${RADIUS},${RADIUS} 0 0,1 ${x2},${y2} Z`}
                        fill={SLICE_COLORS[i % SLICE_COLORS.length]}
                        stroke="#00000022"
                        strokeWidth={1}
                    />
                    <SvgText
                        x={textX}
                        y={textY}
                        fill="#fff"
                        fontSize="11"
                        fontWeight="bold"
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        transform={`rotate(${midAngle}, ${textX}, ${textY})`}
                    >
                        {reward.label}
                    </SvgText>
                </G>
            );
        });
    };

    const ringOpacity = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.5, 1],
    });

    const ringScale = glowAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.04],
    });

    const isDisabled = spinning || !canSpin || rewards.length === 0;

    return (
        <Modal visible={isOpen} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.modal}>

                    {/* ── Header ── */}
                    <View style={styles.header}>
                        <Text style={styles.title}>🎡 Daily Spin</Text>
                        <Text style={styles.subtitle}>One free spin every 24 hours</Text>
                    </View>

                    {/* ── Wheel ── */}
                    <View style={styles.wheelArea}>

                        {/* Pulsing gold outer ring */}
                        <Animated.View
                            style={[
                                styles.glowRing,
                                { opacity: ringOpacity, transform: [{ scale: ringScale }] },
                            ]}
                        />

                        {/* Pointer arrow */}
                        <View style={styles.pointer} />

                        {/* Spinning wheel */}
                        <Animated.View
                            style={{
                                transform: [{
                                    rotate: spinAnim.interpolate({
                                        inputRange: [0, 360],
                                        outputRange: ["0deg", "360deg"],
                                    }),
                                }],
                            }}
                        >
                            <Svg width={RADIUS * 2} height={RADIUS * 2}>
                                {/* Dark border ring around wheel */}
                                <Circle
                                    cx={CENTER}
                                    cy={CENTER}
                                    r={RADIUS - 1}
                                    fill="none"
                                    stroke="#1A3D00"
                                    strokeWidth={3}
                                />
                                <G rotation="-90" origin={`${CENTER}, ${CENTER}`}>
                                    {renderSlices()}
                                </G>
                                {/* Centre hub */}
                                <Circle cx={CENTER} cy={CENTER} r={16} fill={T.DARK} />
                                <Circle cx={CENTER} cy={CENTER} r={10} fill={T.GOLD} />
                            </Svg>
                        </Animated.View>
                    </View>

                    {/* ── Win message ── */}
                    {message ? (
                        <View style={styles.messageBubble}>
                            <Text style={styles.messageText}>{message}</Text>
                        </View>
                    ) : null}

                    {/* ── Cooldown notice + watch ad option ── */}
                    {!canSpin && !spinning && cooldownMsg ? (
                        <>
                            <View style={styles.cooldownBadge}>
                                <Text style={styles.cooldownIcon}>⏳</Text>
                                <Text style={styles.cooldownText}>{cooldownMsg}</Text>
                            </View>

                            <TouchableOpacity
                                style={[styles.adBtn, !spinAdLoaded && styles.btnDisabled]}
                                onPress={() => spinAdLoaded && showSpinAd()}
                                disabled={!spinAdLoaded}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.adBtnText, !spinAdLoaded && styles.btnTextDisabled]}>
                                    {spinAdLoaded ? "🎬 Watch Ad for Free Spin" : "Loading ad..."}
                                </Text>
                            </TouchableOpacity>
                        </>
                    ) : null}

                    {/* ── Spin button ── */}
                    <TouchableOpacity
                        style={[styles.btn, isDisabled && styles.btnDisabled]}
                        onPress={spinWheel}
                        disabled={isDisabled}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.btnText, isDisabled && styles.btnTextDisabled]}>
                            {spinning ? "Spinning…" : canSpin ? "Spin Now" : "Already spun today"}
                        </Text>
                    </TouchableOpacity>

                    {/* ── Close ── */}
                    <TouchableOpacity onPress={onClose} style={styles.closeBtn} disabled={spinning}>
                        <Text style={[styles.closeText, spinning && { opacity: 0.4 }]}>✕ Close</Text>
                    </TouchableOpacity>

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: T.OVERLAY,
        justifyContent: "center",
        alignItems: "center",
    },

    modal: {
        backgroundColor: T.CARD,
        borderWidth: 2,
        borderColor: T.BORDER,
        borderRadius: 28,
        alignItems: "center",
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 28,
        width: 340,
        shadowColor: "#000",
        shadowOpacity: 0.5,
        shadowRadius: 24,
        shadowOffset: { width: 0, height: 8 },
        elevation: 20,
    },

    header: {
        alignItems: "center",
        marginBottom: 20,
        gap: 4,
    },
    title: {
        color: T.GOLD,
        fontSize: 22,
        fontWeight: "800",
        letterSpacing: 0.5,
    },
    subtitle: {
        color: T.SUB,
        fontSize: 12,
        opacity: 0.8,
    },

    wheelArea: {
        width: RADIUS * 2 + 24,
        height: RADIUS * 2 + 24,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20,
    },
    glowRing: {
        position: "absolute",
        width: RADIUS * 2 + 20,
        height: RADIUS * 2 + 20,
        borderRadius: RADIUS + 10,
        borderWidth: 3,
        borderColor: T.GOLD,
    },
    pointer: {
        position: "absolute",
        top: 0,
        zIndex: 10,
        width: 0,
        height: 0,
        borderLeftWidth: 13,
        borderRightWidth: 13,
        borderTopWidth: 24,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderTopColor: T.GOLD,
        shadowColor: T.GOLD,
        shadowOpacity: 0.8,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
    },

    messageBubble: {
        backgroundColor: T.DARK,
        borderWidth: 1,
        borderColor: T.GOLD,
        borderRadius: 14,
        paddingHorizontal: 18,
        paddingVertical: 10,
        marginBottom: 14,
    },
    messageText: {
        color: T.GOLD,
        fontSize: 15,
        fontWeight: "700",
        textAlign: "center",
    },

    cooldownBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#2D5A0066",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 7,
        marginBottom: 10,
    },
    cooldownIcon: {
        fontSize: 14,
    },
    cooldownText: {
        color: T.SUB,
        fontSize: 12,
    },

    adBtn: {
        backgroundColor: "transparent",
        borderWidth: 2,
        borderColor: T.GOLD,
        paddingVertical: 10,
        paddingHorizontal: 28,
        borderRadius: 14,
        marginBottom: 14,
    },
    adBtnText: {
        color: T.GOLD,
        fontSize: 13,
        fontWeight: "700",
    },

    btn: {
        backgroundColor: T.GOLD,
        paddingVertical: 14,
        paddingHorizontal: 48,
        borderRadius: 16,
        marginBottom: 14,
        shadowColor: T.GOLD,
        shadowOpacity: 0.4,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 4 },
        elevation: 6,
    },
    btnDisabled: {
        backgroundColor: "#2D5A0055",
        shadowOpacity: 0,
        elevation: 0,
    },
    btnText: {
        color: T.DARK,
        fontSize: 16,
        fontWeight: "800",
        letterSpacing: 0.4,
    },
    btnTextDisabled: {
        color: "#7AAA3399",
    },

    closeBtn: {
        paddingVertical: 6,
        paddingHorizontal: 16,
    },
    closeText: {
        color: T.SUB,
        fontSize: 13,
        opacity: 0.7,
    },
});