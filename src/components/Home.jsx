/* eslint-disable react-native/no-inline-styles */
import { StyleSheet, Text, View, Pressable, ImageBackground, StatusBar } from 'react-native'
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Signup from './Signup';
import Login from './Login';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Intro from './Intro';

const Home = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = React.useState(true);
    const [loggedIn, setLoggedIn] = React.useState(false);
    const [view, setView] = React.useState(1);

    React.useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem("authToken");
            if (token) {
                setLoggedIn(true);
                navigation.navigate("Dashboard");
            } else {
                setLoggedIn(false);
            }
        };
        checkAuth();
    }, [navigation]);

    React.useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={{ flex: 1 }}>
            <StatusBar barStyle="light-content" backgroundColor="#4A2070" />
            {loading && <Intro />}

            {!loading && !loggedIn && (
                <ImageBackground
                    source={require('../images/RegisterPage.png')}
                    style={styles.bg}
                    imageStyle={{ opacity: 0.18 }}
                >
                    {/* Decorative orbs */}
                    <View style={styles.orbTopRight} />
                    <View style={styles.orbBottomLeft} />

                    <SafeAreaView style={styles.safeArea}>
                        {/* Brand header */}
                        <View style={styles.brandHeader}>
                            <View style={styles.logoBox}>
                                <Text style={styles.logoEmoji}>🎱</Text>
                            </View>
                            <Text style={styles.tagline}>Let's get you started</Text>
                            <Text style={styles.brandTitle}>Welcome to Bingo!</Text>
                        </View>

                        {/* Tab switcher */}
                        <View style={styles.tabPill}>
                            <Pressable
                                style={[styles.tabItem, view === 1 && styles.tabItemActive]}
                                onPress={() => setView(1)}
                            >
                                <Text style={[styles.tabText, view === 1 && styles.tabTextActive]}>Register</Text>
                            </Pressable>
                            <Pressable
                                style={[styles.tabItem, view === 2 && styles.tabItemActive]}
                                onPress={() => setView(2)}
                            >
                                <Text style={[styles.tabText, view === 2 && styles.tabTextActive]}>Log in</Text>
                            </Pressable>
                        </View>

                        {/* Form card */}
                        <View style={styles.formCard}>
                            {view === 1 ? <Signup /> : <Login />}
                        </View>

                        <Text style={styles.footerNote}>
                            By continuing you agree to our Terms of Service
                        </Text>
                    </SafeAreaView>
                </ImageBackground>
            )}

            {loggedIn && (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#000' }}>You are logged in!</Text>
                </View>
            )}
        </View>
    );
};

export default Home;

const styles = StyleSheet.create({
    bg: {
        flex: 1,
        backgroundColor: '#5B2D8E',
    },
    orbTopRight: {
        position: 'absolute',
        top: -70,
        right: -70,
        width: 240,
        height: 240,
        borderRadius: 120,
        backgroundColor: 'rgba(248,181,95,0.08)',
    },
    orbBottomLeft: {
        position: 'absolute',
        bottom: 80,
        left: -90,
        width: 260,
        height: 260,
        borderRadius: 130,
        backgroundColor: 'rgba(255,255,255,0.04)',
    },
    safeArea: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 12,
        paddingBottom: 24,
    },
    brandHeader: {
        alignItems: 'center',
        marginBottom: 28,
        marginTop: 8,
    },
    logoBox: {
        width: 60,
        height: 60,
        borderRadius: 20,
        backgroundColor: 'rgba(248,181,95,0.18)',
        borderWidth: 1,
        borderColor: 'rgba(248,181,95,0.3)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    logoEmoji: {
        fontSize: 30,
    },
    tagline: {
        fontSize: 13,
        color: 'rgba(255,255,255,0.45)',
        letterSpacing: 0.3,
        marginBottom: 4,
    },
    brandTitle: {
        fontSize: 24,
        fontWeight: '700',
        color: '#F8B55F',
        letterSpacing: -0.3,
    },
    tabPill: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 14,
        padding: 4,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    tabItem: {
        flex: 1,
        paddingVertical: 11,
        borderRadius: 10,
        alignItems: 'center',
    },
    tabItemActive: {
        backgroundColor: '#F8B55F',
        shadowColor: '#F8B55F',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 5,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255,255,255,0.45)',
    },
    tabTextActive: {
        color: '#fff',
    },
    formCard: {
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        padding: 20,
        flex: 1,
    },
    footerNote: {
        textAlign: 'center',
        color: 'rgba(255,255,255,0.25)',
        fontSize: 11,
        marginTop: 16,
        letterSpacing: 0.2,
    },
});