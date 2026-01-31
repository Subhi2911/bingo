/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, Animated } from 'react-native';

const XPModal = ({
    visible,
    earnedXP,
    oldXP,
    newXP,
    xpNeeded,
    leveledUp,     // 👈 important flag from backend
    onFinish,
}) => {
    const progressAnim = useRef(new Animated.Value(oldXP)).current;

    useEffect(() => {
        if (!visible) return;

        // Reset animated value to correct start XP
        progressAnim.setValue(oldXP);

        if (leveledUp) {
            Animated.timing(progressAnim, {
                toValue: xpNeeded,
                duration: 900,
                useNativeDriver: false,
            }).start(() => {
                progressAnim.setValue(0);

                Animated.timing(progressAnim, {
                    toValue: newXP,
                    duration: 900,
                    useNativeDriver: false,
                }).start(() => {
                    setTimeout(onFinish, 700);
                });
            });
        } else {
            Animated.timing(progressAnim, {
                toValue: newXP,
                duration: 1600,
                useNativeDriver: false,
            }).start(() => {
                setTimeout(onFinish, 700);
            });
        }
    }, [visible]);


    const widthInterpolate = progressAnim.interpolate({
        inputRange: [0, xpNeeded],
        outputRange: ['0%', '100%'],
    });

    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    <Text style={styles.title}>+{earnedXP} XP</Text>

                    <View style={styles.barBg}>
                        <Animated.View
                            style={[styles.barFill, { width: widthInterpolate }]}
                        />
                    </View>

                    <Text style={styles.xpText}>
                        {newXP} / {xpNeeded}
                    </Text>

                    {leveledUp && (
                        <Text style={styles.levelText}>🎉 LEVEL UP!</Text>
                    )}
                </View>
            </View>
        </Modal>
    );
};

export default XPModal;

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        width: '85%',
        backgroundColor: '#1c1c1c',
        padding: 25,
        borderRadius: 20,
        alignItems: 'center',
    },
    title: {
        fontSize: 26,
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 15,
    },
    barBg: {
        width: '100%',
        height: 20,
        backgroundColor: '#333',
        borderRadius: 10,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        backgroundColor: '#5459AC',
    },
    xpText: {
        marginTop: 10,
        color: '#fff',
    },
    levelText: {
        marginTop: 15,
        fontSize: 18,
        color: '#FFD700',
        fontWeight: 'bold',
    },
});
