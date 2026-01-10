import React, { useEffect, useRef } from "react";
import { Animated, Text, View, StyleSheet } from "react-native";

export default function FloatingBingoGhost({ letter, trigger }) {
    const translateY = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (!trigger) return;

        translateY.setValue(0);
        opacity.setValue(1);

        Animated.parallel([
            Animated.timing(translateY, {
                toValue: -70,
                duration: 900,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 900,
                useNativeDriver: true,
            }),
        ]).start();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [trigger]);

    if (!trigger) return null;

    return (
        <Animated.View
            pointerEvents="none"
            style={[
                styles.ghost,
                {
                    transform: [{ translateY }],
                    opacity,
                },
            ]}
        >
            <View style={styles.letter}>
                <Text style={styles.text}>{letter}</Text>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    ghost: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,          // 🔑 exact overlap
        justifyContent: "center",
        alignItems: "center",
        zIndex: 5,
    },
    letter: {
        width: 50,
        height: 50,
        borderRadius: 25,
        //backgroundColor: "#FFD700",
        justifyContent: "center",
        alignItems: "center",
        //borderWidth: 2,
        //borderColor: "#000",
    },
    text: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#000",
    },
});
