import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const CircularTimer = ({ size = 60, strokeWidth = 4, duration = 15, onComplete }) => {
    const animatedValue = useRef(new Animated.Value(0)).current;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    useEffect(() => {
        Animated.timing(animatedValue, {
            toValue: 1,
            duration: duration * 1000,
            useNativeDriver: true
        }).start(() => {
            onComplete && onComplete();
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const strokeDashoffset = animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [0, circumference],
    });

    return (
        <View style={{ width: size, height: size }}>
            <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
                <Circle
                    stroke="#555"
                    fill="none"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    opacity={0.2}
                />
                <Animated.Circle
                    stroke="#0f0"
                    fill="none"
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                />
            </Svg>
        </View>
    );
};

export default CircularTimer;
