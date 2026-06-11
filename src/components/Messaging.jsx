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
    const socketRef = useSocket();
    const socket = socketRef?.socket;
    const onlineUsers = socketRef?.onlineUsers
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

    const convertToDateAndDay = (timestamp) => {
        if (!timestamp) return "";
        const date = new Date(timestamp);
        const options = { month: 'short', day: 'numeric' };
        return date.toLocaleDateString(undefined, options);
    }



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
                                color: isOtherUserOnline ? "green" : "red",
                                fontSize: 12,
                                marginLeft: 8,
                            }}
                        >
                            {isOtherUserOnline ? "Online" : "Offline"}
                        </Text>
                    </View>

                    <Text style={{ color: "#2e2e2e" }}>
                        {item?.lastMessage?.text.length > 20
                            ? `${item?.lastMessage?.text.substring(0, 20)}...`
                            : item?.lastMessage?.text || "No messages yet"}
                    </Text>
                </View>
                {console.log("last message timestamp:", item)}
                <View style={{ alignItems: "flex-end" ,marginRight: 10}}>
                    <Text style={{ color: "#2e2e2e" }}>{convertToDateAndDay(item?.lastMessage?.createdAt)}</Text>
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
        <View >
            <View style={styles.header}>
                {/* <Icon
                            name="arrow-left"
                            size={26}
                            color="#000"
                            onPress={() => navigation.goBack()}
                        /> */}
                <Text style={styles.MessagesText}>Messages</Text>

                {/* 033519 */}

            </View>
            {loadingChats ? (
                <View style={{ marginTop: 40, alignItems: "center" }}>
                    <ActivityIndicator size="large" color="#F8B55F" />
                </View>
            ) : chats.length === 0 ? (
                <View style={{ marginTop: 40, alignItems: "center" }}>
                    <Text style={{ color: "#F8B55F" }}>
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

        </View>

    )
}

export default Messaging

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        // padding: 15,
    },
    MessagesText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 16,
        color: '#ffffff',
    },
    userContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        backgroundColor: '#f4ddfc',
        marginHorizontal: 15,
        marginVertical: 5,
        borderRadius: 10,
        borderBottomColor: '#ddd'
    }
})