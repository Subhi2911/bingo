/* eslint-disable react-native/no-inline-styles */
// MessageBubble.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSocket } from '../context/SocketContext';

const MessageBubble = ({ message, isMe, seen, userData, type, roomCode, timeStamp }) => {
    const navigation = useNavigation();
    const socketRef = useSocket();
    const socket = socketRef?.socketRef?.current;
    console.log(timeStamp)
    const dateObj = new Date(timeStamp);


    const date = dateObj.toLocaleDateString();
    const time = dateObj.toLocaleTimeString();

    const handlePress = () => {
        if (type === 'private_room_invite') {
            Alert.alert('Join Room?', message, [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Join',
                    onPress: () => {
                        // Navigate to PrivateRoomBoard
                        navigation.navigate('Private', { roomCode: roomCode });
                        // Emit join event to socket
                        socket?.emit('join_private_room', {
                            roomCode: roomCode,
                            userId: userData._id,
                            username: userData.username,
                            avatar: userData.avatar,
                        });
                    },
                },
            ]);
        }
    };
    React.useEffect(() => {
        console.log(message);
    })

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
                    {date && <Text style={[styles.time, { color: isMe ? '#fff' : '#555' }]}>{date}</Text>}
                    {time && <Text style={[styles.time, { color: isMe ? '#fff' : '#555' }]}>{time}</Text>}
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
    myBubbleContainer: {
        justifyContent: 'flex-end',
    },
    theirBubbleContainer: {
        justifyContent: 'flex-start',
    },
    bubble: {
        maxWidth: '75%',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 20,
    },
    myBubble: {
        backgroundColor: '#0061b1',
        borderTopRightRadius: 0,
    },
    theirBubble: {
        backgroundColor: '#e0e0e0',
        borderTopLeftRadius: 0,
    },
    inviteBubble: {
        borderWidth: 2,
        borderColor: '#000000',
        backgroundColor: '#ffffff',
        color: '#000'
    },
    text: {
        fontSize: 16,
    },
    myText: {
        color: '#fff',
    },
    theirText: {
        color: '#000',
    },
    metaContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 4,
    },
    time: {
        fontSize: 10,
        color: '#555',
        marginRight: 4,
    },
    seen: {
        fontSize: 10,
    },
    seenText: {
        color: '#fff',
    },
    unseenText: {
        color: '#aaa',
    },
});