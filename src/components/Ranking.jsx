import {
    ActivityIndicator,
    FlatList,
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import React from 'react';
import Icon from "react-native-vector-icons/FontAwesome5";
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../config/backend';

const Ranking = () => {

    const [selectedMode, setSelectedMode] = React.useState("world");
    const [leaderboard, setLeaderboard] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const navigation = useNavigation();
    const avatars = {
        '🐵': 'Mischief Maverick',
        '🐶': 'Loyal Legend',
        '🐱': 'Shadow Prowler',
        '🦁': 'Golden King',
        '🐯': 'Stripe Fury',
        '🦊': 'Crimson Trickster',
        '🐮': 'Iron Grazer',
        '🐭': 'Swift Whisper',
        '🐴': 'Storm Charger',
        '🐸': 'Neon Hopper',
        '🐔': 'Dawn Striker',
        '🐍': 'Venom Viper',
    };

    const fetchLeaderboard = async (mode) => {
        setLoading(true);
        try {
            const endpoint =
                mode === "friends"
                    ? `${BACKEND_URL}/api/games/rank/friends`
                    : `${BACKEND_URL}/api/games/ranking`;


            const token = await AsyncStorage.getItem("authToken");

            const res = await fetch(endpoint, {
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": token,
                },
            });
            const data = await res.json();
            setLeaderboard(data);
        } catch (err) {
            console.log(err);
            setLeaderboard({ avatars: [] });
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchLeaderboard(selectedMode);
    }, [selectedMode]);

    const renderAvatarCard = ({ item, index }) => {
        const isTop = index === 0;

        return (
            <View style={[styles.card, isTop && styles.topCard]}>

                {/* Header Row */}
                <View style={styles.cardHeader}>
                    <View style={styles.avatarRow}>
                        <Text style={styles.emoji}>{item.avatar}</Text>
                        <View>
                            <Text style={styles.avatarTitle}>
                                {isTop ? "Avatar of the Week" : `${avatars[item.avatar] || "Unknown Avatar"}`}
                            </Text>
                            {isTop && <Text style={styles.avatarTitle}>
                                {avatars[item.avatar]}
                            </Text>}
                            <Text style={styles.totalXp}>
                                {item.totalXp} XP
                            </Text>
                        </View>
                    </View>

                    {isTop && <Text style={styles.crown}>👑</Text>}
                </View>

                {/* Users */}
                {item.users.slice(0, 4).map((user, i) => (
                    <View key={i} style={styles.userRow}>
                        <Text style={[
                            styles.rank,
                            i === 0 && styles.gold,
                            i === 1 && styles.silver,
                            i === 2 && styles.bronze
                        ]}>
                            #{user.rank}
                        </Text>

                        <Text style={styles.name} numberOfLines={1}>
                            {user.name}
                        </Text>

                        <Text style={styles.xp}>
                            {user.xp} XP
                        </Text>
                    </View>
                ))}

            </View>
        );
    };

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('../images/FriendsPage.png')}
                style={{ flex: 1 }}
                resizeMode="cover"
            >

                {/* Header */}
                <View style={styles.header}>
                    <Icon
                        name="arrow-left"
                        size={22}
                        color="#000000"
                        onPress={() => navigation.goBack()}
                    />
                    <Text style={styles.title}>Ranking</Text>
                </View>

                {/* Mode Selector */}
                <View style={styles.modeContainer}>
                    {['world', 'friends'].map(mode => (
                        <TouchableOpacity
                            key={mode}
                            style={[
                                styles.modeBtn,
                                selectedMode === mode && styles.activeMode
                            ]}
                            onPress={() => setSelectedMode(mode)}
                        >
                            <Text style={styles.modeText}>
                                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Leaderboard */}
                {loading && (
                    <View style={styles.centerState}>
                        <ActivityIndicator size="large" color="#ffd900" />
                    </View>
                )}

                {!loading && leaderboard && leaderboard.avatars?.length === 0 && (
                    <View style={styles.centerState}>
                        <Text style={styles.emptyText}>
                            {selectedMode === "friends"
                                ? "No friends yet — add some to see rankings here!"
                                : "No rankings to show yet."}
                        </Text>
                    </View>
                )}

                {!loading && leaderboard && leaderboard.avatars?.length > 0 && (
                    <FlatList
                        data={leaderboard.avatars}
                        keyExtractor={(item) => item.avatar}
                        renderItem={renderAvatarCard}
                        contentContainerStyle={{ paddingBottom: 30 }}
                        showsVerticalScrollIndicator={false}
                    />
                )}

            </ImageBackground>
        </View>
    );
};

export default Ranking;
const styles = StyleSheet.create({

    container: {
        flex: 1,
    },

    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 20,
        marginTop: 60,
    },

    title: {
        fontSize: 20,
        fontWeight: "bold",
        marginLeft: 15,
        color: "#000000",
    },

    modeContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginVertical: 15,
    },

    modeBtn: {
        backgroundColor: "rgba(255,255,255,0.15)",
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 20,
        marginHorizontal: 6,
    },

    activeMode: {
        backgroundColor: "#ffd900",
    },

    modeText: {
        color: "#000000",
        fontWeight: "600",
    },

    centerState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 30,
    },

    emptyText: {
        color: "#000000",
        fontSize: 14,
        textAlign: "center",
        fontWeight: "500",
    },

    /* ---------- CARD ---------- */

    card: {
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        marginHorizontal: 16,
        marginVertical: 8,
        padding: 14,
        borderRadius: 18,
    },

    topCard: {
        borderWidth: 1.5,
        borderColor: "#FFD700",
        backgroundColor: "rgba(248, 254, 189, 0.92)"
    },

    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },

    avatarRow: {
        flexDirection: "row",
        alignItems: "center",
    },

    emoji: {
        fontSize: 34,
        marginRight: 10,
    },

    avatarTitle: {
        color: "#000000",
        fontWeight: "600",
        fontSize: 14,
    },

    totalXp: {
        color: "#30c30c",
        fontSize: 12,
        marginTop: 2,
    },

    crown: {
        fontSize: 18,
    },

    /* ---------- USER ROW ---------- */

    userRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 6,
    },

    rank: {
        width: 40,
        fontWeight: "bold",
        fontSize: 13,
        color: "#000000",
    },

    name: {
        flex: 1,
        color: "#000000",
        fontSize: 13,
    },

    xp: {
        color: "#30c30c",
        fontSize: 13,
        fontWeight: "600",
    },

    gold: { color: "#ffa200" },
    silver: { color: "#909090" },
    bronze: { color: "#bd650e" },

});