/* eslint-disable react-native/no-inline-styles */
import {
    BackHandler,
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
    Modal,
    TextInput,
    Animated,
    Keyboard,
} from 'react-native';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import CustomAlert from './CustomAlert';
import { useSocket } from '../context/SocketContext';
import WinningModal from './WinningModal';
import FloatingNumber from './FloatingNumber';
import AvatarTimer from './AvatarTimer';
import FloatingBingoGhost from './FloatingBingoGhost';
import BingoPopUp from './BingoPopUp';
import WinConfetti from './WinConfetti';
import ProfileModal from './ProfileModal';
import Intro from './Intro';
import LevelModal from './LevelModal';
import XPModal from './XPModal';
import { BACKEND_URL } from '../config/backend';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FloatingMessage from './FloatingMessage';


const GameScreen = (props) => {
    const navigation = useNavigation();
    const socketRef = useSocket();
    const socket = socketRef?.socket;
    const [winModal, setWinModal] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [currentTurn, setCurrentTurn] = useState(null);
    const [pickedNumbers, setPickedNumbers] = useState([]);
    const [turnOrder, setTurnOrder] = useState([]);
    const [playerWins, setPlayerWins] = useState({});
    const [playerBoards, setPlayerBoards] = useState({});
    const [result, setResult] = useState('');
    const [winnerPlayerId, setWinnerPlayerId] = useState(null);
    const otherPlayers = turnOrder?.filter(p => p.userId !== props?.user?._id);
    const TURN_TIME = 15;
    const letters = ['B', 'I', 'N', 'G', 'O'];
    const [timer, setTimer] = useState(TURN_TIME);
    const [floatingNumbers, setFloatingNumbers] = useState([]);
    const xpUpdatedRef = useRef(false);
    const gameStartTimeRef = useRef(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [floatingMessages, setFloatingMessages] = useState([]);
    const [inputHeight, setInputHeight] = useState(48);
    const keyboardHeight = useRef(new Animated.Value(0)).current;

    const [bingopop, setBingopop] = useState(false);
    const bingoShownRef = useRef(false);

    const didWinRef = useRef(false);

    const avatarRef = useRef(null);
    const [anchor, setAnchor] = useState(null);
    const [profileVisible, setProfileVisible] = useState(false);
    const [profileDetails, setProfileDetails] = useState(null);

    const gameEndedRef = React.useRef(false);
    const [loading, setLoading] = React.useState(true);

    const [levelModalVisible, setLevelModalVisible] = useState(false);

    const [xpModalVisible, setXpModalVisible] = useState(false);
    const [xpResult, setXpResult] = useState(null);
    const oldXpRef = useRef(props.user.xp);

    const [chatInput, setChatInput] = useState('');
    const [chatMessages, setChatMessages] = useState([]);

    // ─── Stable references for board/pickedNumbers used in the timer callback ───
    // We store these in refs so the useCallback below never needs to redeclare
    // when those values change, keeping the AvatarTimer callback identity stable.
    const playerBoardsRef = useRef(playerBoards);
    const pickedNumbersRef = useRef(pickedNumbers);

    useEffect(() => { playerBoardsRef.current = playerBoards; }, [playerBoards]);
    useEffect(() => { pickedNumbersRef.current = pickedNumbers; }, [pickedNumbers]);

    const handleWinModalClose = () => {
        setWinModal(false);
        setXpModalVisible(true);
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

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
                duration: 200,
                useNativeDriver: false,
            }).start();
        });

        return () => {
            showSub.remove();
            hideSub.remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const updateXPFromServer = async (
        didWin,
        gameType = props.gameType,
        playerCount = props.players
    ) => {
        if (xpUpdatedRef.current) return;
        xpUpdatedRef.current = true;

        try {
            const token = await AsyncStorage.getItem('authToken');
            oldXpRef.current = props.user.xp;

            const duration = gameStartTimeRef.current
                ? Math.floor((Date.now() - gameStartTimeRef.current) / 1000)
                : 0;

            const res = await fetch(`${BACKEND_URL}/api/games/update-progress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'auth-token': token,
                },
                body: JSON.stringify({
                    gameId: props.roomCode,
                    didWin,
                    gameType,
                    playerCount,
                    duration,
                }),
            });

            const data = await res.json();
            setXpResult({ ...data, oldXP: oldXpRef.current });
        } catch (e) {
            console.log(e);
        }
    };

    useEffect(() => {
        if (currentTurn !== props?.user?._id) return;

        setTimer(TURN_TIME);
        const interval = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentTurn]);

    useEffect(() => {
        if (!socket || !props.roomCode) return;
        socket.emit('join_chat_room', props.roomCode);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket, props.roomCode]);

    const sendMessage = () => {
        if (!chatInput.trim()) return;
        socket.emit('send_message', {
            roomCode: props.roomCode,
            username: props.user.username,
            text: chatInput.trim(),
        });
        setChatInput('');
    };

    useEffect(() => {
        if (!socket) return;

        const handleReceive = (data) => {
            setFloatingMessages(prev => [
                ...prev,
                {
                    id: `${Date.now()}-${Math.random()}`,
                    text: `${data.username}: ${data.text}`,
                    top: Math.random() * 250 + 120,
                },
            ]);
        };

        socket.on('receive_message', handleReceive);
        return () => socket.off('receive_message', handleReceive);
    }, [socket]);

    useEffect(() => {
        const handleResults = ({ winnerId }) => {
            if (winnerId !== props?.user?._id) {
                setResult('lose');
                setWinnerPlayerId(winnerId);
                setBingopop(true);
                updateXPFromServer(false);
            }
        };

        socket.on('show_results', handleResults);
        return () => socket.off('show_results', handleResults);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleTurnOrder = (order) => {
            setTurnOrder(order);
            setMe(order.find(p => p.userId === props?.user?._id));
            if (!gameStartTimeRef.current) {
                gameStartTimeRef.current = Date.now();
            }
        };

        socket.on('turn_order', handleTurnOrder);

        socket.emit('join_room', {
            roomCode: props.roomCode,
            userId: props?.user?._id,
            username: props?.user?.username,
            avatar: props?.user?.avatar,
            gameType: props.gameType,
        });

        return () => socket.off('turn_order', handleTurnOrder);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket]);

    useEffect(() => {
        if (!gameStartTimeRef.current) return;

        const interval = setInterval(() => {
            const seconds = Math.floor(
                (Date.now() - gameStartTimeRef.current) / 1000
            );
            setElapsedSeconds(seconds);
        }, 1000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameStartTimeRef.current]);

    useEffect(() => {
        const backAction = () => true;
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, []);

    const playerPositions = {
        2: [{ top: '18%', right: '10%' }, { bottom: '17%', left: '10%' }],
        3: [{ top: '18%', left: '40%' }, { bottom: '17%', left: '15%' }, { bottom: '17%', right: '15%' }],
        4: [
            { top: '18%', left: '8%' },
            { top: '18%', right: '8%' },
            { bottom: '17%', left: '8%' },
            { bottom: '17%', right: '8%' },
        ],
        5: [
            { left: '8%', top: '22%' },
            { right: '8%', top: '22%' },
            { left: '8%', bottom: '17%' },
            { right: '8%', bottom: '17%' },
            { bottom: '17%', left: '45%' },
        ],
    };
    const positions = playerPositions[props.players] || [];

    useEffect(() => {
        if (!turnOrder?.length) return;
        const boards = {};
        const wins = {};
        turnOrder?.forEach(player => {
            const arr = Array.from({ length: 25 }, (_, i) => i + 1);
            shuffle(arr);
            boards[player?.userId] = arr;
            wins[player?.userId] = {
                B: false, I: false, N: false, G: false, O: false,
                claimedPatterns: [],
                completed: false,
            };
        });
        setPlayerBoards(boards);
        setPlayerWins(wins);
    }, [turnOrder]);

    const shuffle = (array) => {
        for (let i = array?.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    };

    useEffect(() => {
        if (!socket) return;

        socket.on('current_turn', (player) => setCurrentTurn(player?.userId));
        socket.on('number_picked', (numbers) => setPickedNumbers(numbers));

        return () => {
            socket.off('current_turn');
            socket.off('number_picked');
        };
    }, [socket]);

    const [me, setMe] = useState(null);

    const handleNumberPress = useCallback((num) => {
        if (currentTurn !== props?.user?._id) return;

        const myBoard = playerBoardsRef.current[props?.user?._id];
        if (!myBoard) return;

        setFloatingNumbers(prev => [...prev, num]);
        socket.emit('select_number', { roomCode: props.roomCode, number: num });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentTurn, socket, props.roomCode, props?.user?._id]);

    // ─── KEY FIX: stable callback for the AvatarTimer ───────────────────────────
    // Using useCallback with an empty dep array means this function reference
    // never changes between renders. It reads the board/pickedNumbers via refs
    // (kept in sync above) so it always has fresh data without being re-created.
    // Previously this was an inline arrow function in JSX, which created a new
    // function on every render and caused AvatarTimer's useEffect([duration, onComplete])
    // to fire on every render — resetting the animation continuously.
    // const handleTimerComplete = useCallback(() => {
    //     if (gameEndedRef.current) return;

    //     const myBoard = playerBoardsRef.current[props?.user?._id];
    //     const picked = pickedNumbersRef.current;

    //     const availableNumbers = myBoard?.filter(n => !picked.includes(n));
    //     if (!availableNumbers?.length) return;

    //     const randomNumber = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];

    //     setFloatingNumbers(prev => [...prev, randomNumber]);
    //     socket.emit('select_number', { roomCode: props.roomCode, number: randomNumber });
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, []); // ← intentionally empty: reads everything via refs

    useEffect(() => {
        if (!floatingNumbers?.length) return;

        const t = setTimeout(() => {
            setFloatingNumbers(prev => prev.slice(1));
        }, 1000);

        return () => clearTimeout(t);
    }, [floatingNumbers]);

    useEffect(() => {
        if (
            !turnOrder?.length ||
            !playerBoards[props.user._id] ||
            gameEndedRef.current
        ) return;

        checkBingo(props.user._id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pickedNumbers, turnOrder, playerBoards]);

    const [readyPlayers, setReadyPlayers] = useState({});

    const resetGameState = () => {
        setPickedNumbers([]);
        setPlayerBoards({});
        setPlayerWins({});
        setCurrentTurn(null);
        setResult('');
        setWinnerPlayerId(null);
        gameEndedRef.current = false;
    };

    useEffect(() => {
        if (!socket) return;

        const handleReadyUpdate = ({ readyPlayers: rp }) => setReadyPlayers(rp);
        const handleRestartGame = () => {
            resetGameState();
            setWinModal(false);
        };

        socket.on('ready_update', handleReadyUpdate);
        socket.on('restart_game', handleRestartGame);

        return () => {
            socket.off('ready_update', handleReadyUpdate);
            socket.off('restart_game', handleRestartGame);
        };
    }, [socket]);

    useEffect(() => {
        setTimeout(() => setLoading(false), 2000);
    }, []);

    const playAgain = () => {
        socket.emit('player_ready', { roomCode: props.roomCode, userId: props.user._id });
    };

    const checkBingo = (playerId) => {
        if (gameEndedRef.current) return;

        setPlayerWins(prev => {
            if (!playerBoards[playerId] || !prev[playerId]) return prev;

            const newWins = { ...prev };
            const playerData = { ...newWins[playerId] };
            const numbers = playerBoards[playerId];

            const columns = [
                [0, 5, 10, 15, 20], [1, 6, 11, 16, 21],
                [2, 7, 12, 17, 22], [3, 8, 13, 18, 23], [4, 9, 14, 19, 24],
            ];
            const rows = [
                [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14],
                [15, 16, 17, 18, 19], [20, 21, 22, 23, 24],
            ];
            const diagonals = [[0, 6, 12, 18, 24], [4, 8, 12, 16, 20]];

            const daubLetter = () => {
                const availableLetter = letters.find(l => !playerData[l]);
                if (availableLetter) playerData[availableLetter] = true;
            };

            const checkPatterns = (patterns, type) => {
                patterns.forEach((pattern, i) => {
                    const patternId = `${type}${i}`;
                    if (
                        !playerData.claimedPatterns.includes(patternId) &&
                        pattern.every(idx => pickedNumbers.includes(numbers[idx]))
                    ) {
                        daubLetter();
                        playerData.claimedPatterns = [...playerData.claimedPatterns, patternId];
                    }
                });
            };

            checkPatterns(columns, 'col');
            checkPatterns(rows, 'row');
            checkPatterns(diagonals, 'diag');

            let hasCompletedBingo = false;

            if (props.gameType === 'classic') {
                hasCompletedBingo = letters.every(l => playerData[l]);
            } else if (props.gameType === 'fast') {
                const daubedCount = letters.filter(l => playerData[l]).length;
                hasCompletedBingo = daubedCount >= 3;
            }

            if (hasCompletedBingo && !playerData.completed && !gameEndedRef.current) {
                gameEndedRef.current = true;
                playerData.completed = true;

                setResult(playerId === props.user._id ? 'win' : 'lose');
                setWinnerPlayerId(playerId === props.user._id ? props.user._id : null);
                setBingopop(true);

                updateXPFromServer(playerId === props.user._id);

                socket.emit('game_end', {
                    roomCode: props.roomCode,
                    winnerId: playerId,
                });
            }

            newWins[playerId] = playerData;
            return newWins;
        });
    };

    const openProfile = (player) => {
        avatarRef.current?.measureInWindow((x, y, width, height) => {
            setAnchor({ x, y, width, height });
            setProfileDetails(player);
            setProfileVisible(true);
        });
    };

    return (
        <>
            {loading ? (
                <Intro />
            ) : (
                <View style={styles.container}>
                    <Icon
                        name="sign-out-alt"
                        size={30}
                        style={[styles.exitIcon, { transform: [{ scaleX: -1 }] }]}
                        onPress={() => setShowAlert(true)}
                    />

                    <CustomAlert
                        visible={showAlert}
                        title="Exit Game"
                        message="Are you sure you want to leave? It will charge you 40 coins."
                        onCancel={() => setShowAlert(false)}
                        onConfirm={() => navigation.goBack()}
                    />

                    <ImageBackground
                        source={require('../images/gameScreen.jpg')}
                        style={{ width: '100%', height: '100%' }}
                    >
                        <View style={{ position: 'absolute', top: '3%', left: '40%' }}>
                            <Text style={styles.roomCode}>{props.roomCode}</Text>
                            <View style={styles.timerBox}>
                                <Icon name="clock" size={14} color="#FFD67A" />
                                <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>
                            </View>
                        </View>

                        <View style={{ flex: 1 }}>
                            {turnOrder?.map((player, index) => {
                                let pos = {};
                                if (player?.userId === props?.user?._id) {
                                    pos = { bottom: '17%', left: '10%' };
                                } else {
                                    const idx = otherPlayers.findIndex(p => p.userId === player?.userId);
                                    pos = positions[idx] || {};
                                }

                                const isCurrentTurn = player?.userId === currentTurn;

                                return (
                                    <View key={player?.userId} style={[styles.player, pos]}>
                                        <View
                                            style={{
                                                position: 'absolute',
                                                width: 70,
                                                height: 70,
                                                justifyContent: 'center',
                                                alignItems: 'center',
                                            }}
                                        >
                                            {/*
                                             * ─── KEY FIXES ────────────────────────────────────────
                                             * 1. gameEnded prop: tells the timer to stop its animation
                                             *    the moment the game ends, even mid-countdown.
                                             *
                                             * 2. onComplete={handleTimerComplete}: a stable useCallback
                                             *    reference that never changes between renders, so
                                             *    AvatarTimer's useEffect([duration]) never re-fires
                                             *    just because the parent re-rendered.
                                             * ──────────────────────────────────────────────────────
                                             */}
                                            {isCurrentTurn && (
                                                <AvatarTimer
                                                    key={currentTurn} // remount on every turn change
                                                    size={55}
                                                    duration={TURN_TIME}
                                                    gameEnded={gameEndedRef.current}
                                                    //onComplete={handleTimerComplete}
                                                />
                                            )}

                                            <TouchableOpacity
                                                ref={avatarRef}
                                                style={styles.userAvatar}
                                                onPress={() => openProfile(player)}
                                            >
                                                <View style={[styles.userAvatarImage, { backgroundColor: '#000' }]}>
                                                    <Text style={{ fontSize: 35 }}>{player?.avatar || '🐟'}</Text>
                                                </View>
                                            </TouchableOpacity>
                                        </View>

                                        <Text style={styles.userText}>
                                            {player?.userId === props?.user?._id ? 'Me' : player.username}
                                        </Text>
                                    </View>
                                );
                            })}

                            <View style={{ position: 'absolute', top: '50%', left: '12%' }}>
                                {floatingNumbers.map((num, i) => (
                                    <FloatingNumber key={i} number={num} />
                                ))}
                            </View>

                            {floatingMessages.map(msg => (
                                <FloatingMessage
                                    key={msg.id}
                                    text={msg.text}
                                    top={msg.top}
                                    onFinish={() =>
                                        setFloatingMessages(prev => prev.filter(m => m.id !== msg.id))
                                    }
                                />
                            ))}

                            <View style={{ position: 'absolute', top: '50%', right: '12%' }}>
                                {pickedNumbers.map((num, i) => (
                                    <FloatingNumber key={i} number={num} />
                                ))}
                            </View>

                            <ImageBackground
                                source={require('../images/BingoBoard (2).png')}
                                style={styles.board}
                            >
                                <View style={styles.grid}>
                                    {playerBoards[props?.user?._id]?.map((num, index) => {
                                        if (!num) return null;
                                        const isPicked = pickedNumbers.includes(num);
                                        const disabled = currentTurn !== props?.user?._id || isPicked;

                                        return (
                                            <TouchableOpacity
                                                key={index}
                                                disabled={disabled}
                                                onPress={() => handleNumberPress(num)}
                                                style={[
                                                    styles.box,
                                                    isPicked && { opacity: 0.7 },
                                                    disabled && { opacity: 0.4 },
                                                ]}
                                            >
                                                {isPicked && (
                                                    <Image
                                                        source={require('../images/daub (2).png')}
                                                        style={{
                                                            width: 40, height: 40,
                                                            position: 'absolute', opacity: 0.5,
                                                        }}
                                                    />
                                                )}
                                                <Text style={styles.numberText}>{num}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </ImageBackground>

                            {playerWins[props?.user?._id] && (
                                <View style={styles.bingowin}>
                                    {letters.map((letter, index) => {
                                        const daubed = playerWins[props?.user?._id]?.[letter];
                                        return (
                                            <View key={index} style={styles.bingoLetterContainer}>
                                                <View style={[styles.bingoLetter, daubed && styles.daubedLetter]}>
                                                    <Text style={[styles.letterText, daubed && styles.daubedText]}>
                                                        {letter}
                                                    </Text>
                                                </View>
                                                <FloatingBingoGhost letter={letter} trigger={daubed} />
                                            </View>
                                        );
                                    })}
                                </View>
                            )}
                        </View>

                        {/* INPUT BAR */}
                        <Animated.View
                            style={[
                                styles.inputContainer,
                                { bottom: Animated.add(keyboardHeight, 20) },
                            ]}
                        >
                            <TextInput
                                style={[styles.input, { height: inputHeight }]}
                                placeholder="Type a message..."
                                placeholderTextColor="#717171"
                                value={chatInput}
                                onChangeText={setChatInput}
                                multiline
                                textAlignVertical="top"
                                numberOfLines={4}
                                onContentSizeChange={(e) => {
                                    const newHeight = Math.min(120, e.nativeEvent.contentSize.height);
                                    setInputHeight(newHeight < 48 ? 48 : newHeight);
                                }}
                            />
                            <TouchableOpacity onPress={sendMessage} disabled={!chatInput.trim()}>
                                <Icon name="paper-plane" size={24} color="#ffffff" style={styles.sendIcon} />
                            </TouchableOpacity>
                            <Icon name="gift" size={24} color="#f708d7" />
                        </Animated.View>

                        {bingopop && !bingoShownRef.current && (
                            <BingoPopUp
                                delay={200}
                                onAnimationEnd={() => {
                                    bingoShownRef.current = true;
                                    setWinModal(true);
                                    setBingopop(false);
                                }}
                            />
                        )}
                    </ImageBackground>

                    <Modal transparent visible={winModal} animationType="fade">
                        <WinningModal
                            result={result}
                            matchedPlayers={props.matchedPlayers}
                            onClose={handleWinModalClose}
                            winnerPlayerId={winnerPlayerId}
                            playAgain={playAgain}
                            readyPlayers={readyPlayers}
                            user={props.user}
                            gameType={props.gameType}
                        />
                    </Modal>

                    {profileDetails && profileVisible && (
                        <Modal
                            visible={profileVisible}
                            transparent
                            animationType="fade"
                            statusBarTranslucent
                        >
                            <ProfileModal
                                visible={profileVisible}
                                anchor={anchor}
                                user={profileDetails}
                                onClose={() => setProfileVisible(false)}
                                myId={props.user._id}
                                myUsername= {props.user.username}
                                myAvatar= {props.user.avatar}
                            />
                        </Modal>
                    )}

                    <LevelModal
                        visible={levelModalVisible}
                        didWin={result === 'win'}
                        currentLevel={xpResult?.level}
                        currentStars={xpResult?.stars}
                        onClose={() => navigation.navigate('Dashboard')}
                    />

                    {!!xpResult && (
                        <XPModal
                            visible={xpModalVisible && !!xpResult}
                            earnedXP={xpResult?.earnedXP}
                            oldXP={xpResult?.levelXp}
                            newXP={xpResult?.levelXp + xpResult?.earnedXP}
                            xpNeeded={xpResult?.xpNeeded}
                            starGained={xpResult?.starGained}
                            onFinish={() => {
                                setTimeout(() => {
                                    setXpModalVisible(false);
                                    setLevelModalVisible(true);
                                }, 3000);
                            }}
                        />
                    )}
                </View>
            )}
        </>
    );
};

export default GameScreen;

const styles = StyleSheet.create({
    container: { flex: 1, width: '100%', height: '100%' },
    timerBox: {
        position: 'absolute',
        top: 60,
        alignSelf: 'center',
        flexDirection: 'row',
        gap: 6,
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#FFD67A',
    },
    timerText: { color: '#FFD67A', fontWeight: 'bold', fontSize: 14 },
    player: { position: 'absolute', alignItems: 'center' },
    userAvatar: {
        width: 55, height: 55, borderRadius: 30,
        borderWidth: 2, borderColor: '#fff', padding: 1,
    },
    userAvatarImage: {
        width: '100%', height: '100%', objectFit: 'contain',
        borderRadius: 50, display: 'flex', justifyContent: 'center', alignItems: 'center',
    },
    userText: { color: '#fff', fontWeight: 'bold', marginTop: 70 },
    board: {
        position: 'absolute', top: '30%',
        width: 350, height: 350, alignSelf: 'center',
    },
    grid: {
        width: '100%', height: '100%',
        paddingTop: '25%', paddingBottom: '10%',
        paddingLeft: '18%', paddingRight: '18%',
        flexDirection: 'row', flexWrap: 'wrap',
    },
    bingowin: {
        flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
        position: 'absolute', bottom: '28%', width: '70%', alignSelf: 'center',
    },
    bingoLetterContainer: {
        width: 50, height: 50, justifyContent: 'center',
        alignItems: 'center', position: 'relative',
    },
    bingoLetter: {
        width: 50, height: 50, borderRadius: 25,
        backgroundColor: '#F8B55F', justifyContent: 'center', alignItems: 'center',
    },
    daubedLetter: { backgroundColor: '#FFD700', borderWidth: 2, borderColor: '#000' },
    letterText: { fontSize: 22, fontWeight: 'bold', color: '#F00', borderColor: '#F00' },
    daubedText: { color: '#000' },
    daubIcon: { width: 30, height: 30, position: 'absolute', opacity: 0.5 },
    box: { width: '20%', height: '20%', justifyContent: 'center', alignItems: 'center' },
    numberText: { fontSize: 19, fontWeight: 'bold', color: '#000' },
    exitIcon: { position: 'absolute', top: 50, left: 20, color: '#F8B55F', zIndex: 10 },
    roomCode: { color: '#fff', fontSize: 20, fontWeight: 'bold', alignSelf: 'center', marginTop: 20 },
    inputContainer: {
        flex: 1, flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 12, paddingVertical: 10,
        position: 'absolute', bottom: 20, left: 20, right: 20,
    },
    input: {
        flex: 1, height: 48, borderWidth: 1, borderColor: '#ccc',
        borderRadius: 25, paddingHorizontal: 18, backgroundColor: '#fff',
        fontSize: 16, color: '#000', marginRight: 10,
    },
    sendIcon: { marginRight: 12 },
});