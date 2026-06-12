/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSocket } from '../context/SocketContext';
import { showAlert2 } from './CustomAlert2';

// ── moved outside component so it's not re-created on every render ────────────
const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';

    const day   = date.getDate();
    const month = date.toLocaleString('en-GB', { month: 'long' });
    const year  = date.getFullYear();

    let hours  = date.getHours();
    const mins = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours      = hours % 12 || 12;

    return `${day} ${month} ${year} • ${hours}:${mins} ${ampm}`;
};

const MessageBubble = ({
    message, isMe, seen, userData,
    type, roomCode, timeStamp, playerCount, gameType,
}) => {
    const navigation = useNavigation();
    const socketRef  = useSocket();
    const socket     = socketRef?.socket;

    // ── BUG FIX: use formatTimestamp, not the old date/time variables ─────────
    const formattedTime = formatTimestamp(timeStamp);

    const handlePress = () => {
        if (type !== 'private_room_invite') return;

        showAlert2({
            type: 'confirm',
            title: 'Private room invite',
            message: 'Join private room?',
            onConfirm: () => {
                socket?.emit('join_private_room', {
                    roomCode,
                    userId:   userData._id,
                    username: userData.username,
                    avatar:   userData.avatar,
                    socketId: socket.id,
                });

                socket.once('private_room_updated', () => {
                    navigation.navigate('Private', {
                        roomCode,
                        gameType,
                        playerCount,
                        initialRoomCreated: true,
                    });
                });
            },
        });
    };

    return (
        <TouchableOpacity
            activeOpacity={type === 'private_room_invite' ? 0.7 : 1}
            onPress={handlePress}
            style={[
                styles.bubbleContainer,
                isMe ? styles.myBubbleContainer : styles.theirBubbleContainer,
            ]}
        >
            <View
                style={[
                    styles.bubble,
                    isMe ? styles.myBubble : styles.theirBubble,
                    type === 'private_room_invite' && styles.inviteBubble,
                ]}
            >
                <Text
                    style={[
                        styles.text,
                        isMe ? styles.myText : styles.theirText,
                        type === 'private_room_invite' && { color: '#000' },
                    ]}
                >
                    {message}
                </Text>

                <View style={styles.metaContainer}>
                    {/* BUG FIX: single formatted string instead of broken date + time vars */}
                    {!!formattedTime && (
                        <Text style={[styles.time, { color: isMe ? 'rgba(255,255,255,0.7)' : '#777' }]}>
                            {formattedTime}
                        </Text>
                    )}

                    {isMe && (
                        <Text style={[styles.seen, seen ? styles.seenText : styles.unseenText]}>
                            {seen ? '✓✓' : '✓'}
                        </Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default MessageBubble;

const styles = StyleSheet.create({
    bubbleContainer: {
        paddingHorizontal: 12,
        marginVertical: 4,
        flexDirection: 'row',
    },
    myBubbleContainer:    { justifyContent: 'flex-end' },
    theirBubbleContainer: { justifyContent: 'flex-start' },
    bubble: {
        maxWidth: '75%',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
    },
    myBubble:    { backgroundColor: '#0061b1', borderTopRightRadius: 0 },
    theirBubble: { backgroundColor: '#e0e0e0', borderTopLeftRadius: 0 },
    inviteBubble: {
        borderWidth: 2,
        borderColor: '#000000',
        backgroundColor: '#ffffff',
    },
    text:    { fontSize: 16 },
    myText:  { color: '#fff' },
    theirText: { color: '#000' },
    metaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        marginTop: 4,
        gap: 4,
    },
    time:       { fontSize: 10, marginRight: 2 },
    seen:       { fontSize: 10 },
    seenText:   { color: '#fff' },
    unseenText: { color: 'rgba(255,255,255,0.45)' },
});