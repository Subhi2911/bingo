/* eslint-disable react-native/no-inline-styles */
import {
    FlatList, StyleSheet, Text,
    TouchableOpacity, View, 
} from 'react-native'
import React, { useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../config/backend';

const LeaderBoard = () => {
    const [selectedMode, setSelectedMode] = React.useState("world");
    const [topUsers, setTopUsers] = React.useState(null);
    const [userRank, setUserRank] = React.useState(null);
    const [currentUser, setCurrentUser] = React.useState(null);
    const [friendUsers, setFriendUsers] = React.useState(null);
    const [friendRank, setFriendRank] = React.useState(null);

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const token = await AsyncStorage.getItem('authToken');
                const res = await fetch(`${BACKEND_URL}/api/games/leaderboard`, {
                    headers: { 'auth-token': token },
                });
                const data = await res.json();
                setTopUsers(data.topUsers);
                setUserRank(data.userRank);
                setCurrentUser(data.currentUser);
                setFriendUsers(data.friendUsers);
                setFriendRank(data.friendRank);
            } catch (err) {
                console.log(err);
            }
        };
        fetchLeaderboard();
    }, []);

    const isWorld = selectedMode === 'world';
    const listData = isWorld ? topUsers : friendUsers;
    const rank = isWorld ? userRank : friendRank;
    const podiumData = listData?.slice(0, 3) ?? [];
    const restData = listData?.slice(3) ?? [];

    // Visual order: 2nd (left), 1st (center/tallest), 3rd (right)
    const PODIUM_ORDER = [1, 0, 2];

    // Heights for each podium position (index = original rank 0,1,2)
    const PODIUM_HEIGHTS = { 0: 170, 1: 150, 2: 130 };
    const PODIUM_AVATAR_SIZE = { 0: 64, 1: 52, 2: 46 };
    const PODIUM_BORDER_COLORS = { 0: '#FFD67A', 1: '#C0C0C0', 2: '#CD7F32' };
    const PODIUM_BG = { 0: '#2F2060', 1: '#2A244A', 2: '#2A244A' };
    const MEDALS = { 0: '🥇', 1: '🥈', 2: '🥉' };

    return (
        <View style={styles.safe}>
            {/* ── HEADER ── */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}> Leaderboard</Text>
                <Text style={styles.headerSub}>
                    {isWorld ? 'Global Rankings' : 'Friends Rankings'}
                </Text>
            </View>

            {/* ── TABS ── */}
            <View style={styles.tabsWrapper}>
                <View style={styles.tabs}>
                    {[
                        { key: 'world', label: '🌍 World' },
                        { key: 'friends', label: '👥 Friends' },
                    ].map(tab => (
                        <TouchableOpacity
                            key={tab.key}
                            style={[styles.tabBtn, selectedMode === tab.key && styles.activeTab]}
                            onPress={() => setSelectedMode(tab.key)}
                        >
                            <Text style={[
                                styles.tabText,
                                selectedMode === tab.key && styles.activeTabText
                            ]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* ── PODIUM TOP 3 ── */}
            {podiumData.length > 0 && (
                <View style={styles.podiumContainer}>
                    {PODIUM_ORDER.map((podiumIdx) => {
                        const user = podiumData[podiumIdx];
                        if (!user) return <View key={`empty-${podiumIdx}`} style={{ width: '30%' }} />;
                        const isFirst = podiumIdx === 0;
                        const cardHeight = PODIUM_HEIGHTS[podiumIdx];
                        const avatarSize = PODIUM_AVATAR_SIZE[podiumIdx];

                        return (
                            <View
                                key={user._id}
                                style={[
                                    styles.podiumCard,
                                    {
                                        height: cardHeight,
                                        borderColor: PODIUM_BORDER_COLORS[podiumIdx],
                                        backgroundColor: PODIUM_BG[podiumIdx],
                                        // Align all cards to bottom so base is flush
                                        alignSelf: 'flex-end',
                                    }
                                ]}
                            >
                                {isFirst && (
                                    <Text style={styles.crownEmoji}>👑</Text>
                                )}
                                <Text style={styles.podiumRankBadge}>
                                    {MEDALS[podiumIdx]}
                                </Text>
                                <View style={[
                                    styles.avatarCircle,
                                    {
                                        width: avatarSize,
                                        height: avatarSize,
                                        borderRadius: avatarSize / 2,
                                        borderColor: PODIUM_BORDER_COLORS[podiumIdx],
                                    }
                                ]}>
                                    <Text style={{ fontSize: isFirst ? 30 : 22 }}>
                                        {user.avatar || '👤'}
                                    </Text>
                                </View>
                                <Text style={[styles.podiumName, { fontSize: isFirst ? 13 : 11 }]} numberOfLines={1}>
                                    {user.username}
                                </Text>
                                <Text style={[styles.podiumXP, { fontSize: isFirst ? 12 : 10 }]}>
                                    {user.totalXp} XP
                                </Text>
                            </View>
                        );
                    })}
                </View>
            )}

            {/* ── REST OF LIST ── */}
            <FlatList
                style={styles.list}
                contentContainerStyle={{ paddingBottom: 8 }}
                data={restData}
                keyExtractor={(item) => item._id}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>
                        {isWorld ? 'No players yet.' : 'Add friends to see them here!'}
                    </Text>
                }
                renderItem={({ item, index }) => {
                    const isMe = item._id?.toString() === currentUser?._id?.toString();
                    return (
                        <View style={[styles.row, isMe && styles.myRow]}>
                            <Text style={styles.rank}>#{index + 4}</Text>
                            <View style={styles.rowUser}>
                                <Text style={{ fontSize: 22 }}>{item.avatar || '🐟'}</Text>
                                <Text style={[styles.name, isMe && styles.myName]} numberOfLines={1}>
                                    {item.username}{isMe ? ' (You)' : ''}
                                </Text>
                            </View>
                            <Text style={styles.xp}>{item.totalXp} XP</Text>
                        </View>
                    );
                }}
            />

            {/* ── YOUR RANK STICKY FOOTER — 100px above bottom ── */}
            {currentUser && rank && (
                <View style={styles.myRank}>
                    <View style={styles.myRankLeft}>
                        <View style={styles.myRankEmojiContainer}>
                            <Text style={styles.myRankEmoji}>{currentUser.avatar || '👤'}</Text>
                        </View>
                        <View>
                            <Text style={styles.myRankName}>{currentUser.username}</Text>
                            <Text style={styles.myRankSub}>
                                {isWorld ? 'Global' : 'Among Friends'}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.myRankRight}>
                        <Text style={styles.myRankXP}>{currentUser.totalXp} XP</Text>
                        <Text style={styles.myRankPosition}>Rank #{rank}</Text>
                    </View>
                </View>
            )}
        </View>
    );
};

