/* eslint-disable no-shadow */
/* eslint-disable react-hooks/exhaustive-deps */
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
    Dimensions,
    FlatList,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';
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

// ─────────────────────────────────────────────
// POWER DEFINITIONS
// ─────────────────────────────────────────────
const POWER_GROUPS = {
    EXTRA_TURN: ['Swift Dash', 'Pack Howl', 'Dominance', 'Blood Frenzy', 'Panic Flap'],
    FREE_MARK: ['Shadow Step', 'Mega Jump'],
    RANDOM_MARK: ['Tree Leap', 'Tracker Sense', 'Charge Run'],
    FREEZE: ['Fear Aura', 'Hoof Strike', 'Venom Bite'],
    IMMUNITY: ['Loyal Guard', 'Iron Hide', 'Steadfast'],
    REMOVE_MARK: ['Silent Claws', 'Ambush Pounce', 'Sneak Bite', 'Sticky Tongue', 'Egg Bomb', 'Ground Slam'],
    REFLECT: ['Nine Lives', 'Poison Skin', 'Feather Shield', 'Tiny Target'],
    NOT_IMPLEMENTED: ['Mischief Steal', "King's Roar", 'Predator Focus', 'Illusion Clone', 'Trick Swap', 'Mind Games', 'Quick Escape', 'Coil Trap', 'Heat Sense'],
};

const getPowerGroup = (power) => {
    for (const [group, powers] of Object.entries(POWER_GROUPS)) {
        if (powers.includes(power)) return group;
    }
    return null;
};

const needsTarget = (power) => {
    const group = getPowerGroup(power);
    return group === 'FREEZE' || group === 'REMOVE_MARK';
};

