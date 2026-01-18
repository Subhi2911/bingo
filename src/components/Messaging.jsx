/* eslint-disable react-native/no-inline-styles */
import { FlatList, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from "react-native-vector-icons/FontAwesome5";
import { useNavigation } from '@react-navigation/native';
import { BACKEND_URL } from '../config/backend';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator } from "react-native";
import { useSocket } from '../context/SocketContext';


const Messaging = () => {
    const navigation = useNavigation();
    const [chats, setChats] = useState([]);
    const [userData, setUserData] = useState(null);
    const [loadingChats, setLoadingChats] = useState(true);
    const { socket, onlineUsers } = useSocket();
    //const [isOnline, setIsOnline] = useState(false);

    useEffect(() => {
        if (userData?._id && socket) {
            socket.emit("userOnline", userData._id);
        }
    }, [userData, socket]);

    
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
                console.log("My user data:djdj", json);
            } catch (error) {
                console.error("Error fetching my user data:", error);
            }
        };
        getMyUserData();
    }, []);


    useEffect(() => {
        const fetchChats = async () => {
            if (!userData?._id) return;

            try {
                setLoadingChats(true);   // 🔹 start loader

                const response = await fetch(
                    `${BACKEND_URL}/api/chat/user/${userData._id}`
                );
                const data = await response.json();

                setChats(data);
                console.log("Fetched chats:", data);
            } catch (error) {
                console.error("Error fetching chats:", error);
            } finally {
                setLoadingChats(false);  // 🔹 STOP loader (IMPORTANT)
            }
        };

        fetchChats();
    }, [userData]);


    const users = [
        {
            id: 1,
            username: "ShadowFox",
            avatar: "🦊",
            money: 1200,
            wins: 18,
            xp: 2450,
            level: 12,
            lastMessage: "See you in the next match!",
            seen: true
        },
        {
            id: 2,
            username: "PixelQueen",
            avatar: "👑",
            money: 980,
            wins: 12,
            xp: 1900,
            level: 10,
            lastMessage: "That was fun 😂",
            seen: false
        },
        {
            id: 3,
            username: "ThunderWolf",
            avatar: "🐺",
            money: 1500,
            wins: 25,
            xp: 3200,
            level: 15,
            lastMessage: "Ready when you are",
            seen: true
        },
        {
            id: 4,
            username: "NeonTiger",
            avatar: "🐯",
            money: 760,
            wins: 9,
            xp: 1400,
            level: 8,
            lastMessage: "I’ll join later",
            seen: false
        },
        {
            id: 5,
            username: "IronEagle",
            avatar: "🦅",
            money: 2000,
            wins: 30,
            xp: 4100,
            level: 18,
            lastMessage: "Easy win 😎",
            seen: true
        },
        {
            id: 6,
            username: "LunaCat",
            avatar: "🐱",
            money: 540,
            wins: 6,
            xp: 900,
            level: 6,
            lastMessage: "Good night 🌙",
            seen: true
        },
        {
            id: 7,
            username: "FireDrake",
            avatar: "🐲",
            money: 1750,
            wins: 22,
            xp: 3500,
            level: 16,
            lastMessage: "Rematch?",
            seen: false
        },
        {
            id: 8,
            username: "AquaKnight",
            avatar: "🛡️",
            money: 890,
            wins: 11,
            xp: 1650,
            level: 9,
            lastMessage: "Lag today 😕",
            seen: true
        },
        {
            id: 9,
            username: "GhostByte",
            avatar: "👻",
            money: 430,
            wins: 4,
            xp: 720,
            level: 5,
            lastMessage: "Hello?",
            seen: false
        },
        {
            id: 10,
            username: "SolarPhoenix",
            avatar: "🔥",
            money: 2200,
            wins: 35,
            xp: 4800,
            level: 20,
            lastMessage: "Legendary match!",
            seen: true
        },
        {
            id: 11,
            username: "MysticOwl",
            avatar: "🦉",
            money: 610,
            wins: 7,
            xp: 1050,
            level: 7,
            lastMessage: "Thinking 🤔",
            seen: true
        },
        {
            id: 12,
            username: "CyberNinja",
            avatar: "🥷",
            money: 1340,
            wins: 19,
            xp: 2700,
            level: 13,
            lastMessage: "Stealth mode on",
            seen: false
        },
        {
            id: 13,
            username: "BlazeHawk",
            avatar: "🔥",
            money: 990,
            wins: 14,
            xp: 2000,
            level: 11,
            lastMessage: "Nice strategy!",
            seen: true
        },
        {
            id: 14,
            username: "FrostBear",
            avatar: "🐻‍❄️",
            money: 860,
            wins: 10,
            xp: 1580,
            level: 9,
            lastMessage: "Cold but fun",
            seen: false
        },
        {
            id: 15,
            username: "VioletViper",
            avatar: "🐍",
            money: 1450,
            wins: 21,
            xp: 2950,
            level: 14,
            lastMessage: "You almost won",
            seen: true
        },
        {
            id: 16,
            username: "NovaStar",
            avatar: "⭐",
            money: 1120,
            wins: 16,
            xp: 2300,
            level: 12,
            lastMessage: "GG!",
            seen: true
        },
        {
            id: 17,
            username: "StoneGiant",
            avatar: "🗿",
            money: 500,
            wins: 5,
            xp: 800,
            level: 6,
            lastMessage: "Slow but steady",
            seen: false
        },
        {
            id: 18,
            username: "EchoPulse",
            avatar: "📡",
            money: 780,
            wins: 8,
            xp: 1300,
            level: 8,
            lastMessage: "Can you hear me?",
            seen: true
        },
        {
            id: 19,
            username: "CrimsonBlade",
            avatar: "🗡️",
            money: 1680,
            wins: 24,
            xp: 3400,
            level: 15,
            lastMessage: "Sharp play!",
            seen: false
        },
        {
            id: 20,
            username: "ZenPanda",
            avatar: "🐼",
            money: 640,
            wins: 7,
            xp: 1100,
            level: 7,
            lastMessage: "Peace ✌️",
            seen: true
        }
    ];
    const renderusers = ({ item }) => {
        const otherUser = item.participants.find(
            (p) => p._id.toString() !== userData?._id?.toString()
        );

        const isOtherUserOnline = otherUser
            ? onlineUsers?.includes(otherUser._id)
            : false;

        return (
            <TouchableOpacity
                style={styles.userContainer}
                onPress={() =>
                    navigation.navigate("Chat", { chatId: item._id })
                }
            >
                <Text style={{ fontSize: 32, marginRight: 16 }}>
                    {otherUser?.avatar}
                </Text>

                <View style={{ flex: 1 }}>
                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Text style={{ fontSize: 18, fontWeight: "bold", color: "#000" }}>
                            {otherUser?.username}
                        </Text>

                        <Text
                            style={{
                                color: isOtherUserOnline ? "green" : "gray",
                                fontSize: 12,
                                marginLeft: 8,
                            }}
                        >
                            {isOtherUserOnline ? "Online" : "Offline"}
                        </Text>
                    </View>

                    <Text style={{ color: "#555" }}>
                        {item?.lastMessage?.text || "No messages yet"}
                    </Text>
                </View>

                {!item.seen && (
                    <View
                        style={{
                            width: 10,
                            height: 10,
                            borderRadius: 5,
                            backgroundColor: "red",
                        }}
                    />
                )}
            </TouchableOpacity>
        );
    };




    return (
        <View>
            <ImageBackground
                source={require('../images/message_bg.png')}
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
            >
                <SafeAreaView>
                    <View style={styles.header}>
                        <Icon
                            name="arrow-left"
                            size={26}
                            color="#000"
                            onPress={() => navigation.goBack()}
                        />
                        <Text style={styles.MessagesText}>Messages</Text>



                    </View>
                    {loadingChats ? (
                        <View style={{ marginTop: 40, alignItems: "center" }}>
                            <ActivityIndicator size="large" color="#033519" />
                        </View>
                    ) : chats.length === 0 ? (
                        <View style={{ marginTop: 40, alignItems: "center" }}>
                            <Text style={{ color: "#033519" }}>
                                No Chats yet. Start the conversation!
                            </Text>
                        </View>
                    ) : (
                        <FlatList
                            data={chats}
                            keyExtractor={(item) => item._id}
                            renderItem={renderusers}
                            contentContainerStyle={{ paddingBottom: 100 }}
                        />
                    )}

                </SafeAreaView>
            </ImageBackground>
        </View>
    )
}

export default Messaging

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    MessagesText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 16,
        color: '#000',
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        backgroundColor: '#c9efc6',
        marginHorizontal: 15,
        marginVertical: 5,
        borderRadius: 8,
        borderBottomColor: '#ddd'
    }
})