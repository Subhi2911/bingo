/* eslint-disable react-native/no-inline-styles */
import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
    StyleSheet,
    Text,
    View,
    ImageBackground,
    TouchableOpacity,
    TextInput,
    BackHandler,
    Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useSocket } from '../context/SocketContext';
import { BACKEND_URL } from '../config/backend';
import GameScreen from './GameScreen';
import PrivateRoomBoard from './PrivateRoomBoard';

const PrivateRoom = () => {
    const navigation = useNavigation();
    const { roomCode: initialRoomCode } =
        navigation.getState()?.routes?.find(r => r.name === 'Private')?.params || {};
    const socketRef = useSocket();
    const socket = socketRef?.socketRef?.current;
    const pinRefs = useRef([]);

    // USER
    const [user, setUser] = useState(null);
    const [friends, setFriends] = useState([]);

    // FLOW
    const [gameType, setGameType] = useState(null);
    const [playerCount, setPlayerCount] = useState(null);
    const [usePassword, setUsePassword] = useState(false);
    const [passwordDigits, setPasswordDigits] = useState(['', '', '', '']);
    const [ready, setReady] = useState(false);
    const [roomCreated, setRoomCreated] = useState(false);

    // ROOM
    const [roomCode, setRoomCode] = useState(initialRoomCode || null);
    const [matchedPlayers, setMatchedPlayers] = useState([]);
    const [gameStarted, setGameStarted] = useState(false);
    const isHost = user?._id;

    const finalPassword = usePassword ? passwordDigits.join('') : null;

    /* ===================== SOCKET EVENTS ===================== */

    useEffect(()=>{
        console.log(initialRoomCode);
    },[initialRoomCode])
    useEffect(() => {
        if (!socket || !user) return;

        const onRoomCreated = ({ roomCode, players }) => {
            setRoomCode(roomCode);
            setMatchedPlayers(players);
            setRoomCreated(true);
        };

        const onMatchFound = ({ roomCode, players }) => {
            setRoomCode(roomCode);
            setMatchedPlayers(players);
            setTimeout(() => setGameStarted(true), 1200);
        };

        const onPrivateRoomUpdated = ({ players }) => {
            setMatchedPlayers(players);
        };

        socket.on('private_room_created', onRoomCreated);
        socket.on('match_found', onMatchFound);
        socket.on('private_room_updated', onPrivateRoomUpdated);

        return () => {
            socket.off('private_room_created', onRoomCreated);
            socket.off('match_found', onMatchFound);
            socket.off('private_room_updated', onPrivateRoomUpdated);
        };
    }, [socket, user]);

    /* ===================== FETCH USER ===================== */
    useEffect(() => {
        const fetchUser = async () => {
            const token = await AsyncStorage.getItem('authToken');
            if (!token) return;

            const res = await fetch(`${BACKEND_URL}/api/auth/getuser`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'auth-token': token },
            });

            const json = await res.json();
            setUser(json);
        };

        fetchUser();
    }, []);

    /* ===================== FETCH FRIENDS ===================== */
    useEffect(() => {
        if (!user) return;

        const fetchFriendsData = async () => {
            const token = await AsyncStorage.getItem('authToken');
            try {
                const response = await fetch(`${BACKEND_URL}/api/auth/friends`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json', 'auth-token': token },
                });
                const json = await response.json();
                setFriends(json);
            } catch (error) {
                console.error('Error fetching friends:', error);
            }
        };
        fetchFriendsData();
    }, [user]);

    /* ===================== FETCH ROOM DATA IF JOINED ===================== */
    useEffect(() => {
        if (!roomCode || !user) return;

        const fetchRoom = async () => {
            try {
                const token = await AsyncStorage.getItem('authToken');
                const res = await fetch(`${BACKEND_URL}/api/rooms/${roomCode}`, {
                    headers: { 'Content-Type': 'application/json', 'auth-token': token },
                });
                const roomData = await res.json();
                setMatchedPlayers(roomData.players);
                setGameType(roomData.gameType);
                if (typeof roomData.size === 'number') {
                    setPlayerCount(roomData.size);
                }
            } catch (err) {
                console.error('Error fetching room:', err);
            }
        };

        fetchRoom();
    }, [roomCode, user]);

    /* ===================== CREATE ROOM ===================== */
    const handleCreateRoom = useCallback(() => {
        if (!socket || !user || ready) return;

        setReady(true);

        socket.emit('create_private_room', {
            userId: user._id,
            username: user.username,
            avatar: user.avatar,
            gameType,
            size: playerCount,
            password: finalPassword,
        });
    }, [socket, user, gameType, playerCount, finalPassword, ready]);

    /* ===================== INVITE FRIEND ===================== */
    const getChatId = async (otherUserId) => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            const res = await fetch(`${BACKEND_URL}/api/chat/findOrCreate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'auth-token': token },
                body: JSON.stringify({
                    userId1: user._id,
                    userId2: otherUserId,
                    chatName: null,
                }),
            });
            const chat = await res.json();
            return chat._id;
        } catch (err) {
            console.error('Error getting chatId:', err);
            return null;
        }
    };

    const handleInviteFriend = async (friend) => {
        if (!socket || !roomCode || !user) return;

        try {
            const chatId = await getChatId(friend._id);
            if (!chatId) return;

            const inviteMessage = {
                chatId,
                sender: user._id,
                text: `🎮 ${user.username} invited you to a private room! Room Code: ${roomCode}`,
                type: 'private_room_invite',
                roomCode,
                gameType,
            };

            const res = await fetch(`${BACKEND_URL}/api/messages/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(inviteMessage),
            });

            const savedMessage = await res.json();
            socket.emit('sendMessage', savedMessage);
        } catch (err) {
            console.error('Error sending invite message:', err);
        }
    };

    /* ===================== SHARE INVITE ===================== */
    const handleInvite = async () => {
        if (!roomCode) return;

        await Share.share({
            message: `🎮 Join my private room!\n\nRoom Code: ${roomCode}\nGame: ${gameType.toUpperCase()}`,
        });
    };

    /* ===================== DISABLE BACK ===================== */
    useEffect(() => {
        const backAction = () => true;
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );
        return () => backHandler.remove();
    }, []);

    useEffect(() => {
        console.log(playerCount);
    }, [playerCount]);

    /* ===================== RENDER ===================== */
    if (gameStarted && user) {
        return (
            <GameScreen
                roomCode={roomCode}
                players={playerCount}
                matchedPlayers={matchedPlayers}
                myId={user._id}
                user={user}
                gameType={gameType}
            />
        );
    }

    const showSetupSteps = !roomCreated && !gameStarted;

    return (
        <View style={{ flex: 1, backgroundColor: '#0F0C29' }}>
            {/* EXIT */}
            <TouchableOpacity
                style={styles.exitBtn}
                onPress={() => navigation.goBack()}
            >
                <Icon
                    name="sign-out-alt"
                    size={30}
                    style={[styles.exitIcon, { transform: [{ scaleX: -1 }], color: '#FFD36E' }]}
                />
            </TouchableOpacity>

            <ImageBackground
                source={require('../images/RegisterPage.png')}
                style={styles.bg}
                resizeMode="cover"
            >
                {/* HEADER */}
                <Text style={styles.heading}>PRIVATE LOBBY</Text>
                <Text style={styles.subHeading}>Create your own battleground</Text>

                {/* STEP 1 – GAME MODE */}
                {showSetupSteps && !gameType && (
                    <View style={styles.cardContainer}>
                        {[
                            { type: 'classic', icon: 'dot-circle' },
                            { type: 'fast', icon: 'bolt' },
                            { type: 'power', icon: 'magic' },
                        ].map(item => (
                            <TouchableOpacity
                                key={item.type}
                                style={styles.gameCard}
                                onPress={() => setGameType(item.type)}
                            >
                                <Icon name={item.icon} size={36} color="#FFD36E" />
                                <Text style={styles.cardText}>{item.type.toUpperCase()}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* STEP 2 – PLAYERS */}
                {showSetupSteps && gameType && !playerCount && (
                    <View style={styles.cardContainer}>
                        {[2, 3, 4].map(p => (
                            <TouchableOpacity
                                key={p}
                                style={styles.playerCard}
                                onPress={() => { setPlayerCount(p); console.log(playerCount) }}
                            >
                                <Icon name="users" size={26} color="#FFD36E" />
                                <Text style={styles.cardText}>{p} PLAYERS</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {/* STEP 3 – PASSWORD */}
                {showSetupSteps && gameType && playerCount && (
                    <View style={styles.passwordCard}>
                        <TouchableOpacity
                            style={styles.toggleRow}
                            onPress={() => setUsePassword(prev => !prev)}
                        >
                            <Icon
                                name={usePassword ? 'lock' : 'lock-open'}
                                size={20}
                                color="#FFD36E"
                            />
                            <Text style={styles.passwordLabel}>
                                {usePassword ? 'PASSWORD ENABLED' : 'NO PASSWORD'}
                            </Text>
                        </TouchableOpacity>

                        {usePassword && (
                            <View style={styles.pinContainer}>
                                {passwordDigits.map((digit, index) => (
                                    <TextInput
                                        key={index}
                                        ref={ref => (pinRefs.current[index] = ref)}
                                        style={styles.pinBox}
                                        keyboardType="number-pad"
                                        maxLength={1}
                                        secureTextEntry
                                        value={digit}
                                        onChangeText={text => {
                                            const newDigits = [...passwordDigits];
                                            newDigits[index] = text;
                                            setPasswordDigits(newDigits);
                                            if (text && index < 3) pinRefs.current[index + 1]?.focus();
                                        }}
                                        onKeyPress={({ nativeEvent }) => {
                                            if (nativeEvent.key === 'Backspace' && !passwordDigits[index] && index > 0) {
                                                pinRefs.current[index - 1]?.focus();
                                            }
                                        }}
                                    />
                                ))}
                            </View>
                        )}
                    </View>
                )}

                {/* CREATE ROOM BUTTON */}
                {showSetupSteps && gameType && playerCount && (
                    <TouchableOpacity
                        style={styles.mainBtn}
                        disabled={ready}
                        onPress={handleCreateRoom}
                    >
                        <Text style={styles.mainText}>
                            {ready ? 'CREATING ROOM...' : 'CREATE ROOM'}
                        </Text>
                    </TouchableOpacity>
                )}

                {/* PRIVATE ROOM BOARD */}
                {roomCreated && (
                    <>
                        <PrivateRoomBoard
                            matchedPlayers={matchedPlayers}
                            user={user}
                            maxPlayers={playerCount}
                            friends={friends}
                            onInviteFriend={handleInviteFriend}
                        />

                        {/* INVITE */}
                        <View style={styles.inviteCard}>
                            <Text style={styles.roomCode}>ROOM CODE</Text>
                            <Text style={styles.codeText}>{roomCode}</Text>

                            <TouchableOpacity style={styles.inviteBtn} onPress={handleInvite}>
                                <Icon name="share-alt" size={18} color="#000" />
                                <Text style={styles.inviteText}>INVITE FRIENDS</Text>
                            </TouchableOpacity>
                        </View>

                        {/* START GAME BUTTON FOR HOST */}
                        {isHost && (
                            <TouchableOpacity
                                style={[styles.mainBtn, { marginTop: 10 }]}
                                onPress={() => socket.emit('start_game', { roomCode })}
                            >
                                <Text style={styles.mainText}>START GAME</Text>
                            </TouchableOpacity>
                        )}
                    </>
                )}
            </ImageBackground>
        </View>
    );
};

export default PrivateRoom;

// ===================== STYLES =====================
const styles = StyleSheet.create({
    bg: {
        flex: 1,
        paddingTop: 90,
        alignItems: 'center'
    },
    exitBtn: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 20
    },
    heading: {
        fontSize: 32,
        fontWeight: '900',
        color: '#FFD36E',
        letterSpacing: 2
    },
    subHeading: {
        color: '#AAA',
        marginBottom: 30
    },
    cardContainer: {
        width: '100%',
        alignItems: 'center'
    },
    mainBtn: {
        marginTop: 20,
        paddingVertical: 14,
        paddingHorizontal: 40,
        borderRadius: 25,
        backgroundColor: '#FFD36E',
        alignItems: 'center',
    },
    mainText: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#000'
    },
    gameCard: {
        width: '85%',
        height: 90,
        backgroundColor: '#1B1B3A',
        marginVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FFD36E',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 14,
    },
    playerCard: {
        width: 220,
        height: 70,
        backgroundColor: '#1B1B3A',
        marginVertical: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#FFD36E',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    cardText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#FFD36E'
    },
    passwordCard: {
        backgroundColor: '#1B1B3A',
        padding: 20,
        borderRadius: 20,
        width: '85%',
        alignItems: 'center',
        marginTop: 20,
        borderWidth: 1,
        borderColor: '#FFD36E',
    },
    toggleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10
    },
    passwordLabel: {
        color: '#FFD36E',
        fontWeight: 'bold'
    },
    pinContainer: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 14
    },
    pinBox: {
        width: 55,
        height: 55,
        backgroundColor: '#0F0C29',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#FFD36E',
        textAlign: 'center',
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFD36E',
    },
    inviteCard: {
        position: 'absolute',
        bottom: 60,
        alignItems: 'center',
        backgroundColor: '#1B1B3A',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#FFD36E',
    },
    roomCode: {
        color: '#AAA',
        letterSpacing: 2
    },
    codeText: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#FFD36E',
        marginVertical: 6
    },
    inviteBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#FFD36E',
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 24
    },
    inviteText: {
        fontWeight: 'bold'
    },
});