// ─────────────────────────────────────────────
// FLOATING POWER NOTIFICATION
// ─────────────────────────────────────────────
const PowerNotification = ({ message, onFinish }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.sequence([
            Animated.parallel([
                Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
                Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
            ]),
            Animated.delay(2200),
            Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]).start(() => onFinish && onFinish());
    }, []);

    return (
        <Animated.View style={[styles.powerNotif, { opacity, transform: [{ translateY }] }]}>
            <Text style={styles.powerNotifText}>{message}</Text>
        </Animated.View>
    );
};

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
const GameScreenPower = (props) => {
    const navigation = useNavigation();
    const socketRef = useSocket();
    const socket = socketRef?.socket;

    // ── Existing state ──
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
    const [me, setMe] = useState(null);
    const [readyPlayers, setReadyPlayers] = useState({});

    // ── Power state ──
    const [usedPower, setUsedPower] = useState(false);
    const [powerMode, setPowerMode] = useState(false);         // FREE_MARK board-click mode
    const [selectedTarget, setSelectedTarget] = useState(null);
    const [activeEffects, setActiveEffects] = useState({});     // { userId: { frozenUntil, immuneUntil, reflectNext } }
    const [targetModalVisible, setTargetModalVisible] = useState(false);
    const [powerNotifications, setPowerNotifications] = useState([]);

    // ─────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────
    const addPowerNotif = (message) => {
        const id = `${Date.now()}-${Math.random()}`;
        setPowerNotifications(prev => [...prev, { id, message }]);
    };

    const removePowerNotif = (id) => {
        setPowerNotifications(prev => prev.filter(n => n.id !== id));
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const isFrozen = (userId) => {
        const fx = activeEffects[userId];
        return fx?.frozenUntil && fx.frozenUntil > Date.now();
    };

    const isImmune = (userId) => {
        const fx = activeEffects[userId];
        return fx?.immuneUntil && fx.immuneUntil > Date.now();
    };

    const hasReflect = (userId) => {
        return activeEffects[userId]?.reflectNext === true;
    };

    // ─────────────────────────────────────────
    // ACTIVATE POWER — entry point from button
    // ─────────────────────────────────────────
    const activatePower = () => {
        if (usedPower) return;
        const power = props.selectedPower;
        if (!power) return;

        const group = getPowerGroup(power);

        if (group === 'NOT_IMPLEMENTED') {
            socket.emit('use_power', {
                roomCode: props.roomCode,
                userId: props.user._id,
                power,
                group: 'NOT_IMPLEMENTED',
            });
            return;
        }

        if (group === 'FREEZE' || group === 'REMOVE_MARK') {
            // need to pick a target first
            setTargetModalVisible(true);
            return;
        }

        if (group === 'FREE_MARK') {
            setPowerMode(true);
            addPowerNotif(`${power} activated — tap a number`);
            return;
        }

        // All other groups: emit immediately
        socket.emit('use_power', {
            roomCode: props.roomCode,
            userId: props.user._id,
            power,
            group,
        });
    };

    // Called after target selected in modal
    const confirmTargetedPower = () => {
        if (!selectedTarget) return;
        const power = props.selectedPower;
        const group = getPowerGroup(power);

        socket.emit('use_power', {
            roomCode: props.roomCode,
            userId: props.user._id,
            power,
            group,
            targetId: selectedTarget,
        });

        setTargetModalVisible(false);
        setSelectedTarget(null);
    };

    // ─────────────────────────────────────────
    // BOARD PRESS — respects powerMode
    // ─────────────────────────────────────────
    const handleNumberPress = (num) => {
        if (powerMode) {
            // FREE_MARK: emit power with chosen number
            socket.emit('use_power', {
                roomCode: props.roomCode,
                userId: props.user._id,
                power: props.selectedPower,
                group: 'FREE_MARK',
                number: num,
            });
            setPowerMode(false);
            setUsedPower(true);
            return;
        }

        if (currentTurn !== props?.user?._id) return;
        const myBoard = playerBoards[props?.user?._id];
        if (!myBoard) return;

        setFloatingNumbers(prev => [...prev, num]);
        socket.emit('select_number', { roomCode: props.roomCode, number: num });
    };

    // ─────────────────────────────────────────
    // SOCKET LISTENERS — power events
    // ─────────────────────────────────────────
    useEffect(() => {
        if (!socket) return;

        // Power successfully executed
        socket.on('power_used', ({ power, userId, group, message }) => {
            addPowerNotif(message || `${power} activated`);
            if (userId === props.user._id) {
                setUsedPower(true);
                setPowerMode(false);
            }
        });

        // Power effects (frozen, immune, reflect applied)
        socket.on('power_effect', ({ effect, targetId, value }) => {
            setActiveEffects(prev => ({
                ...prev,
                [targetId]: { ...prev[targetId], [effect]: value },
            }));
        });

        // Power failed (immunity, already used, etc.)
        socket.on('power_failed', ({ reason }) => {
            addPowerNotif(`⚠️ ${reason}`);
            setPowerMode(false);
        });

        // Power reflected back
        socket.on('power_reflected', ({ power, reflectedTo, reflectedFrom }) => {
            addPowerNotif(`↩ ${power} reflected!`);
        });

        // Mark removed (REMOVE_MARK group)
        socket.on('mark_removed', ({ targetId, number }) => {
            if (targetId === props.user._id) {
                setPickedNumbers(prev => {
                    const idx = prev.lastIndexOf(number);
                    if (idx === -1) return prev;
                    const next = [...prev];
                    next.splice(idx, 1);
                    return next;
                });
                addPowerNotif('❌ One of your marks was removed!');
            }
        });

        // Player frozen
        socket.on('player_frozen', ({ targetId, frozenUntil, message }) => {
            setActiveEffects(prev => ({
                ...prev,
                [targetId]: { ...prev[targetId], frozenUntil },
            }));
            addPowerNotif(message || `❄ Player frozen for 5s`);
        });

        // Player immune
        socket.on('player_immune', ({ userId: uid, immuneUntil, message }) => {
            setActiveEffects(prev => ({
                ...prev,
                [uid]: { ...prev[uid], immuneUntil },
            }));
            addPowerNotif(message || `🛡 Immunity activated`);
        });

        // Extra turn given
        socket.on('extra_turn', ({ playerId }) => {
            setCurrentTurn(playerId);
        });

        // Not implemented placeholder
        socket.on('power_not_implemented', ({ power }) => {
            addPowerNotif(`⚙️ ${power} coming soon!`);
            setUsedPower(true);
        });

        return () => {
            socket.off('power_used');
            socket.off('power_effect');
            socket.off('power_failed');
            socket.off('power_reflected');
            socket.off('mark_removed');
            socket.off('player_frozen');
            socket.off('player_immune');
            socket.off('extra_turn');
            socket.off('power_not_implemented');
        };
    }, [socket]);

    // ─────────────────────────────────────────
    // EXISTING SOCKET LISTENERS (preserved)
    // ─────────────────────────────────────────
    useEffect(() => {
        if (!socket) return;
        socket.on('current_turn', (player) => setCurrentTurn(player?.userId));
        socket.on('number_picked', (numbers) => setPickedNumbers(numbers));
        return () => {
            socket.off('current_turn');
            socket.off('number_picked');
        };
    }, [socket]);

    useEffect(() => {
        if (!socket) return;
        const handleReadyUpdate = ({ readyPlayers }) => setReadyPlayers(readyPlayers);
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
    }, []);

    useEffect(() => {
        if (!socket) return;
        const handleReceive = (data) => {
            setFloatingMessages(prev => [...prev, {
                id: `${Date.now()}-${Math.random()}`,
                text: `${data.username}: ${data.text}`,
                top: Math.random() * 250 + 120,
            }]);
        };
        socket.on('receive_message', handleReceive);
        return () => socket.off('receive_message', handleReceive);
    }, [socket]);

    useEffect(() => {
        if (!socket || !props.roomCode) return;
        socket.emit('join_chat_room', props.roomCode);
    }, [socket, props.roomCode]);

    useEffect(() => {
        if (!socket) return;
        const handleTurnOrder = (order) => {
            setTurnOrder(order);
            setMe(order.find(p => p.userId === props?.user?._id));
            if (!gameStartTimeRef.current) gameStartTimeRef.current = Date.now();
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
    }, [socket]);

    // ─────────────────────────────────────────
    // TIMERS & KEYBOARD
    // ─────────────────────────────────────────
    useEffect(() => {
        if (currentTurn !== props?.user?._id) return;
        setTimer(TURN_TIME);
        const interval = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) { clearInterval(interval); return 0; }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [currentTurn]);

    useEffect(() => {
        if (!gameStartTimeRef.current) return;
        const interval = setInterval(() => {
            setElapsedSeconds(Math.floor((Date.now() - gameStartTimeRef.current) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [gameStartTimeRef.current]);

    useEffect(() => {
        const showSub = Keyboard.addListener('keyboardDidShow', (e) => {
            Animated.timing(keyboardHeight, { toValue: e.endCoordinates.height, duration: 250, useNativeDriver: false }).start();
        });
        const hideSub = Keyboard.addListener('keyboardDidHide', () => {
            Animated.timing(keyboardHeight, { toValue: 0, duration: 200, useNativeDriver: false }).start();
        });
        return () => { showSub.remove(); hideSub.remove(); };
    }, []);

    useEffect(() => {
        const backAction = () => true;
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, []);

    useEffect(() => {
        setTimeout(() => setLoading(false), 2000);
    }, []);

    // ─────────────────────────────────────────
    // BOARD GENERATION
    // ─────────────────────────────────────────
    useEffect(() => {
        if (!turnOrder?.length) return;
        const boards = {};
        const wins = {};
        turnOrder?.forEach(player => {
            const arr = Array.from({ length: 25 }, (_, i) => i + 1);
            shuffle(arr);
            boards[player?.userId] = arr;
            wins[player?.userId] = { B: false, I: false, N: false, G: false, O: false, claimedPatterns: [], completed: false };
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

    // ─────────────────────────────────────────
    // FLOATING NUMBERS CLEANUP
    // ─────────────────────────────────────────
    useEffect(() => {
        if (!floatingNumbers?.length) return;
        const t = setTimeout(() => setFloatingNumbers(prev => prev.slice(1)), 1000);
        return () => clearTimeout(t);
    }, [floatingNumbers]);

    // ─────────────────────────────────────────
    // BINGO CHECK
    // ─────────────────────────────────────────
    useEffect(() => {
        if (!turnOrder?.length || !playerBoards[props.user._id] || gameEndedRef.current) return;
        checkBingo(props.user._id);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pickedNumbers, turnOrder, playerBoards]);

    const checkBingo = (playerId) => {
        if (gameEndedRef.current) return;
        setPlayerWins(prev => {
            if (!playerBoards[playerId] || !prev[playerId]) return prev;
            const newWins = { ...prev };
            const playerData = { ...newWins[playerId] };
            const numbers = playerBoards[playerId];
            const columns = [[0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23], [4, 9, 14, 19, 24]];
            const rows = [[0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24]];
            const diagonals = [[0, 6, 12, 18, 24], [4, 8, 12, 16, 20]];
            const daubLetter = () => {
                const availableLetter = letters.find(l => !playerData[l]);
                if (availableLetter) playerData[availableLetter] = true;
            };
            const checkPatterns = (patterns, type) => {
                patterns.forEach((pattern, i) => {
                    const patternId = `${type}${i}`;
                    if (!playerData.claimedPatterns.includes(patternId) &&
                        pattern.every(idx => pickedNumbers.includes(numbers[idx]))) {
                        daubLetter();
                        playerData.claimedPatterns = [...playerData.claimedPatterns, patternId];
                    }
                });
            };
            checkPatterns(columns, 'col');
            checkPatterns(rows, 'row');
            checkPatterns(diagonals, 'diag');
            let hasCompletedBingo = false;
            if (props.gameType === 'classic') hasCompletedBingo = letters.every(l => playerData[l]);
            else if (props.gameType === 'fast') hasCompletedBingo = letters.filter(l => playerData[l]).length >= 3;
            if (hasCompletedBingo && !playerData.completed && !gameEndedRef.current) {
                gameEndedRef.current = true;
                playerData.completed = true;
                setResult(playerId === props.user._id ? 'win' : 'lose');
                setWinnerPlayerId(playerId === props.user._id ? props.user._id : null);
                setBingopop(true);
                updateXPFromServer(playerId === props.user._id);
                socket.emit('game_end', { roomCode: props.roomCode, winnerId: playerId });
            }
            newWins[playerId] = playerData;
            return newWins;
        });
    };

    // ─────────────────────────────────────────
    // MISC HELPERS
    // ─────────────────────────────────────────
    const resetGameState = () => {
        setPickedNumbers([]);
        setPlayerBoards({});
        setPlayerWins({});
        setCurrentTurn(null);
        setResult('');
        setWinnerPlayerId(null);
        gameEndedRef.current = false;
        setUsedPower(false);
        setPowerMode(false);
        setActiveEffects({});
    };

    const playAgain = () => {
        socket.emit('player_ready', { roomCode: props.roomCode, userId: props.user._id });
    };

    const sendMessage = () => {
        if (!chatInput.trim()) return;
        socket.emit('send_message', { roomCode: props.roomCode, username: props.user.username, text: chatInput.trim() });
        setChatInput('');
    };

    const updateXPFromServer = async (didWin, gameType = props.gameType, playerCount = props.players) => {
        if (xpUpdatedRef.current) return;
        xpUpdatedRef.current = true;
        try {
            const token = await AsyncStorage.getItem('authToken');
            oldXpRef.current = props.user.xp;
            const duration = gameStartTimeRef.current ? Math.floor((Date.now() - gameStartTimeRef.current) / 1000) : 0;
            const res = await fetch(`${BACKEND_URL}/api/games/update-progress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'auth-token': token },
                body: JSON.stringify({ gameId: props.roomCode, didWin, gameType, playerCount, duration }),
            });
            const data = await res.json();
            setXpResult({ ...data, oldXP: oldXpRef.current });
        } catch (e) { console.log(e); }
    };

    const handleWinModalClose = () => {
        setWinModal(false);
        setXpModalVisible(true);
    };

    const openProfile = (player) => {
        avatarRef.current?.measureInWindow((x, y, width, height) => {
            setAnchor({ x, y, width, height });
            setProfileDetails(player);
            setProfileVisible(true);
        });
    };

    // ─────────────────────────────────────────
    // PLAYER POSITIONS
    // ─────────────────────────────────────────
    const playerPositions = {
        2: [{ top: '18%', right: '10%' }, { bottom: '17%', left: '10%' }],
        3: [{ top: '18%', left: '40%' }, { bottom: '17%', left: '15%' }, { bottom: '17%', right: '15%' }],
        4: [{ top: '18%', left: '8%' }, { top: '18%', right: '8%' }, { bottom: '17%', left: '8%' }, { bottom: '17%', right: '8%' }],
        5: [{ left: '8%', top: '22%' }, { right: '8%', top: '22%' }, { left: '8%', bottom: '17%' }, { right: '8%', bottom: '17%' }, { bottom: '17%', left: '45%' }],
    };
    const positions = playerPositions[props.players] || [];

    // ─────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────
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
                        {/* ROOM CODE + TIMER */}
                        <View style={{ position: 'absolute', top: '3%', left: '40%' }}>
                            <Text style={styles.roomCode}>{props.roomCode}</Text>
                            <View style={styles.timerBox}>
                                <Icon name="clock" size={14} color="#FFD67A" />
                                <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>
                            </View>
                        </View>

                        {/* POWER NOTIFICATIONS */}
                        <View style={styles.powerNotifsContainer} pointerEvents="none">
                            {powerNotifications.map(n => (
                                <PowerNotification
                                    key={n.id}
                                    message={n.message}
                                    onFinish={() => removePowerNotif(n.id)}
                                />
                            ))}
                        </View>

                        <View style={{ flex: 1 }}>
                            {/* PLAYER AVATARS */}
                            {turnOrder?.map((player, index) => {
                                let pos = {};
                                if (player?.userId === props?.user?._id) {
                                    pos = { bottom: '17%', left: '10%' };
                                } else {
                                    const idx = otherPlayers.findIndex(p => p.userId === player?.userId);
                                    pos = positions[idx] || {};
                                }
                                const isCurrentTurn = player?.userId === currentTurn;
                                const frozen = isFrozen(player.userId);
                                const immune = isImmune(player.userId);
                                const reflect = hasReflect(player.userId);

                                return (
                                    <View key={player?.userId} style={[styles.player, pos]}>
                                        <View style={{ position: 'absolute', width: 70, height: 70, justifyContent: 'center', alignItems: 'center' }}>
                                            {isCurrentTurn && (
                                                <AvatarTimer
                                                    size={55}
                                                    duration={TURN_TIME}
                                                    onComplete={() => {
                                                        const availableNumbers = playerBoards[player.userId]?.filter(n => !pickedNumbers.includes(n));
                                                        if (!availableNumbers?.length) return;
                                                        const randomNumber = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
                                                        handleNumberPress(randomNumber);
                                                    }}
                                                />
                                            )}
                                            <TouchableOpacity
                                                ref={avatarRef}
                                                style={[
                                                    styles.userAvatar,
                                                    frozen && { borderColor: '#00BFFF', borderWidth: 3 },
                                                    immune && { borderColor: '#FFD700', borderWidth: 3 },
                                                ]}
                                                onPress={() => openProfile(player)}
                                            >
                                                <View style={[styles.userAvatarImage, { backgroundColor: '#000' }]}>
                                                    <Text style={{ fontSize: 35 }}>{player?.avatar || '🐟'}</Text>
                                                </View>
                                            </TouchableOpacity>

                                            {/* Status indicators */}
                                            <View style={styles.effectBadges}>
                                                {frozen && <Text style={styles.effectBadge}>❄</Text>}
                                                {immune && <Text style={styles.effectBadge}>🛡</Text>}
                                                {reflect && <Text style={styles.effectBadge}>↩</Text>}
                                            </View>
                                        </View>
                                        <Text style={styles.userText}>
                                            {player?.userId === props?.user?._id ? 'Me' : player.username}
                                        </Text>
                                    </View>
                                );
                            })}

                            {/* FLOATING NUMBERS */}
                            <View style={{ position: 'absolute', top: '50%', left: '12%' }}>
                                {floatingNumbers.map((num, i) => (
                                    <FloatingNumber key={i} number={num} />
                                ))}
                            </View>

                            {/* FLOATING CHAT MESSAGES */}
                            {floatingMessages.map(msg => (
                                <FloatingMessage
                                    key={msg.id}
                                    text={msg.text}
                                    top={msg.top}
                                    onFinish={() => setFloatingMessages(prev => prev.filter(m => m.id !== msg.id))}
                                />
                            ))}

                            <View style={{ position: 'absolute', top: '50%', right: '12%' }}>
                                {pickedNumbers.map((num, index) => (
                                    <FloatingNumber key={index} number={num} />
                                ))}
                            </View>

                            {/* BINGO BOARD */}
                            <ImageBackground
                                source={require('../images/BingoBoard (2).png')}
                                style={[styles.board, powerMode && styles.boardPowerActive]}
                            >
                                {powerMode && (
                                    <View style={styles.powerModeOverlay} pointerEvents="none">
                                        <Text style={styles.powerModeOverlayText}>Tap a number</Text>
                                    </View>
                                )}
                                <View style={styles.grid}>
                                    {playerBoards[props?.user?._id]?.map((num, index) => {
                                        if (!num) return null;
                                        const isPicked = pickedNumbers.includes(num);
                                        // In power mode, allow any unpicked number click
                                        const disabled = powerMode
                                            ? isPicked
                                            : (currentTurn !== props?.user?._id || isPicked);

                                        return (
                                            <TouchableOpacity
                                                key={index}
                                                disabled={disabled}
                                                onPress={() => handleNumberPress(num)}
                                                style={[
                                                    styles.box,
                                                    isPicked && { opacity: 0.7 },
                                                    disabled && { opacity: 0.4 },
                                                    powerMode && !isPicked && styles.boxPowerHighlight,
                                                ]}
                                            >
                                                {isPicked && (
                                                    <Image
                                                        source={require('../images/daub (2).png')}
                                                        style={{ width: 40, height: 40, position: 'absolute', opacity: 0.5 }}
                                                    />
                                                )}
                                                <Text style={styles.numberText}>{num}</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </ImageBackground>

                            {/* BINGO LETTERS */}
                            {playerWins[props?.user?._id] && (
                                <View style={styles.bingowin}>
                                    {letters.map((letter, index) => {
                                        const daubed = playerWins[props?.user?._id]?.[letter];
                                        return (
                                            <View key={index} style={styles.bingoLetterContainer}>
                                                <View style={[styles.bingoLetter, daubed && styles.daubedLetter]}>
                                                    <Text style={[styles.letterText, daubed && styles.daubedText]}>{letter}</Text>
                                                </View>
                                                <FloatingBingoGhost letter={letter} trigger={daubed} />
                                            </View>
                                        );
                                    })}
                                </View>
                            )}
                        </View>

                        {/* POWER BUTTON */}
                        <View style={{ bottom: 150, left: 25, justifyContent: 'space-between', display: 'flex' }}>
                            <TouchableOpacity
                                style={[
                                    styles.powerButton,
                                    usedPower && styles.powerButtonUsed,
                                    powerMode && styles.powerButtonActive,
                                ]}
                                onPress={activatePower}
                                disabled={usedPower}
                            >
                                <Text style={{ fontSize: 34 }}>{props.selectedPowerAvatar}</Text>
                                {usedPower && (
                                    <View style={styles.usedOverlay}>
                                        <Text style={styles.usedOverlayText}>USED</Text>
                                    </View>
                                )}
                                {powerMode && (
                                    <View style={styles.activeModeRing} />
                                )}
                            </TouchableOpacity>
                            <View style={{ marginTop: 13, marginLeft: 75 }}>
                                <Text style={{ fontSize: 15, color: '#fff' }}>{props.selectedPower}</Text>
                            </View>
                        </View>

                        {/* CHAT INPUT */}
                        <Animated.View
                            style={[styles.inputContainer, { bottom: Animated.add(keyboardHeight, 20) }]}
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
                            {chatInput.trim() && (
                                <TouchableOpacity onPress={sendMessage} disabled={!chatInput.trim()}>
                                    <Icon name="paper-plane" size={24} color="#ffffff" style={styles.sendIcon} />
                                </TouchableOpacity>
                            )}
                            <Icon name="gift" size={24} color="#f708d7" />
                        </Animated.View>

                        {/* BINGO POP */}
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

                    {/* WIN MODAL */}
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

                    {/* PROFILE MODAL */}
                    {profileDetails && profileVisible && (
                        <Modal visible={profileVisible} transparent animationType="fade" statusBarTranslucent>
                            <ProfileModal
                                visible={profileVisible}
                                anchor={anchor}
                                user={profileDetails}
                                onClose={() => setProfileVisible(false)}
                                myId={props.user._id}
                            />
                        </Modal>
                    )}

                    {/* TARGET SELECTION MODAL */}
                    <Modal
                        visible={targetModalVisible}
                        transparent
                        animationType="slide"
                        onRequestClose={() => { setTargetModalVisible(false); setSelectedTarget(null); }}
                    >
                        <View style={styles.targetModalOverlay}>
                            <View style={styles.targetModalBox}>
                                <Text style={styles.targetModalTitle}>Select Target</Text>
                                <Text style={styles.targetModalSub}>
                                    {getPowerGroup(props.selectedPower) === 'FREEZE'
                                        ? '❄ Choose player to freeze for 5s'
                                        : '❌ Choose player to remove a mark'}
                                </Text>
                                <FlatList
                                    data={otherPlayers}
                                    keyExtractor={item => item.userId}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={[
                                                styles.targetItem,
                                                selectedTarget === item.userId && styles.targetItemSelected,
                                            ]}
                                            onPress={() => setSelectedTarget(item.userId)}
                                        >
                                            <Text style={styles.targetAvatar}>{item.avatar || '🐟'}</Text>
                                            <Text style={styles.targetName}>{item.username}</Text>
                                            {selectedTarget === item.userId && (
                                                <Icon name="check-circle" size={20} color="#FFD700" />
                                            )}
                                        </TouchableOpacity>
                                    )}
                                />
                                <View style={styles.targetModalButtons}>
                                    <TouchableOpacity
                                        style={[styles.targetModalBtn, { backgroundColor: '#555' }]}
                                        onPress={() => { setTargetModalVisible(false); setSelectedTarget(null); }}
                                    >
                                        <Text style={styles.targetModalBtnText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.targetModalBtn, { backgroundColor: selectedTarget ? '#FFD700' : '#888' }]}
                                        onPress={confirmTargetedPower}
                                        disabled={!selectedTarget}
                                    >
                                        <Text style={[styles.targetModalBtnText, { color: '#000' }]}>Confirm</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>

                    {/* LEVEL + XP MODALS */}
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

export default GameScreenPower;

// ─────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────
const styles = StyleSheet.create({
    container: { flex: 1, width: '100%', height: '100%' },
    timerBox: {
        position: 'absolute', top: 60, alignSelf: 'center', flexDirection: 'row', gap: 6,
        backgroundColor: 'rgba(0,0,0,0.4)', paddingHorizontal: 12, paddingVertical: 6,
        borderRadius: 20, borderWidth: 2, borderColor: '#FFD67A',
    },
    timerText: { color: '#FFD67A', fontWeight: 'bold', fontSize: 14 },
    player: { position: 'absolute', alignItems: 'center' },
    userAvatar: { width: 55, height: 55, borderRadius: 30, borderWidth: 2, borderColor: '#fff', padding: 1 },
    userAvatarImage: { width: '100%', height: '100%', objectFit: 'contain', borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
    userText: { color: '#fff', fontWeight: 'bold', marginTop: 70 },
    effectBadges: { flexDirection: 'row', position: 'absolute', bottom: -18, gap: 2 },
    effectBadge: { fontSize: 14 },
    board: { position: 'absolute', top: '30%', width: 350, height: 350, alignSelf: 'center' },
    boardPowerActive: { borderWidth: 3, borderColor: '#FFD700', borderRadius: 8 },
    powerModeOverlay: {
        position: 'absolute', top: '28%', alignSelf: 'center',
        backgroundColor: 'rgba(255,215,0,0.85)', paddingHorizontal: 12, paddingVertical: 4,
        borderRadius: 12, zIndex: 10,
    },
    powerModeOverlayText: { color: '#000', fontWeight: 'bold', fontSize: 13 },
    grid: {
        width: '100%', height: '100%', paddingTop: '25%', paddingBottom: '10%',
        paddingLeft: '18%', paddingRight: '18%', flexDirection: 'row', flexWrap: 'wrap',
    },
    bingowin: {
        flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
        position: 'absolute', bottom: '28%', width: '70%', alignSelf: 'center',
    },
    bingoLetterContainer: { width: 50, height: 50, justifyContent: 'center', alignItems: 'center', position: 'relative' },
    bingoLetter: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#F8B55F', justifyContent: 'center', alignItems: 'center' },
    daubedLetter: { backgroundColor: '#FFD700', borderWidth: 2, borderColor: '#000' },
    letterText: { fontSize: 22, fontWeight: 'bold', color: '#F00' },
    daubedText: { color: '#000' },
    box: { width: '20%', height: '20%', justifyContent: 'center', alignItems: 'center' },
    boxPowerHighlight: { backgroundColor: 'rgba(255,215,0,0.3)', borderRadius: 6, borderWidth: 1, borderColor: '#FFD700' },
    numberText: { fontSize: 19, fontWeight: 'bold', color: '#000' },
    exitIcon: { position: 'absolute', top: 50, left: 20, color: '#F8B55F', zIndex: 10 },
    roomCode: { color: '#fff', fontSize: 20, fontWeight: 'bold', alignSelf: 'center', marginTop: 20 },
    inputContainer: {
        flex: 1, flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 12, paddingVertical: 10, position: 'absolute', bottom: 20, left: 20, right: 20,
    },
    input: {
        flex: 1, height: 48, borderWidth: 1, borderColor: '#ccc', borderRadius: 25,
        paddingHorizontal: 18, backgroundColor: '#fff', fontSize: 16, color: '#000', marginRight: 10,
    },
    sendIcon: { marginRight: 12 },
    powerButton: {
        position: 'absolute', borderRadius: 30, height: 55, width: 55,
        backgroundColor: '#f8b65f5d', justifyContent: 'center', alignItems: 'center', zIndex: 10, overflow: 'hidden',
    },
    powerButtonUsed: { opacity: 0.4 },
    powerButtonActive: { borderWidth: 2, borderColor: '#FFD700', backgroundColor: 'rgba(255,215,0,0.2)' },
    usedOverlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', borderRadius: 30,
    },
    usedOverlayText: { color: '#fff', fontWeight: 'bold', fontSize: 10 },
    activeModeRing: {
        position: 'absolute', top: -4, left: -4, right: -4, bottom: -4,
        borderRadius: 34, borderWidth: 2, borderColor: '#FFD700',
    },
    powerNotifsContainer: {
        position: 'absolute', top: '8%', alignSelf: 'center',
        zIndex: 999, alignItems: 'center', gap: 6,
    },
    powerNotif: {
        backgroundColor: 'rgba(20,20,20,0.88)', paddingHorizontal: 18, paddingVertical: 8,
        borderRadius: 20, borderWidth: 1, borderColor: '#FFD700',
    },
    powerNotifText: { color: '#FFD700', fontWeight: 'bold', fontSize: 14 },
    // Target Modal
    targetModalOverlay: {
        flex: 1, backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center', alignItems: 'center',
    },
    targetModalBox: {
        width: '80%', backgroundColor: '#1a1a2e', borderRadius: 20,
        padding: 20, borderWidth: 1, borderColor: '#FFD700',
    },
    targetModalTitle: { color: '#FFD700', fontSize: 20, fontWeight: 'bold', marginBottom: 6, textAlign: 'center' },
    targetModalSub: { color: '#ccc', fontSize: 13, marginBottom: 16, textAlign: 'center' },
    targetItem: {
        flexDirection: 'row', alignItems: 'center', gap: 12,
        padding: 12, borderRadius: 12, marginBottom: 8, backgroundColor: 'rgba(255,255,255,0.06)',
    },
    targetItemSelected: { backgroundColor: 'rgba(255,215,0,0.15)', borderWidth: 1, borderColor: '#FFD700' },
    targetAvatar: { fontSize: 28 },
    targetName: { flex: 1, color: '#fff', fontSize: 16, fontWeight: '600' },
    targetModalButtons: { flexDirection: 'row', gap: 12, marginTop: 16 },
    targetModalBtn: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center' },
    targetModalBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
});