export default LeaderBoard;

const styles = StyleSheet.create({
    safe: {
        flex: 1,
        alignItems: 'center',
    },

    /* HEADER */
    header: {
        width: '100%',
        paddingVertical: 16,
        paddingHorizontal: 20,
        alignItems: 'center',
        marginBottom: 14,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#FFD67A',
        letterSpacing: 1,
    },
    headerSub: {
        fontSize: 13,
        color: '#9B92C8',
        marginTop: 2,
    },

    /* TABS */
    tabsWrapper: {
        marginBottom: 20,
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: '#1E1A3A',
        borderRadius: 25,
        padding: 4,
    },
    tabBtn: {
        paddingVertical: 8,
        paddingHorizontal: 22,
        borderRadius: 22,
    },
    activeTab: {
        backgroundColor: '#F8B55F',
    },
    tabText: {
        color: '#9B92C8',
        fontWeight: 'bold',
        fontSize: 13,
    },
    activeTabText: {
        color: '#1B1B1D',
    },

    /* PODIUM */
    podiumContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',   // all cards grow upward from same baseline
        width: '92%',
        marginBottom: 22,
        gap: 8,
    },
    podiumCard: {
        alignItems: 'center',
        justifyContent: 'flex-end',  // content sticks to bottom inside card
        paddingBottom: 10,
        paddingTop: 8,
        paddingHorizontal: 6,
        borderRadius: 18,
        width: '31%',
        borderWidth: 2,
        overflow: 'hidden',          // prevents content bleeding outside
    },
    crownEmoji: {
        fontSize: 18,
        marginBottom: 2,
    },
    podiumRankBadge: {
        fontSize: 20,
        marginBottom: 4,
    },
    avatarCircle: {
        backgroundColor: '#1B1440',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
        borderWidth: 2,
    },
    podiumName: {
        color: '#fff',
        fontWeight: 'bold',
        textAlign: 'center',
        width: '100%',
    },
    podiumXP: {
        color: '#FFD67A',
        fontWeight: 'bold',
        marginTop: 2,
        textAlign: 'center',
    },

    /* LIST */
    list: {
        width: '90%',
        flex: 1,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#2A244A',
        padding: 12,
        borderRadius: 10,
        marginBottom: 8,
        borderWidth: 2,
        borderColor: '#4A4370',
    },
    myRow: {
        borderColor: '#FFD67A',
        backgroundColor: '#2F2060',
    },
    rank: {
        color: '#FFD67A',
        fontWeight: 'bold',
        width: 38,
        fontSize: 13,
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
        fontSize: 14,
        flex: 1,
    },
    myName: {
        color: '#FFD67A',
    },
    xp: {
        color: '#FFE1E0',
        fontWeight: 'bold',
        fontSize: 13,
    },
    emptyText: {
        color: '#9B92C8',
        textAlign: 'center',
        marginTop: 30,
        fontSize: 14,
    },

    /* MY RANK FOOTER — absolute, 100px above bottom */
    myRank: {
        position: 'absolute',
        bottom: 100,
        left: '5%',
        right: '5%',
        backgroundColor: '#FFD67A',
        padding: 14,
        borderRadius: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        // subtle shadow so it floats above the list
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
    },
    myRankLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    myRankEmojiContainer:{
        display:'flex',
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'#000',
        borderRadius:20,
        height:40,
        width:40
    },
    myRankEmoji: {
        fontSize: 28,
    },
    myRankName: {
        fontWeight: 'bold',
        color: '#1B1B1D',
        fontSize: 15,
    },
    myRankSub: {
        color: '#4A3A00',
        fontSize: 11,
        marginTop: 1,
    },
    myRankRight: {
        alignItems: 'flex-end',
    },
    myRankXP: {
        fontWeight: 'bold',
        color: '#1B1B1D',
        fontSize: 14,
    },
    myRankPosition: {
        color: '#4A3A00',
        fontSize: 13,
        fontWeight: 'bold',
        marginTop: 2,
    },
});