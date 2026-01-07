/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const AvatarTimer = ({ size = 55, duration = 15, onComplete }) => {
    const progress = useRef(new Animated.Value(0)).current;

    const strokeWidth = 6;
    const radius = (size + 10) / 2 - strokeWidth / 2;
    const circumference = 2 * Math.PI * radius;

    useEffect(() => {
        progress.setValue(0);

        Animated.timing(progress, {
            toValue: 1,
            duration: duration * 1000,
            useNativeDriver: false, // SVG props are JS-driven
        }).start(({ finished }) => {
            if (finished && onComplete) onComplete();
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [duration, onComplete]);

    const strokeDashoffset = progress.interpolate({
        inputRange: [0, 1],
        outputRange: [0, circumference], // 360° → 0°
    });

    const strokeColor = progress.interpolate({
        inputRange: [0, 0.6, 1],
        outputRange: ['#00ff00', '#ffa500', '#ff0000'],
    });

    return (
        <Svg
            width={size + 10}
            height={size + 10}
            style={styles.timerBorder}
        >
            {/* Background ring */}
            <Circle
                cx={(size + 10) / 2}
                cy={(size + 10) / 2}
                r={radius}
                stroke="#333"
                strokeWidth={strokeWidth}
                fill="none"
                opacity={0.3}
            />

            {/* Animated countdown ring */}
            <AnimatedCircle
                cx={(size + 10) / 2}
                cy={(size + 10) / 2}
                r={radius}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                rotation="-90"
                originX={(size + 10) / 2}
                originY={(size + 10) / 2}
            />
        </Svg>
    );
};

const styles = StyleSheet.create({
    timerBorder: {
        position: 'absolute',
    },
});

export default AvatarTimer;
