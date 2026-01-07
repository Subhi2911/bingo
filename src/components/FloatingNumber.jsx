/* eslint-disable react-native/no-inline-styles */
import { Animated } from 'react-native';
import React, { useEffect, useRef } from 'react';

const FloatingNumber = ({ number }) => {
    const anim = useRef(new Animated.Value(0)).current;
    const xOffset = useRef(Math.random() * 40 - 20).current;

    useEffect(() => {
        Animated.timing(anim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
        }).start();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Animated.Text
            style={{
                position: 'absolute',
                fontSize: 32,
                fontWeight: 'bold',
                color: '#FFD700',
                opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0] }),
                transform: [
                    { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [0, -50] }) },
                    { translateX: xOffset },
                    { scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.5] }) }
                ]
            }}
        >
            {number}
        </Animated.Text>
    );
};

export default FloatingNumber;
