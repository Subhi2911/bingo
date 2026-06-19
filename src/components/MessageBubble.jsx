/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSocket } from '../context/SocketContext';
import { showAlert2 } from './CustomAlert2';

const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return '';
    const day   = date.getDate();
    const month = date.toLocaleString('en-GB', { month: 'long' });
    const year  = date.getFullYear();
    let hours   = date.getHours();
    const mins  = date.getMinutes().toString().padStart(2, '0');
    const ampm  = hours >= 12 ? 'PM' : 'AM';
    hours       = hours % 12 || 12;
    return `${day} ${month} ${year} • ${hours}:${mins} ${ampm}`;
};

// ── Gift bubble ───────────────────────────────────────────────────────────────
const GiftBubble = ({ message, isMe, seen, formattedTime }) => {
    // message format: "🎁 Gift: 100 coins — "hello""
    // Parse out coins and optional note
    const coinsMatch = message.match(/Gift:\s*(\d+)\s*coins/);
    const noteMatch  = message.match(/—\s*"(.+)"$/);
    const coins      = coinsMatch?.[1] ?? '?';
    const note       = noteMatch?.[1] ?? null;

    return (
        <View style={[
            styles.bubble,
            isMe ? styles.myBubble : styles.theirBubble,
            styles.giftBubble,
        ]}>
            <Text style={styles.giftEmoji}>🎁</Text>
            <Text style={styles.giftCoins}>
                {isMe ? 'You sent' : 'You received'} {coins} coins
            </Text>
            {note && <Text style={styles.giftNote}>"{note}"</Text>}
            <View style={[styles.metaContainer, { justifyContent: isMe ? 'flex-end' : 'flex-start' }]}>
                {!!formattedTime && (
                    <Text style={[styles.time, { color: isMe ? 'rgba(255,255,255,0.65)' : '#777' }]}>
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
    );
};

// ── Main bubble ───────────────────────────────────────────────────────────────
const MessageBubble = ({
    message, isMe, seen, userData,
    type, roomCode, timeStamp, playerCount, gameType,
}) => {
    const navigation = useNavigation();
    const socketRef  = useSocket();
    const socket     = socketRef?.socket;
    const formattedTime = formatTimestamp(timeStamp);

    const isInvite = type === 'private_room_invite';
    const isGift   = type === 'gift';

    const handlePress = () => {
        if (!isInvite) return;
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
                        roomCode, gameType, playerCount,
                        initialRoomCreated: true,
                    });
                });
            },
        });
    };

    const containerStyle = [
        styles.bubbleContainer,
        isMe ? styles.myBubbleContainer : styles.theirBubbleContainer,
    ];

    // ── Gift message ──────────────────────────────────────────────────────────
    if (isGift) {
        return (
            <View style={containerStyle}>
                <GiftBubble
                    message={message}
                    isMe={isMe}
                    seen={seen}
                    formattedTime={formattedTime}
                />
            </View>
        );
    }

    // ── Invite or normal message ──────────────────────────────────────────────
    // Only wrap in TouchableOpacity if actually tappable
    const Wrapper = isInvite ? TouchableOpacity : View;
    const wrapperProps = isInvite
        ? { activeOpacity: 0.7, onPress: handlePress }
        : {};

    return (
        <Wrapper style={containerStyle} {...wrapperProps}>
            <View style={[
                styles.bubble,
                isMe ? styles.myBubble : styles.theirBubble,
                isInvite && styles.inviteBubble,
            ]}>
                <Text style={[
                    styles.text,
                    isMe ? styles.myText : styles.theirText,
                    isInvite && { color: '#000' },
                ]}>
                    {message}
                </Text>
                <View style={[styles.metaContainer, { justifyContent: isMe ? 'flex-end' : 'flex-start' }]}>
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
        </Wrapper>
    );
};

export default MessageBubble;

const styles = StyleSheet.create({
    bubbleContainer:      { paddingHorizontal: 12, marginVertical: 4, flexDirection: 'row' },
    myBubbleContainer:    { justifyContent: 'flex-end' },
    theirBubbleContainer: { justifyContent: 'flex-start' },

    bubble: { maxWidth: '75%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20 },
    myBubble:    { backgroundColor: '#0061b1', borderTopRightRadius: 0 },
    theirBubble: { backgroundColor: '#e0e0e0', borderTopLeftRadius: 0 },
    inviteBubble: { borderWidth: 2, borderColor: '#000', backgroundColor: '#fff' },

    // Gift bubble
    giftBubble: {
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#FFD67A',
        backgroundColor: '#1a0a3a',
        borderRadius: 16,
        paddingVertical: 14,
        paddingHorizontal: 18,
        gap: 2,
    },
    giftEmoji: { fontSize: 28, marginBottom: 4 },
    giftCoins: { color: '#FFD67A', fontWeight: '700', fontSize: 15 },
    giftNote:  { color: 'rgba(255,255,255,0.65)', fontSize: 12, fontStyle: 'italic', textAlign: 'center', marginTop: 2 },

    text:      { fontSize: 16 },
    myText:    { color: '#fff' },
    theirText: { color: '#000' },

    metaContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
    time:       { fontSize: 10, marginRight: 2 },
    seen:       { fontSize: 10 },
    seenText:   { color: '#fff' },
    unseenText: { color: 'rgba(255,255,255,0.45)' },
});