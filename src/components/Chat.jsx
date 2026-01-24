/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect, use } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ImageBackground,
    Keyboard,
    Platform,
    Animated,
    FlatList,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import MessageBubble from './MessageBubble';
import { BACKEND_URL } from '../config/backend';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSocket } from '../context/SocketContext';

const Chat = ({ route }) => {
    const navigation = useNavigation();
    const [typedMessage, setTypedMessage] = useState('');
    const [keyboardHeight] = useState(new Animated.Value(0));
    const [inputHeight, setInputHeight] = useState(48)
    const { chatId } = route.params;
    const [userData, setUserData] = useState(null);
    const [otherUser, setOtherUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const flatListRef = React.useRef();
    const socketRef = useSocket();
    const socket = socketRef?.socketRef?.current;
    const onlineUsers = socketRef?.onlineUsers;

    const getRoomCode = (text) => {
        const match = text.match(/Room Code:\s*(\w+)/);
        return match ? match[1] : null;
    };
    //const [text, setText] = useState("");

    useEffect(() => {
        if (flatListRef.current && messages.length) {
            // Scroll to the **last item**
            flatListRef.current.scrollToEnd({ animated: false });
        }
    }, [messages]);

    useEffect(() => {
        if (flatListRef.current) {
            flatListRef.current.scrollToEnd({ animated: true });
        }
    }, [messages]);

    useEffect(() => {
        if (!socket) return;

        // Connect only if not connected
        if (!socket?.connected) socket?.connect();

        const handleConnect = () => {
            console.log("Socket connected:", socket.id);
            socket.emit("joinChat", chatId);
        };

        if (socket?.connected) {

            socket.emit("joinChat", chatId);
        } else {
            socket?.on("connect", () => {

                socket.emit("joinChat", chatId);
            });
        }


        return () => {
            socket.off("connect", handleConnect);
        };
    }, [socket, chatId]);



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
        const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
            Animated.timing(keyboardHeight, {
                toValue: e.endCoordinates.height,
                duration: 250,
                useNativeDriver: false,
            }).start();
        });
        const hideSub = Keyboard.addListener('keyboardDidHide', () => {
            Animated.timing(keyboardHeight, {
                toValue: 0,
                duration: 250,
                useNativeDriver: false,
            }).start();
        });

        return () => {
            showSub.remove();
            hideSub.remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!userData || !chatId) return;

        const fetchChatAndUser = async () => {
            try {
                const chatRes = await fetch(`${BACKEND_URL}/api/chat/${chatId}`);

                if (!chatRes.ok) {
                    const text = await chatRes.text();
                    console.log("Non-JSON response:", text);
                    return;
                }

                const chatData = await chatRes.json();
                console.log("Chat data:", chatData);

                const otherUserData = chatData.participants.find(
                    (p) => p._id !== userData._id
                );

                console.log("Other user:", otherUserData);
                setOtherUser(otherUserData);

            } catch (err) {
                console.error("Fetch chat error:", err);
            }
        };

        fetchChatAndUser();
    }, [chatId, userData]);



    //get messages
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/messages/${chatId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                const data = await res.json();
                // Assuming otherUser is already set
                setMessages(data);
                console.log("Messages data:", data);

            } catch (err) {
                console.error(err);
            }
        };
        fetchMessages();
    }, [chatId]);

    useEffect(() => {
        if (!socket) return;

        const joinChat = () => {
            console.log("Socket connected:", socket.id);
            socket.emit("joinChat", chatId);

        };

        if (socket.connected) {
            joinChat();
        } else {
            socket.once("connect", joinChat);
        }

        return () => {
            socket.off("connect", joinChat);
        };
    }, [socket, chatId]);


    useEffect(() => {
        if (!socket) return;

        const handleReceive = (message) => {
            console.log(message);
            setMessages(prev => [...prev, message]);
        };

        socket.on("receiveMessage", handleReceive);

        return () => socket.off("receiveMessage", handleReceive);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket, userData]);

    // send message
    const sendMessage = async () => {
        if (!typedMessage.trim() || !socket?.connected) {
            console.log("Socket not ready or empty message");
            return;
        }
        try {
            console.log("Sending message:", typedMessage);

            const res = await fetch(`${BACKEND_URL}/api/messages/`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chatId,                // chat ID
                    sender: userData._id,  // must match schema
                    text: typedMessage,    // must match schema
                }),
            });

            const savedMessage = await res.json();
            console.log("Saved message:", savedMessage);

            // Update local state
            setMessages((prev) => [...prev, savedMessage]);

            // Send via socket
            socket.emit("sendMessage", savedMessage);

            // Clear input
            setTypedMessage('');
        } catch (err) {
            console.error("Error sending message:", err);
        }
    };


    const isOtherUserOnline = otherUser
        ? onlineUsers?.includes(otherUser?._id)
        : false;


    return (
        <View style={styles.root}>
            <ImageBackground
                source={require('../images/chat_bg.png')}
                style={styles.root}
                resizeMode="cover"
            >
                <SafeAreaView style={styles.root} edges={['top']}>

                    {/* HEADER */}
                    <View style={styles.header}>
                        <Icon
                            name="arrow-left"
                            size={16}
                            color="#000"
                            onPress={() => navigation.goBack()}
                        />
                        <Text style={styles.avatar}>{otherUser?.avatar || '🐟'}</Text>
                        <Text style={styles.username}>{otherUser?.username}</Text>
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

                    {/* MESSAGES */}
                    <View style={{ flex: 1 }}>
                        {messages &&
                            <FlatList
                                ref={flatListRef}
                                data={messages}
                                keyExtractor={(item) => item?._id}
                                renderItem={({ item }) => (
                                    <MessageBubble
                                        message={item?.text || ''}
                                        isMe={item?.sender?._id === userData?._id}
                                        seen={item.seenBy?.includes(otherUser?._id)}
                                        userData={userData}
                                        type={item?.type}
                                        roomCode={getRoomCode(item?.text)}
                                        timeStamp={item?.updatedAt}
                                    />
                                )}

                                contentContainerStyle={{ paddingVertical: 10 }}
                                // optional for smooth auto-scroll on new messages
                                onContentSizeChange={() =>
                                    flatListRef.current?.scrollToOffset({ offset: 0, animated: true })
                                }

                            />}
                    </View>

                    {messages && messages.length === 0 && (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ color: '#555' }}>No messages yet. Start the conversation!</Text>
                        </View>
                    )}



                    {/* INPUT BAR */}
                    <Animated.View style={[styles.inputContainer, { marginBottom: Animated.add(keyboardHeight, 20) }]}>
                        <TextInput
                            style={[styles.input, { height: inputHeight }]}
                            placeholder="Type a message..."
                            placeholderTextColor="#717171"
                            value={typedMessage}
                            onChangeText={setTypedMessage}
                            multiline={true}
                            textAlignVertical="top"
                            numberOfLines={4}
                            onContentSizeChange={(e) => {
                                // dynamically adjust height, limit maxHeight
                                const newHeight = Math.min(120, e.nativeEvent.contentSize.height);
                                setInputHeight(newHeight < 48 ? 48 : newHeight); // min height 48
                            }}

                        />
                        <TouchableOpacity
                            onPress={sendMessage}
                            disabled={typedMessage.trim().length === 0}
                        >
                            <Icon
                                name="paper-plane"
                                size={24}
                                color="#ffffff"
                                style={styles.sendIcon}
                            />
                        </TouchableOpacity>
                        <Icon name="gift" size={24} color="#f708d7" />
                    </Animated.View>

                </SafeAreaView>
            </ImageBackground>
        </View>
    );
};

export default Chat;

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#50a2eb6a',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    avatar: {
        fontSize: 22,
        marginLeft: 14,
    },
    username: {
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
        color: '#000',
    },
    messagesContainer: {
        flex: 1,
        paddingVertical: 5,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#50a2eb6a'
        //backgroundColor: '#ffffffcc',

    },
    input: {
        flex: 1,
        height: 48,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 25,
        paddingHorizontal: 18,
        backgroundColor: '#fff',
        fontSize: 16,
        color: '#000',
        marginRight: 10,
    },
    sendIcon: {
        marginRight: 12,
    },
});
