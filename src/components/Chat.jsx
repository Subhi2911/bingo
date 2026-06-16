/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ImageBackground,
    Keyboard,
    Animated,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import MessageBubble from './MessageBubble';
import { BACKEND_URL } from '../config/backend';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSocket } from '../context/SocketContext';

const PAGE_SIZE = 8; // messages per page

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getRoomCode    = (text) => text?.match(/Room Code:\s*(\w+)/)?.[1] || null;
const getPlayerCount = (text) => text?.match(/Total Players:\s*(\d+)/)?.[1] || null;
const getGameType    = (text) => text?.match(/GameType:\s*(.+)/)?.[1] || null;

const Chat = ({ route }) => {
    const navigation                  = useNavigation();
    const { chatId }                  = route.params;
    const socketRef                   = useSocket();
    const socket                      = socketRef?.socket;
    const onlineUsers                 = socketRef?.onlineUsers;

    // ── State ─────────────────────────────────────────────────────────────────
    const [typedMessage, setTypedMessage] = useState('');
    const [inputHeight, setInputHeight]   = useState(48);
    const [userData, setUserData]         = useState(null);
    const [otherUser, setOtherUser]       = useState(null);
    const [messages, setMessages]         = useState([]);

    // Pagination
    const [page, setPage]               = useState(1);
    const [hasMore, setHasMore]         = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    // Keyboard animation
    const [keyboardHeight] = useState(new Animated.Value(0));

    // Refs
    const flatListRef     = useRef(null);
    const firstLoadRef    = useRef(true);   // scroll-to-bottom only on first load
    const sentMessageIds  = useRef(new Set()); // prevent double-append for own messages

    // ── Keyboard listeners ────────────────────────────────────────────────────
    useEffect(() => {
        const show = Keyboard.addListener('keyboardDidShow', (e) => {
            Animated.timing(keyboardHeight, {
                toValue: e.endCoordinates.height,
                duration: 250,
                useNativeDriver: false,
            }).start();
        });
        const hide = Keyboard.addListener('keyboardDidHide', () => {
            Animated.timing(keyboardHeight, { toValue: 0, duration: 250, useNativeDriver: false }).start();
        });
        return () => { show.remove(); hide.remove(); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Fetch my user data ────────────────────────────────────────────────────
    useEffect(() => {
        const getMyUserData = async () => {
            try {
                const token = await AsyncStorage.getItem('authToken');
                const res   = await fetch(`${BACKEND_URL}/api/auth/getUser`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'auth-token': token },
                });
                setUserData(await res.json());
            } catch (e) { console.log('getUser error:', e); }
        };
        getMyUserData();
    }, []);

    // ── Fetch other user from chat participants ───────────────────────────────
    useEffect(() => {
        if (!userData || !chatId) return;
        const fetchChat = async () => {
            try {
                const res  = await fetch(`${BACKEND_URL}/api/chat/${chatId}`);
                if (!res.ok) return;
                const data = await res.json();
                setOtherUser(data.participants.find(p => p._id !== userData._id));
            } catch (e) { console.log('fetchChat error:', e); }
        };
        fetchChat();
    }, [chatId, userData]);

    // ── Initial message load (page 1 = last 8 messages) ──────────────────────
    useEffect(() => {
        if (!chatId) return;
        fetchMessages(1, true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chatId]);

    const fetchMessages = useCallback(async (targetPage, isInitial = false) => {
        if (loadingMore && !isInitial) return;
        setLoadingMore(true);
        try {
            const res  = await fetch(
                `${BACKEND_URL}/api/messages/${chatId}?page=${targetPage}&limit=${PAGE_SIZE}`
            );
            const data = await res.json(); // newest-first from backend, we reverse below

            if (!Array.isArray(data) || data.length === 0) {
                setHasMore(false);
                setLoadingMore(false);
                return;
            }

            // Backend returns newest-first for pagination; reverse for display
            const ordered = [...data].reverse();

            if (isInitial) {
                setMessages(ordered);
                setHasMore(data.length === PAGE_SIZE);
            } else {
                // Prepend older messages — preserve scroll position
                setMessages(prev => [...ordered, ...prev]);
                setHasMore(data.length === PAGE_SIZE);
            }
        } catch (e) {
            console.log('fetchMessages error:', e);
        } finally {
            setLoadingMore(false);
        }
    }, [chatId, loadingMore]);

    // ── Scroll to bottom only on first load ───────────────────────────────────
    useEffect(() => {
        if (!messages.length) return;
        if (firstLoadRef.current) {
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
            firstLoadRef.current = false;
        }
    }, [messages]);

    // ── Socket: join chat + active chat tracking ──────────────────────────────
    useEffect(() => {
        if (!socket) return;

        const join = () => {
            socket.emit('joinChat', chatId);
            socket.emit('active_chat', { chatId });
        };

        socket.connected ? join() : socket.once('connect', join);

        return () => {
            socket.emit('leave_active_chat', { chatId });
            socket.off('connect', join);
        };
    }, [socket, chatId]);

    // ── Socket: receive messages ──────────────────────────────────────────────
    useEffect(() => {
        if (!socket) return;

        const handleReceive = (message) => {
            // FIX: don't double-append messages we sent ourselves
            if (sentMessageIds.current.has(message._id)) {
                sentMessageIds.current.delete(message._id);
                return;
            }
            setMessages(prev => [...prev, message]);

            // Mark as seen immediately if this chat is open
            if (userData && message.sender?._id !== userData._id) {
                markSeen(message._id);
            }
        };

        socket.on('receiveMessage', handleReceive);
        return () => socket.off('receiveMessage', handleReceive);
    }, [socket, userData]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Socket: seen acknowledgement from other user ──────────────────────────
    useEffect(() => {
        if (!socket) return;

        const handleSeen = ({ messageId, seenBy }) => {
            setMessages(prev =>
                prev.map(m =>
                    m._id === messageId
                        ? { ...m, seenBy: [...(m.seenBy || []), seenBy] }
                        : m
                )
            );
        };

        socket.on('message_seen', handleSeen);
        return () => socket.off('message_seen', handleSeen);
    }, [socket]);

    // ── Mark messages as seen when chat opens / new message arrives ───────────
    useEffect(() => {
        if (!userData || !messages.length || !socket) return;

        const unread = messages.filter(
            m => m.sender?._id !== userData._id &&
                 !(m.seenBy || []).includes(userData._id)
        );

        unread.forEach(m => markSeen(m._id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messages, userData]);

    const markSeen = useCallback(async (messageId) => {
        try {
            // Optimistic local update
            setMessages(prev =>
                prev.map(m =>
                    m._id === messageId
                        ? { ...m, seenBy: [...new Set([...(m.seenBy || []), userData._id])] }
                        : m
                )
            );

            // Tell backend
            await fetch(`${BACKEND_URL}/api/messages/seen`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messageId, userId: userData._id, chatId }),
            });

            // Broadcast to the other user's socket so their tick updates live
            socket?.emit('mark_seen', { messageId, chatId, seenBy: userData._id });
        } catch (e) {
            console.log('markSeen error:', e);
        }
    }, [userData, chatId, socket]);

    // ── Send message ──────────────────────────────────────────────────────────
    const sendMessage = async () => {
        if (!typedMessage.trim() || !socket?.connected) return;
        const text = typedMessage.trim();
        setTypedMessage('');

        try {
            const res = await fetch(`${BACKEND_URL}/api/messages/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ chatId, sender: userData._id, text }),
            });

            const savedMessage = await res.json();

            // Register this ID so the socket handler won't double-append it
            sentMessageIds.current.add(savedMessage._id);

            // Append locally
            setMessages(prev => [...prev, savedMessage]);

            // Broadcast to other user
            socket.emit('sendMessage', savedMessage);

            // Scroll to bottom
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50);
        } catch (e) {
            console.log('sendMessage error:', e);
        }
    };

    // ── Load more on scroll to top ────────────────────────────────────────────
    const handleScrollToTop = useCallback(() => {
        if (!hasMore || loadingMore) return;
        const nextPage = page + 1;
        setPage(nextPage);
        fetchMessages(nextPage, false);
    }, [hasMore, loadingMore, page, fetchMessages]);

    const isOtherUserOnline = otherUser ? onlineUsers?.includes(otherUser._id) : false;

    // ── Render ────────────────────────────────────────────────────────────────
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
                        <Icon name="arrow-left" size={16} color="#000" onPress={() => navigation.goBack()} />
                        <Text style={styles.avatar}>{otherUser?.avatar || '🐟'}</Text>
                        <View style={{ flex: 1, marginLeft: 10 }}>
                            <Text style={styles.username}>{otherUser?.username}</Text>
                            <Text style={{ color: isOtherUserOnline ? '#22c55e' : '#4c4c4e', fontSize: 11 }}>
                                {isOtherUserOnline ? 'Online' : 'Offline'}
                            </Text>
                        </View>
                    </View>

                    {/* MESSAGES */}
                    <View style={{ flex: 1 }}>
                        {messages.length === 0 && !loadingMore ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>No messages yet. Say hello! 👋</Text>
                            </View>
                        ) : (
                            <FlatList
                                ref={flatListRef}
                                data={messages}
                                keyExtractor={(item) => item?._id?.toString()}
                                renderItem={({ item }) => (
                                    <MessageBubble
                                        message={item?.text || ''}
                                        isMe={item?.sender?._id === userData?._id}
                                        seen={item.seenBy?.includes(otherUser?._id)}
                                        userData={userData}
                                        type={item?.type}
                                        roomCode={getRoomCode(item?.text)}
                                        timeStamp={item?.updatedAt}
                                        playerCount={getPlayerCount(item?.text)}
                                        gameType={getGameType(item?.text)}
                                    />
                                )}
                                contentContainerStyle={{ paddingVertical: 10 }}
                                // Trigger load-more when user reaches the top
                                onScrollToIndexFailed={() => {}}
                                ListHeaderComponent={
                                    loadingMore ? (
                                        <View style={styles.loadingMore}>
                                            <ActivityIndicator size="small" color="#200366" />
                                            <Text style={styles.loadingMoreText}>Loading older messages…</Text>
                                        </View>
                                    ) : hasMore ? (
                                        <TouchableOpacity style={styles.loadMoreBtn} onPress={handleScrollToTop}>
                                            <Text style={styles.loadMoreText}>Load older messages</Text>
                                        </TouchableOpacity>
                                    ) : (
                                        <Text style={styles.noMoreText}>— start of conversation —</Text>
                                    )
                                }
                            />
                        )}
                    </View>

                    {/* INPUT BAR */}
                    <Animated.View style={[styles.inputContainer, { marginBottom: Animated.add(keyboardHeight, 20) }]}>
                        <TextInput
                            style={[styles.input, { height: inputHeight }]}
                            placeholder="Type a message..."
                            placeholderTextColor="#717171"
                            value={typedMessage}
                            onChangeText={setTypedMessage}
                            multiline
                            textAlignVertical="top"
                            numberOfLines={4}
                            onContentSizeChange={(e) => {
                                const h = Math.min(120, e.nativeEvent.contentSize.height);
                                setInputHeight(h < 48 ? 48 : h);
                            }}
                        />
                        {typedMessage.length > 0 && (
                            <TouchableOpacity onPress={sendMessage} disabled={!typedMessage.trim()}>
                                <Icon name="paper-plane" size={24} color="#ffffff" style={styles.sendIcon} />
                            </TouchableOpacity>
                        )}
                        <Icon name="gift" size={24} color="#f708d7" />
                    </Animated.View>

                </SafeAreaView>
            </ImageBackground>
        </View>
    );
};

export default Chat;

const styles = StyleSheet.create({
    root: { flex: 1 },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#50a2eb6a',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    avatar:   { fontSize: 22, marginLeft: 14 },
    username: { fontSize: 18, fontWeight: 'bold', color: '#000' },

    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 60 },
    emptyText:  { color: '#555', fontSize: 14 },

    loadingMore:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, gap: 8 },
    loadingMoreText: { color: '#200366', fontSize: 12 },
    loadMoreBtn:     { alignItems: 'center', paddingVertical: 10 },
    loadMoreText:    { color: '#200366', fontSize: 13 },
    noMoreText:      { textAlign: 'center', color: '#200366', fontSize: 11, paddingVertical: 10 },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#50a2eb6a',
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
    sendIcon: { marginRight: 12 },
});