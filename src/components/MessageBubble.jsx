// MessageBubble.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MessageBubble = ({ message, isMe, seen }) => {
    useEffect(() => {
        console.log("Rendering MessageBubble:", { message, isMe, seen });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
        <View
            style={[
                styles.bubbleContainer,
                isMe ? styles.myBubbleContainer : styles.theirBubbleContainer,
            ]}
        >
            <View
                style={[
                    styles.bubble,
                    isMe ? styles.myBubble : styles.theirBubble,
                ]}
            >
                <Text style={[styles.text, isMe ? styles.myText : styles.theirText]}>
                    {message}
                </Text>
                <View style={styles.metaContainer}>
                    <Text style={styles.time}>{message.time}</Text>
                    {isMe && (
                        <Text style={[styles.seen, seen ? styles.seenText : styles.unseenText]}>
                            {seen ? '✓✓' : '✓'}
                        </Text>
                    )}
                </View>
            </View>
        </View>
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
