/* eslint-disable react-native/no-inline-styles */
import { FlatList, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect } from 'react'
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { BACKEND_URL } from '../config/backend';

const LeaderBoard = () => {
    const [selectedMode, setSelectedMode] = React.useState("world");
    const navigation = useNavigation();
    const [topUsers, setTopUsers] = React.useState(null);
    const [userRank, setUserRank] = React.useState(null);
    const [currentUser, setCurrentUser] = React.useState(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const token = await AsyncStorage.getItem('authToken');

                const res = await fetch(`${BACKEND_URL}/api/games/leaderboard`, {
                    headers: {
                        'auth-token': token,
                    },
                });

                const data = await res.json();

                setTopUsers(data.topUsers);
                setUserRank(data.userRank);
                setCurrentUser(data.currentUser);

            } catch (err) {
                console.log(err);
            }
        };
        console.log(topUsers);
        fetchLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
    const dummyData = [
        { "id": 1, "name": "Aarav", "level": 12, "xp": 11523 },
        { "id": 2, "name": "Priya", "level": 7, "xp": 6734 },
        { "id": 3, "name": "Rahul", "level": 20, "xp": 19512 },
        { "id": 4, "name": "Sneha", "level": 3, "xp": 2478 },
        { "id": 5, "name": "Vikram", "level": 15, "xp": 14321 },
        { "id": 6, "name": "Maya", "level": 1, "xp": 512 },
        { "id": 7, "name": "Omar", "level": 9, "xp": 8650 },
        { "id": 8, "name": "Lina", "level": 27, "xp": 26890 },
        { "id": 9, "name": "Jose", "level": 5, "xp": 4567 },
        { "id": 10, "name": "Mei", "level": 18, "xp": 17643 },
        { "id": 11, "name": "Fatima", "level": 13, "xp": 12678 },
        { "id": 12, "name": "Leo", "level": 22, "xp": 21789 },
        { "id": 13, "name": "Zoe", "level": 4, "xp": 3489 },
        { "id": 14, "name": "Ethan", "level": 30, "xp": 29534 },
        { "id": 15, "name": "Nisha", "level": 11, "xp": 10880 },
        { "id": 16, "name": "Sam", "level": 2, "xp": 1850 },
        { "id": 17, "name": "Chen", "level": 16, "xp": 15211 },
        { "id": 18, "name": "Olga", "level": 14, "xp": 13654 },
        { "id": 19, "name": "Amrita", "level": 8, "xp": 7462 },
        { "id": 20, "name": "Diego", "level": 19, "xp": 18333 },
        { "id": 21, "name": "Hana", "level": 6, "xp": 5234 },
        { "id": 22, "name": "Luca", "level": 21, "xp": 20567 },
        { "id": 23, "name": "Aisha", "level": 24, "xp": 23701 },
        { "id": 24, "name": "Tom", "level": 10, "xp": 9544 },
        { "id": 25, "name": "Kiran", "level": 17, "xp": 16620 },
        { "id": 26, "name": "Sara", "level": 25, "xp": 24399 },
        { "id": 27, "name": "Ivan", "level": 29, "xp": 28712 },
        { "id": 28, "name": "Priyanka", "level": 23, "xp": 22110 },
        { "id": 29, "name": "Arjun", "level": 26, "xp": 25345 },
        { "id": 30, "name": "Bella", "level": 31, "xp": 30456 }
    ]

    return (
        <View style={styles.container}>

            {/* 🏆 PODIUM TOP 3 */}
            <View style={styles.podiumContainer}>
                {topUsers?.slice(0, 3).map((user, index) => (
                    <View key={user._id} style={[styles.podiumCard, index === 0 && styles.firstPlace]}>
                        <Text style={styles.podiumRank}>#{index + 1}</Text>
                        <View style={styles.avatar}>
                            <Text style={{ fontSize: 28 }}>{user.avatar || "👤"}</Text>
                        </View>
                        <Text style={styles.podiumName}>{user.username}</Text>
                        <Text style={styles.podiumXP}>{user.xp} XP</Text>
                    </View>
                ))}
            </View>

            {/* 🔘 Tabs */}
            <View style={styles.tabs}>
                {["world", "area", "friends"].map(mode => (
                    <TouchableOpacity
                        key={mode}
                        style={[
                            styles.tabBtn,
                            selectedMode === mode && styles.activeTab
                        ]}
                        onPress={() => setSelectedMode(mode)}
                    >
                        <Text style={styles.tabText}>{mode.toUpperCase()}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* 📜 LIST FROM 4TH */}
            <FlatList
                style={{ width: '90%' }}
                data={topUsers?.slice(3)}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                renderItem={({ item, index }) => (
                    <View style={styles.row}>
                        <Text style={styles.rank}>#{index + 4}</Text>

                        <View style={styles.rowUser}>
                            <Text style={{ fontSize: 20 }}>{item.avatar || "👤"}</Text>
                            <Text style={styles.name}>{item.username}</Text>
                        </View>

                        <Text style={styles.xp}>{item.xp} XP</Text>
                    </View>
                )}
            />

            {/* 👤 YOUR RANK STICKY */}
            {currentUser && (
                <View style={styles.myRank}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                        Your Rank: #{userRank}
                    </Text>
                    <Text style={{ color: '#FFD67A' }}>
                        {currentUser.xp} XP
                    </Text>
                </View>
            )}

        </View>
    );

}

export default LeaderBoard

const styles = StyleSheet.create({
    container: {
        flex: 1,
        //backgroundColor: '#1B1B1D',
        alignItems: 'center',
        paddingTop: 40,
    },

    /* PODIUM */
    podiumContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '90%',
        marginBottom: 25,
    },
    podiumCard: {
        alignItems: 'center',
        backgroundColor: '#2A244A',
        padding: 10,
        borderRadius: 18,
        width: '30%',
        borderWidth:2,
        borderColor:'#FFD67A'
    },
    firstPlace: {
        backgroundColor: '#F8B55F',
        transform: [{ scale: 1.1 }],
    },
    podiumRank: {
        color: '#fff',
        fontWeight: 'bold',
        marginBottom: 5,
    },
    avatar: {
        width: 55,
        height: 55,
        borderRadius: 30,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    podiumName: {
        color: '#fff',
        fontWeight: 'bold',
    },
    podiumXP: {
        color: '#FFD67A',
        fontWeight: 'bold',
    },

    /* TABS */
    tabs: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 15,
    },
    tabBtn: {
        backgroundColor: '#2A244A',
        paddingVertical: 8,
        paddingHorizontal: 18,
        borderRadius: 20,
    },
    activeTab: {
        backgroundColor: '#F8B55F',
    },
    tabText: {
        color: '#fff',
        fontWeight: 'bold',
    },

    /* LIST ROW */
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#2A244A',
        padding: 12,
        borderRadius: 10,
        marginBottom: 8,
        borderWidth:2,
        borderColor:'#4A4370'
    },
    rank: {
        color: '#FFD67A',
        fontWeight: 'bold',
        width: 40,
    },
    rowUser: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    name: {
        color: '#fff',
        fontWeight: 'bold',
    },
    xp: {
        color: '#FFE1E0',
        fontWeight: 'bold',
    },

    /* MY RANK */
    myRank: {
        position: 'absolute',
        bottom: 20,
        width: '90%',
        backgroundColor: '#333',
        padding: 15,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});
