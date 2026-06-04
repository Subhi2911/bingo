import React, { useEffect, useRef, useState } from "react";
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    StyleSheet,
    Animated,
} from "react-native";
import Svg, { G, Path, Text as SvgText } from "react-native-svg";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BACKEND_URL } from "../config/backend";
import { useAuth } from "../context/AuthContext";

const COLORS = [
    "#FF6B6B",
    "#FFD93D",
    "#6BCB77",
    "#4D96FF",
    "#B983FF",
    "#FF9F1C",
    "#00C2A8",
];


const RADIUS = 140;
const CENTER = RADIUS;



export default function SpinWheelModal({ isOpen, onClose }) {
    const [rewards, setRewards] = useState([]);
    const [message, setMessage] = useState("");
    const spinAnim = useRef(new Animated.Value(0)).current;
    const currentRotation = useRef(0);
    const { user, setUser } = useAuth();

    useEffect(() => {
        if (isOpen) {
            fetch(`${BACKEND_URL}/api/spin/rewards`)
                .then((res) => res.json())
                .then((data) => setRewards(data));

        }
    }, [isOpen]);
    useEffect(() => {
        console.log(rewards);
    }, [rewards])

    const spinWheel = async () => {
        if (rewards.length === 0) return;

        const token = await AsyncStorage.getItem("authToken");

        const res = await fetch(`${BACKEND_URL}/api/spin/spin`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "auth-token": token,
            },
        });

        const result = await res.json();
        setUser(prev => ({
            ...prev,
            money: result.coins,
            totalXp: result.TotalXp,
        }));

        if (res.status !== 200) {
            setMessage(result.message);
            return;
        }

        console.log(result);

        const segmentAngle = 360 / rewards.length;
        const winningAngle =
            360 - (result.prizeIndex * segmentAngle + segmentAngle / 2);

        const finalRotation =
            currentRotation.current + 360 * 6 + winningAngle;

        Animated.timing(spinAnim, {
            toValue: finalRotation,
            duration: 4000,
            useNativeDriver: true,
        }).start(() => {
            currentRotation.current = finalRotation % 360;
            spinAnim.setValue(currentRotation.current);
            const wonReward = rewards[result.prizeIndex];
            setMessage(`You won ${wonReward.label} 🎉`);

        });
    };


    // const rotate = spinAnim.interpolate({
    //     inputRange: [0, 360],
    //     outputRange: ["0deg", "360deg"],
    // });


    const renderSlices = () => {
        const angle = 360 / rewards.length;

        return rewards.map((reward, i) => {
            const startAngle = angle * i;
            const endAngle = startAngle + angle;
            const midAngle = startAngle + angle / 2;

            // Arc points
            const x1 = CENTER + RADIUS * Math.cos((Math.PI * startAngle) / 180);
            const y1 = CENTER + RADIUS * Math.sin((Math.PI * startAngle) / 180);
            const x2 = CENTER + RADIUS * Math.cos((Math.PI * endAngle) / 180);
            const y2 = CENTER + RADIUS * Math.sin((Math.PI * endAngle) / 180);

            // Text position (inside slice)
            const textRadius = RADIUS * 0.6;
            const textX =
                CENTER + textRadius * Math.cos((Math.PI * midAngle) / 180);
            const textY =
                CENTER + textRadius * Math.sin((Math.PI * midAngle) / 180);

            return (
                <G key={i}>
                    <Path
                        d={`M${CENTER},${CENTER} L${x1},${y1} A${RADIUS},${RADIUS} 0 0,1 ${x2},${y2} Z`}
                        fill={COLORS[i % COLORS.length]}
                    />

                    <SvgText
                        x={textX}
                        y={textY}
                        fill="#fff"
                        fontSize="12"
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


    return (
        <Modal visible={isOpen} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.title}>Daily Spin</Text>

                    <View style={styles.wheelWrapper}>
                        <Animated.View
                            style={{
                                transform: [
                                    {
                                        rotate: spinAnim.interpolate({
                                            inputRange: [0, 360],
                                            outputRange: ["0deg", "360deg"],
                                        }),

                                    },
                                ],
                            }}
                        >

                            <Svg width={300} height={300}>
                                <G rotation="-90" origin={`${CENTER}, ${CENTER}`}>
                                    {renderSlices()}
                                </G>
                            </Svg>

                        </Animated.View>

                        <View style={styles.pointer} />
                    </View>




                    <TouchableOpacity style={styles.btn} onPress={spinWheel}>
                        <Text style={styles.btnText}>Spin Now</Text>
                    </TouchableOpacity>

                    <Text style={styles.msg}>{message}</Text>

                    <TouchableOpacity onPress={onClose}>
                        <Text style={{ marginTop: 10 }}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}
const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
    },
    modal: {
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 12,
        alignItems: "center",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 20,
    },
    btn: {
        marginTop: 20,
        backgroundColor: "#333",
        padding: 12,
        borderRadius: 8,
    },
    btnText: {
        color: "#fff",
    },
    msg: {
        marginTop: 15,
        fontSize: 16,
    },
    wheelWrapper: {
        width: 300,
        height: 300,
        justifyContent: "center",
        alignItems: "center",
    },
    pointer: {
        position: "absolute",
        top: -10,
        alignSelf: "center",
        width: 0,
        height: 0,
        borderLeftWidth: 12,
        borderRightWidth: 12,
        borderTopWidth: 22,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderTopColor: "red",
        zIndex: 10,
    },

});
