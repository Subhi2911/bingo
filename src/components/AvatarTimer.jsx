import React, { useEffect, useRef, useMemo, useCallback } from 'react';
import { Animated, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

// ✅ Declared ONCE at module level — never recreated on re-renders
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const AvatarTimer = ({ size = 55, duration = 15, onComplete, gameEnded = false }) => {
    const progress = useRef(new Animated.Value(0)).current;
    const animRef = useRef(null);

    const strokeWidth = 6;
    const cx = (size + 10) / 2;
    const radius = cx - strokeWidth / 2;

    // ✅ Stable derived values — recomputed only when size changes
    const circumference = useMemo(() => 2 * Math.PI * radius, [radius]);

    // ✅ Stable string — prevents react-native-svg from remounting the native node
    const strokeDashArray = useMemo(
        () => `${circumference} ${circumference}`,
        [circumference]
    );

    // ✅ Interpolations anchored to stable refs so the JS→node tracking chain
    //    is never broken across re-renders
    const strokeDashoffset = useMemo(
        () =>
            progress.interpolate({
                inputRange: [0, 1],
                // Countdown: starts full (0 offset) → shrinks to nothing (full offset)
                outputRange: [0, circumference],
            }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [circumference]
    );

    const strokeColor = useRef(
        progress.interpolate({
            inputRange: [0, 0.6, 1],
            outputRange: ['#00ff00', '#ffa500', '#ff0000'],
        })
    ).current;

    // ✅ Stop the animation immediately when the game ends
    useEffect(() => {
        if (gameEnded && animRef.current) {
            animRef.current.stop();
            animRef.current = null;
        }
    }, [gameEnded]);

    useEffect(() => {
        if (gameEnded) return; // Don't start if game is already over

        // Reset to 0 before starting
        progress.setValue(0);

        const anim = Animated.timing(progress, {
            toValue: 1,
            duration: duration * 1000,
            useNativeDriver: false, // SVG props are JS-driven; native driver can't handle them
        });

        animRef.current = anim;

        anim.start();

        return () => {
            // Stop any running animation when the effect re-runs or the component unmounts
            anim.stop();
            animRef.current = null;
        };
        // ✅ onComplete is intentionally excluded — wrap it in useCallback in the parent
        //    (see GameScreen) to prevent restarting the animation on every render.
        //    duration is the only real dependency here.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [duration]);

    return (
        <Svg width={size + 10} height={size + 10} style={styles.timerBorder}>
            {/* Static background ring */}
            <Circle
                cx={cx}
                cy={cx}
                r={radius}
                stroke="#333"
                strokeWidth={strokeWidth}
                fill="none"
                opacity={0.3}
            />

            {/* Animated countdown ring — shrinks clockwise as time runs out */}
            <AnimatedCircle
                cx={cx}
                cy={cx}
                r={radius}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={strokeDashArray}   // ✅ stable string ref
                strokeDashoffset={strokeDashoffset} // ✅ stable interpolation ref
                strokeLinecap="round"
                rotation="-90"
                originX={cx}
                originY={cx}
            />
        </Svg>
    );
};

const styles = StyleSheet.create({
    timerBorder: {
        position: 'absolute',
    },
});

export default React.memo(AvatarTimer);