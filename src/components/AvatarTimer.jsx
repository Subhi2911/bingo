/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';

const AvatarTimer = ({ size = 70, duration = 15, onComplete }) => {
    const anim = useRef(new Animated.Value(0)).current;

    const scale = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.8],
    });


    useEffect(() => {
        anim.setValue(0);
        Animated.timing(anim, {
            toValue: 1,
            duration: duration * 1000,
            useNativeDriver: false,
        }).start(() => {
            if (onComplete) onComplete();
        });
    }, [anim, duration, onComplete]);

    const borderWidth = anim.interpolate({
        inputRange: [0, 1],
        outputRange: [4, 0], // border shrinks from 4px to 0
    });

    const borderColor = anim.interpolate({
        inputRange: [0, 0.7, 1],
        outputRange: ['#0f0', '#ffa500', '#ff0000'], // green → orange → red
    });

    return (
        <Animated.View
            style={[
                styles.timerBorder,
                {
                    width: size + 8,
                    height: size + 8,
                    borderRadius: (size + 8) / 2,
                    borderWidth: 4,
                    borderColor: borderColor,
                    transform: [{ scale }],
                },
            ]}
        />
    );
};

const styles = StyleSheet.create({
    timerBorder: {
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default AvatarTimer;
