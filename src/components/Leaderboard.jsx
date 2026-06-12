/* eslint-disable react-native/no-inline-styles */
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect } from 'react'
// import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { BACKEND_URL } from '../config/backend';

const LeaderBoard = () => {
    const [selectedMode, setSelectedMode] = React.useState("world");
    //const navigation = useNavigation();
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
        fetchLeaderboard();
    
    }, [])
    

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
                        <Text style={styles.podiumXP}>{user.totalXp} XP</Text>
                    </View>
                ))}
            </View>

            {/* 🔘 Tabs */}
            <View style={styles.tabs}>
                {["world", "friends"].map(mode => (
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
                            <Text style={{ fontSize: 20 }}>{item.avatar || "🐟"}</Text>
                            <Text style={styles.name}>{item.username}</Text>
                        </View>

                        <Text style={styles.xp}>{item.totalXp} XP</Text>
                    </View>
                )}
            />

            {/* 👤 YOUR RANK STICKY */}
            {currentUser && (
                <View style={styles.myRank}>
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                        Your Rank: #{userRank}
                    </Text>
                    <Text style={{ color: '#f9f8f5' }}>
                        {currentUser.totalXp} XP
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
        bottom: 100,
        width: '90%',
        backgroundColor: '#f4cd56cb',
        padding: 15,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});
