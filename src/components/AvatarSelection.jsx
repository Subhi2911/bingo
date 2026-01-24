/* eslint-disable react-native/no-inline-styles */
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ImageBackground,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BACKEND_URL } from '../config/backend';
import { useNavigation } from '@react-navigation/native';

const AvatarSelection = () => {
    const avatars = ['🐵', '🐶', '🐱', '🦁', '🐯', '🦊', '🐮', '🐭', '🐴', '🐸', '🐔', '🐍'];

    const [highlightIndex, setHighlightIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(true);
    const [selectedAvatars, setSelectedAvatars] = useState([]);
    const [triesLeft, setTriesLeft] = useState(2);
    const navigation = useNavigation();

    const intervalRef = useRef(null);

    // rotating golden effect
    useEffect(() => {
        if (isAnimating) {
            intervalRef.current = setInterval(() => {
                setHighlightIndex((prev) => (prev + 1) % avatars.length);
            }, 120);
        }

        return () => clearInterval(intervalRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAnimating]);

    const stopSelection = () => {
        if (!isAnimating || triesLeft === 0) return;

        clearInterval(intervalRef.current);
        setIsAnimating(false);

        const chosen = avatars[highlightIndex];
        setSelectedAvatars((prev) => [...prev, chosen]);
        setTriesLeft((prev) => prev - 1);
    };

    const tryAgain = () => {
        if (triesLeft === 0) return;
        setIsAnimating(true);
    };

    const saveAvatar = async (avatar) => {
        try {
            const token = await AsyncStorage.getItem("authToken");

            const res = await fetch(`${BACKEND_URL}/api/auth/select`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": token,
                },
                body: JSON.stringify({ avatar }),
            });

            const data = await res.json();
            console.log(res);
            if (!data.success) {
                console.log(res);
                //alert(data.error);
                return;
            }

            //alert(`Avatar locked: ${avatar}`);

        } catch (err) {
            console.error(err);
        }
    };

    const finalizeAvatar = (avatar) => {
        //alert(`Avatar Selected: ${avatar}`);
        saveAvatar(avatar);
        navigation.navigate("Dashboard");
    };

    return (
        <ImageBackground
            source={require('../images/RegisterPage.png')}
            style={{ flex: 1 }}
        >
            <SafeAreaView style={{ flex: 1 }}>

                <Text style={styles.title}>Choose Your Avatar</Text>

                <View style={styles.grid}>
                    {avatars.map((avatar, index) => {
                        const isHighlighted = isAnimating && index === highlightIndex;
                        const isSelected = selectedAvatars.includes(avatar);

                        return (
                            <View
                                key={index}
                                style={[
                                    styles.avatarContainer,
                                    isHighlighted && styles.golden,
                                    selectedAvatars.length > 0 && !isSelected && styles.dull,
                                ]}
                            >
                                <Text style={{ fontSize: 48 }}>{avatar}</Text>
                            </View>
                        );
                    })}
                </View>

                {/* ACTION BUTTONS */}
                <View style={styles.actions}>
                    {isAnimating && (
                        <TouchableOpacity style={styles.btn} onPress={stopSelection}>
                            <Text style={styles.btnText}>STOP</Text>
                        </TouchableOpacity>
                    )}

                    {!isAnimating && triesLeft > 0 && selectedAvatars.length === 1 && (
                        <TouchableOpacity style={styles.btn} onPress={tryAgain}>
                            <Text style={styles.btnText}>TRY AGAIN ({triesLeft})</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* FINAL CHOICE */}
                {selectedAvatars.length === 2 && (
                    <View style={styles.finalChoice}>
                        <Text style={styles.finalText}>Choose One</Text>
                        <View style={{ flexDirection: 'row' }}>
                            {selectedAvatars.map((av, i) => (
                                <TouchableOpacity
                                    key={i}
                                    style={[styles.avatarContainer, styles.golden]}
                                    onPress={() => finalizeAvatar(av)}
                                >
                                    <Text style={{ fontSize: 52 }}>{av}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

            </SafeAreaView>
        </ImageBackground>
    );
};

export default AvatarSelection;

const styles = StyleSheet.create({
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        alignSelf: 'center',
        marginTop: 20,
        color: '#FFD700',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: 80,
    },
    avatarContainer: {
        margin: 10,
        padding: 18,
        borderRadius: 50,
        backgroundColor: 'rgba(236, 187, 236, 0.56)',
    },
    golden: {
        backgroundColor: '#FFD700',
        transform: [{ scale: 1.1 }],
    },
    dull: {
        opacity: 0.3,
    },
    actions: {
        alignItems: 'center',
        marginTop: 30,
    },
    btn: {
        backgroundColor: '#eb88de',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
    },
    btnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    finalChoice: {
        alignItems: 'center',
        marginTop: 30,
    },
    finalText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
});
