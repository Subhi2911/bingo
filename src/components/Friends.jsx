/* eslint-disable react-native/no-inline-styles */

import {
    ImageBackground,
    StyleSheet,
    Text,
    View,
    FlatList,
    Image,
    ActivityIndicator
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/FontAwesome5";
import { useNavigation } from "@react-navigation/native";

const Friends = () => {
    const navigation = useNavigation();

    // Full dataset (you can replace this with API)
    const allUsers = [
        { username: "bingoAce", avatar: "daub", wins: 12, xp: 1450, level: 5, coins: 820 },
        { username: "luckyStar", avatar: "daub", wins: 8, xp: 980, level: 4, coins: 540 },
        { username: "numberNinja", avatar: "daub", wins: 20, xp: 2400, level: 7, coins: 1500 },
        { username: "fastDauber", avatar: "daub", wins: 5, xp: 620, level: 3, coins: 310 },
        { username: "bingoQueen", avatar: "daub", wins: 18, xp: 2100, level: 6, coins: 1320 },
        { username: "cardMaster", avatar: "daub", wins: 9, xp: 1100, level: 4, coins: 670 },
        { username: "goldenBall", avatar: "daub", wins: 14, xp: 1650, level: 5, coins: 900 },
        { username: "rapidTap", avatar: "daub", wins: 3, xp: 400, level: 2, coins: 180 },
        { username: "bingoWolf", avatar: "daub", wins: 16, xp: 1900, level: 6, coins: 1200 },
        { username: "finalCall", avatar: "daub", wins: 19, xp: 2300, level: 7, coins: 1600 },
        { username: "extra1", avatar: "daub", wins: 2, xp: 300, level: 1, coins: 100 },
        { username: "extra2", avatar: "daub", wins: 4, xp: 450, level: 2, coins: 200 },
        { username: "extra3", avatar: "daub", wins: 6, xp: 700, level: 3, coins: 350 },
        { username: "extra4", avatar: "daub", wins: 7, xp: 800, level: 3, coins: 400 },
        { username: "extra5", avatar: "daub", wins: 10, xp: 1000, level: 4, coins: 600 },
        { username: "extra6", avatar: "daub", wins: 11, xp: 1200, level: 4, coins: 650 },
        { username: "extra7", avatar: "daub", wins: 13, xp: 1400, level: 5, coins: 750 },
        { username: "extra8", avatar: "daub", wins: 15, xp: 1700, level: 5, coins: 900 },
        { username: "extra9", avatar: "daub", wins: 17, xp: 2000, level: 6, coins: 1100 },
        { username: "extra10", avatar: "daub", wins: 18, xp: 2100, level: 6, coins: 1250 },
    ];

    const BATCH_SIZE = 8; // how many users to load per scroll

    const [users, setUsers] = useState(allUsers.slice(0, BATCH_SIZE));
    const [loadingMore, setLoadingMore] = useState(false);

    const loadMoreUsers = () => {
        if (users.length >= allUsers.length || loadingMore) return; // all loaded or already loading

        setLoadingMore(true);

        // simulate API delay
        setTimeout(() => {
            const nextUsers = allUsers.slice(users.length, users.length + BATCH_SIZE);
            setUsers([...users, ...nextUsers]);
            setLoadingMore(false);
        }, 1000);
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Image
                source={require("../images/daub.png")}
                style={styles.avatar}
            />

            <View style={{ flex: 1 }}>
                <Text style={styles.username}>{item.username}</Text>
                <Text style={styles.subText}>
                    Wins: {item.wins} · Level {item.level}
                </Text>
            </View>

            <View style={styles.coinRemoveContainer}>
                <View style={styles.removeUser}>
                    <Icon name='user-minus' size={20} color='#000' />
                </View>

                <View style={styles.coinRow}>
                    <Icon name="coins" size={16} color="#F8B55F" />
                    <Text style={styles.coinText}>{item.coins}</Text>
                </View>
            </View>
        </View>
    );

    const renderFooter = () => {
        if (!loadingMore) return null;
        return (
            <View style={{ paddingVertical: 16 }}>
                <ActivityIndicator size="small" color="#000" />
            </View>
        );
    };

    return (
        <View style={{ flex: 1 }}>
            <ImageBackground
                source={require("../images/FriendsPage.png")}
                style={{ flex: 1 }}
            >
                <SafeAreaView style={{ flex: 1 }}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Icon
                            name="arrow-left"
                            size={26}
                            color="#000"
                            onPress={() => navigation.goBack()}
                        />
                        <Text style={styles.friendsText}>Friends</Text>
                    </View>

                    {/* FlatList */}
                    <FlatList
                        data={users}
                        keyExtractor={(item) => item.username}
                        renderItem={renderItem}
                        contentContainerStyle={{ padding: 16, paddingTop: 30 }}
                        showsVerticalScrollIndicator={true}
                        scrollEnabled={true}
                        onEndReached={loadMoreUsers}
                        onEndReachedThreshold={0.5}
                        ListFooterComponent={renderFooter}
                    />
                </SafeAreaView>
            </ImageBackground>
        </View>
    );
};

export default Friends;

const styles = StyleSheet.create({
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 30, // header a little lower
        marginHorizontal: 16,
    },
    friendsText: {
        fontSize: 22,
        fontWeight: "bold",
        marginLeft: 16,
        color: "#000",
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.85)",
        padding: 12,
        borderRadius: 14,
        marginBottom: 12,
    },
    avatar: {
        width: 46,
        height: 46,
        borderRadius: 23,
        marginRight: 12,
    },
    username: {
        fontSize: 16,
        fontWeight: "600",
        color: "#000",
    },
    subText: {
        fontSize: 13,
        color: "#555",
        marginTop: 2,
    },
    coinRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    coinText: {
        fontWeight: "600",
        color: "#000",
    },
    removeUser: {
        margin: 5,
    },
    coinRemoveContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "30%",
    },
});
