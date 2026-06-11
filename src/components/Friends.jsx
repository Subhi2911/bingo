/* eslint-disable react-native/no-inline-styles */

import {
    ImageBackground,
    StyleSheet,
    Text,
    View,
    FlatList,
    Image,
    ActivityIndicator,
    TouchableOpacity,
    Touchable
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/FontAwesome5";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BACKEND_URL } from "../config/backend";

const Friends = () => {
    const navigation = useNavigation();
    const [screen, setScreen] = useState('friends');
    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        const getMyUserData = async () => {
            try {
                const token = await AsyncStorage.getItem("authToken");
                console.log("Auth Token:", token);
                const response = await fetch(`${BACKEND_URL}/api/auth/getUser`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "auth-token": token,
                    },
                });
                const json = await response.json();
                setUserData(json);
                console.log("My user data:", json);
            } catch (error) {
                console.error("Error fetching my user data:", error);
            }
        };
        getMyUserData();
    }, []);

    useEffect(() => {
        const fetchFriendsData = async () => {
            const token = await AsyncStorage.getItem("authToken");
            console.log("Auth Token:", token);
            try {
                const response = await fetch(`${BACKEND_URL}/api/auth/friends`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "auth-token": token,
                    },
                });
                const json = await response.json();
                setFriends(json);
                console.log("Friends data:", json);
            } catch (error) {
                console.error("Error fetching friends:", error);
            }
        };
        fetchFriendsData();
    }, []);

    useEffect(() => {
        const fetchRequestsData = async () => {
            const token = await AsyncStorage.getItem("authToken");
            console.log("Auth Token:", token);
            try {
                const response = await fetch(`${BACKEND_URL}/api/auth/pending-requests`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "auth-token": token,
                    },
                });
                if (response.ok) {
                    const json = await response.json();
                    setRequests(json);
                    console.log("Requests data:", json);
                }

            } catch (error) {
                console.error("Error fetching requests:", error);
            }
        };
        fetchRequestsData();
    }, []);

    const [acceptedRequests, setAcceptedRequests] = useState([]);

    const handleAccept = async (userId) => {
        try {
            console.log('haggue')
            const token = await AsyncStorage.getItem("authToken");
            const res = await fetch(`${BACKEND_URL}/api/auth/accept-request/${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": token,
                },
            });
            console.log(res);
            if (res.ok) {
                const data = await res.json();
                setAcceptedRequests([...acceptedRequests, userId]);
                setRequests(requests.filter(r => r._id !== userId));
                setFriends([...friends, data.safeUser]);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleReject = async (userId) => {
        try {
            console.log('bibhu nalla')
            const token = await AsyncStorage.getItem("authToken");
            const res = await fetch(`${BACKEND_URL}/api/auth/reject-request/${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": token,
                },
            });
            await res.json();
            setRequests(requests.filter(r => r._id !== userId));
        } catch (err) {
            console.error(err);
        }
    };

    const removeFriend = async (userId) => {
        try {
            const token = await AsyncStorage.getItem("authToken");
            const res = await fetch(`${BACKEND_URL}/api/auth/remove-friend/${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": token,
                },
            });
            await res.json();
            setFriends(friends.filter(f => f._id !== userId));
        } catch (err) {
            console.error(err);
        }
    };

    const openChat = async (otherUserId, otherUsername) => {
        console.log(userData);
        try {
            const response = await fetch(`${BACKEND_URL}/api/chat/findOrCreate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId1: userData._id,   // your logged-in user
                    userId2: otherUserId,      // user clicked on
                    chatName: otherUsername,
                }),
            });
            const chat = await response.json();
            console.log(userData._id, otherUserId, chat);
            // Navigate to Chat screen with the chatId
            navigation.navigate("Chat", { chatId: chat._id });
        } catch (err) {
            console.error(err);
        }
    };


    const BATCH_SIZE = 8; // how many users to load per scroll

    const [users, setUsers] = useState(screen === 'friends' ? friends?.slice(0, BATCH_SIZE) : requests?.slice(0, BATCH_SIZE));
    console.log(users);
    const [loadingMore, setLoadingMore] = useState(false);

    const loadMoreUsers = () => {
        if (loadingMore) return;

        const source = screen === 'friends' ? friends : requests;

        if (users.length >= source.length) return; // all loaded

        setLoadingMore(true);

        setTimeout(() => {
            const nextUsers = source.slice(users.length, users.length + BATCH_SIZE);
            setUsers([...users, ...nextUsers]);
            setLoadingMore(false);
        }, 500); // smaller delay for smoother UI
    };



    const renderItemFriends = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.avatar}>
                <Text style={{ fontSize: 25 }}>{item.avatar || '🐟'}</Text>
            </View>

            <View style={{ flex: 1 }}>
                {console.log(item)};
                <Text style={styles.username}>{item.username}</Text>
                <Text>{item.bio}</Text>
                <Text style={styles.subText}>
                    Wins: {(item.wins?.classic + item.wins?.fast + item.wins?.power) || 0 } · Level {item.level} ·XP: {item.totalXp}
                </Text>
            </View>
            <View style={styles.removeChatContainer}>
                <TouchableOpacity style={styles.removeUser} onPress={() => { removeFriend(item?._id) }}>
                    <Icon name='user-minus' size={18} color='#000' />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => openChat(item?._id, item?.username)}>
                    <Icon name="comment-dots" size={18} color="#000" />
                </TouchableOpacity>
            </View>
            <View style={styles.coinRemoveContainer}>
                <View style={styles.coinRow}>
                    <Icon name="coins" size={16} color="#F8B55F" />
                    <Text style={styles.coinText}>{item.money}</Text>
                </View>
            </View>
        </View>
    );

    const renderItemRequests = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.avatar}>
                <Text style={{ fontSize: 25 }}>{item.avatar || '🐟'}</Text>
            </View>

            <View style={{ flex: 1 }}>
                <Text style={styles.username}>{item.username}</Text>
                <Text>{item.bio}</Text>
                <Text style={styles.subText}>
                    Wins: {(item.wins?.classic + item.wins?.fast + item.wins?.power) || 0 } · Level {item.level} ·XP: {item.totalXp}
                </Text>
            </View>

            <View style={styles.choiceContainer}>
                {acceptedRequests.includes(item._id) || userData?.friends?.includes(item._id) ? (
                    <Icon name='check' size={25} color='#02ac4f' />
                ) : (<>
                    <TouchableOpacity style={styles.removeUser} onPress={() => handleAccept(item._id)}>
                        <Icon name='check-circle' size={25} color='#02ac4f' />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.coinRow} onPress={() => handleReject(item._id)}>
                        <Icon name="times-circle" size={25} color="#f70505" />
                        {/* <Text style={styles.coinText}>{item.coins}</Text> */}
                    </TouchableOpacity>
                </>)}

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
    useEffect(() => {
        if (screen === 'friends') {
            setUsers(friends.slice(0, BATCH_SIZE));
        } else if (screen === 'requests') {
            setUsers(requests.slice(0, BATCH_SIZE));
        }
    }, [screen, friends, requests]);

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
                        <View style={styles.dot}>
                            <Text>{friends.length}</Text>
                        </View>
                        <TouchableOpacity onPress={() => { setScreen(screen === 'requests' ? 'friends' : 'requests'); }} style={styles.requestButton}>
                            <Text style={{ color: "#3D365C", fontWeight: "bold", fontSize: 18 }}>{screen === 'requests' ? 'Friends' : 'Requests'}</Text>
                        </TouchableOpacity>
                        {screen === 'friends' && requests.length > 0 && (
                            <View style={styles.dot}>
                                <Text style={styles.dotText}>{requests.length}</Text>
                            </View>
                        )}

                    </View>
                    {screen === 'requests' && requests.length === 0 && (
                        <View style={{ flex: 1, alignItems: "center", marginTop: 50 }}>
                            <Text style={{ fontSize: 15, color: "#ffffff" }}>No requests found.</Text>
                        </View>
                    )}
                    {screen === 'friends' && friends.length === 0 && (
                        <View style={{ flex: 1, alignItems: "center", marginTop: 50 }}>
                            <Text style={{ fontSize: 15, color: "#ffffff" }}>No friends found.</Text>
                        </View>
                    )}

                    {screen === 'friends' && friends.length !== 0 &&
                        <FlatList
                            data={users}
                            keyExtractor={(item) => item.username}
                            renderItem={renderItemFriends}
                            contentContainerStyle={{ padding: 16, paddingTop: 30 }}
                            showsVerticalScrollIndicator={true}
                            scrollEnabled={true}
                            onEndReached={loadMoreUsers}
                            onEndReachedThreshold={0.5}
                            ListFooterComponent={renderFooter}
                        />}
                    {screen === 'requests' && requests.length !== 0 &&
                        <FlatList
                            data={users}
                            keyExtractor={(item) => item.username}
                            renderItem={renderItemRequests}
                            contentContainerStyle={{ padding: 16, paddingTop: 30 }}
                            showsVerticalScrollIndicator={true}
                            scrollEnabled={true}
                            onEndReached={loadMoreUsers}
                            onEndReachedThreshold={0.5}
                            ListFooterComponent={renderFooter}
                        />}
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
    dot: {
        backgroundColor: "#FFD700",
        borderRadius: 10,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginLeft: 8,
    },
    requestButton: {
        marginLeft: "auto",
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
        width: "15%",
    },
    choiceContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "20%",
    },
    removeChatContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "15%",
        position: "absolute",
        right: 20,
        top: 10,
        alignItems: "center",
    },
    dotText: {
        color: "#000",
        fontWeight: "bold",
    },
});
