/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useRef } from "react";
import { Animated, Text, Dimensions } from "react-native";

const { width: screenWidth } = Dimensions.get("window");

const FloatingMessage = ({ text, top = 150, duration = 6000, onFinish }) => {
    const translateX = useRef(new Animated.Value(-300)).current;

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: screenWidth,
            duration,
            useNativeDriver: true,
        }).start(() => {
            if (onFinish) onFinish();
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Animated.View
            style={{
                position: "absolute",
                top,
                transform: [{ translateX }],
                backgroundColor: "rgba(0,0,0,0.7)",
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
            }}
        >
            <Text
                style={{
                    color: "#fff",
                    fontWeight: "bold",
                    fontSize: 14,
                }}
            >
                {text}
            </Text>
        </Animated.View>
    );
};

export default FloatingMessage;
