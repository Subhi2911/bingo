/* eslint-disable no-unused-vars */
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
    FlatList,
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
import ProfileModal from './ProfileModal';
import Intro from './Intro';
import LevelModal from './LevelModal';
import XPModal from './XPModal';
import { BACKEND_URL } from '../config/backend';
import AsyncStorage from '@react-native-async-storage/async-storage';
import FloatingMessage from './FloatingMessage';
import { ScrollView } from 'react-native';
import { useAlertToast } from './AlertToast';


// ─────────────────────────────────────────────
// POWER DEFINITIONS
// ─────────────────────────────────────────────
const POWER_GROUPS = {
    EXTRA_TURN: ["Swift Dash", "Pack Howl", "Dominance", "Blood Frenzy", "Panic Flap"],
    FREE_MARK: ["Shadow Step", "Mega Jump"],
    RANDOM_MARK: ["Tree Leap", "Tracker Sense", "Charge Run"],
    FREEZE: ["Fear Aura", "Hoof Strike", "Venom Bite"],
    IMMUNITY: ["Loyal Guard", "Iron Hide", "Steadfast"],
    REMOVE_MARK: ["Silent Claws", "Ambush Pounce", "Sneak Bite", "Sticky Tongue", "Egg Bomb", "Ground Slam"],
    REFLECT: ["Nine Lives", "Poison Skin", "Feather Shield", "Tiny Target"],
    MISCHIEF_STEAL: ["Mischief Steal"],
    KINGS_ROAR: ["King's Roar"],
    PREDATOR_FOCUS: ["Predator Focus"],
    ILLUSION_CLONE: ["Illusion Clone"],
    TRICK_SWAP: ["Trick Swap"],
    MIND_GAMES: ["Mind Games"],
    QUICK_ESCAPE: ["Quick Escape"],
    COIL_TRAP: ["Coil Trap"],
    HEAT_SENSE: ["Heat Sense"],
    ENDURANCE: ["Endurance"],
    NOT_IMPLEMENTED: [],
};

const getPowerGroup = (power) => {
    for (const [group, powers] of Object.entries(POWER_GROUPS)) {
        if (powers.includes(power)) return group;
    }
    return null;
};

const LETTERS = ['B', 'I', 'N', 'G', 'O'];

const PATTERNS = {
    columns: [[0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23], [4, 9, 14, 19, 24]],
    rows: [[0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24]],
    diags: [[0, 6, 12, 18, 24], [4, 8, 12, 16, 20]],
};

// ─────────────────────────────────────────────
// Compute bingo state for ONE player's board
// ─────────────────────────────────────────────
function computeBingoState(board, picked, gameType, prevState) {
    const state = {
        B: false, I: false, N: false, G: false, O: false,
        claimedPatterns: [],
        completed: prevState?.completed ?? false,
    };

    let letterIdx = 0;
    const daubNext = () => {
        if (letterIdx < LETTERS.length) {
            state[LETTERS[letterIdx]] = true;
            letterIdx++;
        }
    };

    const allPatterns = [
        ...PATTERNS.columns.map((p, i) => ({ p, id: `col${i}` })),
        ...PATTERNS.rows.map((p, i) => ({ p, id: `row${i}` })),
        ...PATTERNS.diags.map((p, i) => ({ p, id: `diag${i}` })),
    ];

    allPatterns.forEach(({ p, id }) => {
        if (p.every(idx => picked.includes(board[idx]))) {
            daubNext();
            state.claimedPatterns.push(id);
        }
    });

    const daubedCount = LETTERS.filter(l => state[l]).length;
    const threshold = gameType === 'fast' ? 3 : 5;
    if (daubedCount >= threshold) {
        state.completed = true;
    }

    return state;
}

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
// TRACKER SENSE OVERLAY
// ─────────────────────────────────────────────
const TrackerSenseOverlay = ({ data, playerWins, onDismiss }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.85)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration: 350, useNativeDriver: true }),
            Animated.spring(scale, { toValue: 1, friction: 7, useNativeDriver: true }),
        ]).start();
    }, []);

    const dismiss = () => {
        Animated.parallel([
            Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
            Animated.timing(scale, { toValue: 0.85, duration: 250, useNativeDriver: true }),
        ]).start(() => onDismiss && onDismiss());
    };

    return (
        <Animated.View style={[styles.trackerOverlay, { opacity, transform: [{ scale }] }]}>
            <View style={styles.trackerHeader}>
                <Text style={styles.trackerTitle}>👁 Tracker Sense</Text>
                <TouchableOpacity onPress={dismiss} style={styles.trackerClose}>
                    <Text style={{ color: '#FFD700', fontSize: 16 }}>✕</Text>
                </TouchableOpacity>
            </View>
            <Text style={styles.trackerSubtitle}>Opponent BINGO Status</Text>
            {data.map((opp) => {
                const wins = playerWins[opp.userId];
                return (
                    <View key={opp.userId} style={styles.trackerRow}>
                        <Text style={styles.trackerAvatar}>{opp.avatar || '🐟'}</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.trackerName}>{opp.username}</Text>
                            <Text style={styles.trackerMarked}>{opp.markedCount} numbers marked</Text>
                        </View>
                        <View style={styles.trackerLetters}>
                            {LETTERS.map((l, i) => {
                                const filled = wins?.[l] ?? false;
                                return (
                                    <View key={i} style={[styles.trackerLetterCircle, filled && styles.trackerLetterFilled]}>
                                        <Text style={[styles.trackerLetterText, filled && styles.trackerLetterTextFilled]}>{l}</Text>
                                    </View>
                                );
                            })}
                        </View>
                    </View>
                );
            })}
            <TouchableOpacity onPress={dismiss} style={styles.trackerDismissBtn}>
                <Text style={styles.trackerDismissText}>Dismiss</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

//___________________________________
//PREDATOR FOCUS OVERLAY
//_______________________________________
const PredatorFocusOverlay = ({ boards, playerWins, onDismiss }) => {
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(opacity, { toValue: 1, duration: 350, useNativeDriver: true }).start();
    }, []);

    const dismiss = () => {
        Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true })
            .start(() => onDismiss?.());
    };

    return (
        <Animated.View style={[overlayStyles.container, { opacity }]}>
            <View style={overlayStyles.box}>
                <View style={overlayStyles.header}>
                    <Text style={overlayStyles.title}>👁 Predator Focus</Text>
                    <TouchableOpacity onPress={dismiss} style={overlayStyles.closeBtn}>
                        <Text style={{ color: '#FFD700', fontSize: 16 }}>✕</Text>
                    </TouchableOpacity>
                </View>
                <Text style={overlayStyles.sub}>Opponent Boards Revealed</Text>
                <ScrollView>
                    {boards.map(opp => (
                        <View key={opp.userId} style={overlayStyles.boardRow}>
                            <Text style={overlayStyles.oppName}>{opp.avatar || '🐟'} {opp.username}</Text>
                            <View style={overlayStyles.miniGrid}>
                                {opp.markedNumbers.slice(0, 25).map((n, i) => (
                                    <View key={i} style={[overlayStyles.miniCell, { backgroundColor: 'rgba(255,215,0,0.25)' }]}>
                                        <Text style={overlayStyles.miniNum}>{n}</Text>
                                    </View>
                                ))}
                            </View>
                            <View style={{ flexDirection: 'row', gap: 4, marginTop: 4 }}>
                                {LETTERS.map(l => {
                                    const filled = playerWins[opp.userId]?.[l];
                                    return (
                                        <View key={l} style={[overlayStyles.letterDot, filled && overlayStyles.letterDotFilled]}>
                                            <Text style={{ fontSize: 9, fontWeight: 'bold', color: filled ? '#000' : '#666' }}>{l}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    ))}
                </ScrollView>
                <TouchableOpacity onPress={dismiss} style={overlayStyles.dismissBtn}>
                    <Text style={overlayStyles.dismissText}>Dismiss</Text>
                </TouchableOpacity>
            </View>
        </Animated.View>
    );
};

//__________________________________
// HEATSENSEOVERLAY
//__________________________________
const HeatSenseOverlay = ({ hotNumbers, onDismiss }) => {
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.85)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, { toValue: 1, duration: 350, useNativeDriver: true }),
            Animated.spring(scale, { toValue: 1, friction: 7, useNativeDriver: true }),
        ]).start();
    }, []);

    const dismiss = () => {
        Animated.parallel([
            Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }),
            Animated.timing(scale, { toValue: 0.85, duration: 250, useNativeDriver: true }),
        ]).start(() => onDismiss?.());
    };

    const maxCount = hotNumbers[0]?.opponentCount || 1;

    return (
        <Animated.View style={[overlayStyles.container, { opacity, transform: [{ scale }] }]}>
            <View style={[overlayStyles.box, { borderColor: '#FF6B35' }]}>
                <View style={overlayStyles.header}>
                    <Text style={[overlayStyles.title, { color: '#FF6B35' }]}>🔥 Heat Sense</Text>
                    <TouchableOpacity onPress={dismiss} style={overlayStyles.closeBtn}>
                        <Text style={{ color: '#FF6B35', fontSize: 16 }}>✕</Text>
                    </TouchableOpacity>
                </View>
                <Text style={overlayStyles.sub}>Most-wanted numbers by opponents</Text>
                {hotNumbers.map(({ number, opponentCount }, i) => {
                    const heatPct = (opponentCount / maxCount) * 100;
                    const heatColor = heatPct > 66 ? '#FF3300' : heatPct > 33 ? '#FF8800' : '#FFD700';
                    return (
                        <View key={i} style={overlayStyles.heatRow}>
                            <View style={overlayStyles.heatNumBadge}>
                                <Text style={overlayStyles.heatNum}>{number}</Text>
                            </View>
                            <View style={overlayStyles.heatBarBg}>
                                <View style={[overlayStyles.heatBarFill, { width: `${heatPct}%`, backgroundColor: heatColor }]} />
                            </View>
                            <Text style={[overlayStyles.heatCount, { color: heatColor }]}>{opponentCount} want</Text>
                        </View>
                    );
                })}
                <TouchableOpacity onPress={dismiss} style={[overlayStyles.dismissBtn, { borderColor: '#FF6B35' }]}>
                    <Text style={[overlayStyles.dismissText, { color: '#FF6B35' }]}>Dismiss</Text>
                </TouchableOpacity>
            </View>
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
    const TURN_TIME = props.gameType === 'fast' ? 5 : 15;
    const [timer, setTimer] = useState(TURN_TIME);
    const [floatingNumbers, setFloatingNumbers] = useState([]);
    const xpUpdatedRef = useRef(false);
    const gameStartTimeRef = useRef(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [floatingMessages, setFloatingMessages] = useState([]);
    const [inputHeight, setInputHeight] = useState(40);
    const keyboardHeight = useRef(new Animated.Value(0)).current;
    const [bingopop, setBingopop] = useState(false);
    const bingoShownRef = useRef(false);
    const avatarRef = useRef(null);
    const [anchor, setAnchor] = useState(null);
    const [profileVisible, setProfileVisible] = useState(false);
    const [profileDetails, setProfileDetails] = useState(null);
    const gameEndedRef = useRef(false);
    const [loading, setLoading] = useState(true);
    const [levelModalVisible, setLevelModalVisible] = useState(false);
    const [xpModalVisible, setXpModalVisible] = useState(false);
    const [xpResult, setXpResult] = useState(null);
    const oldXpRef = useRef(props.user.xp);
    const [chatInput, setChatInput] = useState('');
    const [me, setMe] = useState(null);
    const [readyPlayers, setReadyPlayers] = useState({});
    const [floatingMessages2, setFloatingMessages2] = useState([]);
    const { showToast } = useAlertToast();

    // Power state
    const [usedPower, setUsedPower] = useState(false);
    const [powerMode, setPowerMode] = useState(false);
    const [selectedTarget, setSelectedTarget] = useState(null);
    const [activeEffects, setActiveEffects] = useState({});
    const [targetModalVisible, setTargetModalVisible] = useState(false);
    const [powerNotifications, setPowerNotifications] = useState([]);
    const [predatorReveal, setPredatorReveal] = useState(null);   // { boards, duration }
    const [heatSenseData, setHeatSenseData] = useState(null);   // { hotNumbers, duration }
    const [illusionClones, setIllusionClones] = useState({});     // { [userId]: fakeLetter }
    const [mindGamesActive, setMindGamesActive] = useState(false);  // scramble MY board
    const [scrambledBoard, setScrambledBoard] = useState(null);   // shuffled copy
    const [coilTrapWarning, setCoilTrapWarning] = useState(false);  // show warning overlay
    const [skippedTurn, setSkippedTurn] = useState(null);   // userId of skipped player

    // Tracker Sense
    const [trackerSenseData, setTrackerSenseData] = useState(null);
    const trackerDismissTimer = useRef(null);

    // ── STABLE REFS ──
    const playerBoardsRef = useRef({});
    const pickedNumbersRef = useRef([]);
    const playerWinsRef = useRef({});
    const gameTypeRef = useRef(props.gameType);
    const roomCodeRef = useRef(props.roomCode);
    const myIdRef = useRef(props.user._id);
    const turnOrderRef = useRef([]);

    useEffect(() => { playerBoardsRef.current = playerBoards; }, [playerBoards]);
    useEffect(() => { pickedNumbersRef.current = pickedNumbers; }, [pickedNumbers]);
    useEffect(() => { playerWinsRef.current = playerWins; }, [playerWins]);
    useEffect(() => { turnOrderRef.current = turnOrder; }, [turnOrder]);

    //____________________________________
    //Info
    //___________________________________
    useEffect(() => {
        !loading &&
            showToast('warning', props.gameType, 'Each row/column/diagonal will daub one letter of BINGO. Daub all the letters to win. You can use your power only once');
    }, []);

    //_____________________
    //bingo board and daub
    //_____________________
    const boardImages = {
        classic: require("../images/boards/classic.png"),
        ocean: require("../images/boards/ocean.png"),
        forest: require("../images/boards/forest.png"),
        galaxy: require("../images/boards/galaxy.png"),
        candy: require("../images/boards/candy.png"),
        lava: require("../images/boards/lava.png"),
        barbie: require("../images/boards/barbie.png")
    };
    const daubImages = {
        daub: require("../images/daubs/daub (2).png"),
        crown: require("../images/daubs/crown.png"),
        flame: require("../images/daubs/flame.png"),
        ice: require("../images/daubs/ice.png"),
        skull: require("../images/daubs/skull.png"),
        star: require("../images/daubs/star.png"),
        thunder: require("../images/daubs/thunder.png"),
    }

    const [equippedBoard, setEquippedBoard] = useState("classic");
    const [equippedDaub, setEquippedDaub] = useState("daub")

    useEffect(() => {
        const loadBoard = async () => {
            const board = await AsyncStorage.getItem("equippedBoard");
            if (board) setEquippedBoard(board);
        };
        const loadDaub = async () => {
            const daub = await AsyncStorage.getItem("equippedDaub");
            if (daub) setEquippedDaub(daub);
        }

        loadBoard();
        loadDaub();
    }, []);

    const boardThemes = {
        classic: { bg: '#C8860A', border: '#8B5E0A', text: '#FFF8E7', daubed: '#FFD700', numberColor: '#3B1F00', pickedNumberColor: '#8B5E0A' },
        ocean: { bg: '#1A8FD1', border: '#0D5F8F', text: '#E0F4FF', daubed: '#00E5FF', numberColor: '#002B45', pickedNumberColor: '#1A8FD1' },
        forest: { bg: '#4A7C3F', border: '#2E5228', text: '#E8FFE0', daubed: '#A8FF78', numberColor: '#1A3A15', pickedNumberColor: '#4A7C3F' },
        galaxy: { bg: '#4B2D8F', border: '#2A1A5E', text: '#E8D5FF', daubed: '#C77DFF', numberColor: '#E8D5FF', pickedNumberColor: '#9B59B6' },
        candy: { bg: '#D94F8A', border: '#9C1F5E', text: '#FFE4F3', daubed: '#FF9ECD', numberColor: '#6B0033', pickedNumberColor: '#D94F8A' },
        lava: { bg: '#C03A00', border: '#7A2200', text: '#FFE8D0', daubed: '#FF6B00', numberColor: '#FFE8D0', pickedNumberColor: '#C03A00' },
        barbie: { bg: '#E0307A', border: '#A01050', text: '#FFE4F3', daubed: '#FF80C0', numberColor: '#6B0033', pickedNumberColor: '#E0307A' },
    };

    // ─────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────
    const addPowerNotif = useCallback((message) => {
        const id = `${Date.now()}-${Math.random()}`;
        setPowerNotifications(prev => [...prev, { id, message }]);
    }, []);

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
    const hasReflect = (userId) => activeEffects[userId]?.reflectNext === true;
    const hasEndurance = (userId) => (activeEffects[userId]?.enduranceTurns || 0) > 0;



    // ─────────────────────────────────────────
    // XP UPDATE
    // ─────────────────────────────────────────
    const updateXPFromServer = async (didWin) => {
        if (xpUpdatedRef.current) return;
        xpUpdatedRef.current = true;
        try {
            const token = await AsyncStorage.getItem('authToken');
            oldXpRef.current = props.user.xp;
            const duration = gameStartTimeRef.current
                ? Math.floor((Date.now() - gameStartTimeRef.current) / 1000) : 0;
            const res = await fetch(`${BACKEND_URL}/api/games/update-progress`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'auth-token': token },
                body: JSON.stringify({
                    gameId: props.roomCode,
                    didWin,
                    gameType: props.gameType,
                    playerCount: props.players,
                    duration,
                }),
            });
            const data = await res.json();
            setXpResult({ ...data, oldXP: oldXpRef.current });
        } catch (e) { console.log(e); }
    };

    // ─────────────────────────────────────────
    // TRIGGER WIN
    // ─────────────────────────────────────────
    const triggerWin = useCallback((winnerId) => {
        if (gameEndedRef.current) return;
        gameEndedRef.current = true;

        const iWon = winnerId === myIdRef.current;
        setResult(iWon ? 'win' : 'lose');
        setWinnerPlayerId(winnerId);
        setBingopop(true);
        updateXPFromServer(iWon);
        socket?.emit('game_end', { roomCode: roomCodeRef.current, winnerId, gameType: "power" });
        setTimeout(() => setWinModal(true), 2400);
    }, [socket]);

    // ─────────────────────────────────────────
    // RUN BINGO CHECK
    // ─────────────────────────────────────────
    const runBingoCheck = useCallback((picked) => {
        if (gameEndedRef.current) return;

        const boards = playerBoardsRef.current;
        const players = turnOrderRef.current;
        const gt = gameTypeRef.current;

        if (!players.length) return;

        let winnerId = null;
        const nextWins = { ...playerWinsRef.current };

        for (const player of players) {
            const board = boards[player.userId];
            if (!board) continue;

            const prev = nextWins[player.userId];
            if (!prev) continue;

            if (prev.completed) continue;

            const newState = computeBingoState(board, picked, gt, prev);
            nextWins[player.userId] = newState;

            if (newState.completed && !prev.completed && !winnerId) {
                winnerId = player.userId;
            }
        }

        setPlayerWins(nextWins);
        playerWinsRef.current = nextWins;

        if (winnerId) {
            triggerWin(winnerId);
        }
    }, [triggerWin]);

    // ─────────────────────────────────────────
    // RECOMPUTE AFTER REMOVAL
    // ─────────────────────────────────────────
    const recomputeAfterRemoval = useCallback((playerId, picked) => {
        const board = playerBoardsRef.current[playerId];
        if (!board) return;
        const prev = playerWinsRef.current[playerId];
        const newState = computeBingoState(board, picked, gameTypeRef.current, prev);
        setPlayerWins(prev2 => {
            const next = { ...prev2, [playerId]: newState };
            playerWinsRef.current = next;
            return next;
        });
    }, []);

    // ─────────────────────────────────────────
    // BINGO CHECK ON pickedNumbers CHANGE
    // ─────────────────────────────────────────
    useEffect(() => {
        if (!turnOrder.length || !Object.keys(playerBoards).length) return;
        runBingoCheck(pickedNumbers);
    }, [pickedNumbers]);

    // ─────────────────────────────────────────
    // ACTIVATE POWER
    // ─────────────────────────────────────────
    const activatePower = () => {
        if (usedPower) return;
        const power = props.selectedPower;
        if (!power) return;
        const group = getPowerGroup(power);

        // Powers that need a target modal
        const NEEDS_TARGET = new Set([
            'FREEZE', 'REMOVE_MARK',
            // NEW targeted powers:
            'Mischief Steal', 'Trick Swap', 'Mind Games',
        ]);

        if (group === 'FREE_MARK') {
            setPowerMode(true);
            addPowerNotif(`${power} activated — tap a number`);
            return;
        }

        if (
            group === 'FREEZE' ||
            group === 'REMOVE_MARK' ||
            power === 'Mischief Steal' ||
            power === 'Trick Swap' ||
            power === 'Mind Games'
        ) {
            setTargetModalVisible(true);
            return;
        }

        // All other powers (EXTRA_TURN, RANDOM_MARK, IMMUNITY, REFLECT,
        // King's Roar, Predator Focus, Illusion Clone, Quick Escape, Coil Trap, Heat Sense)
        socket.emit('use_power', {
            roomCode: props.roomCode,
            userId: props.user._id,
            power,
            group,
        });
    };

    const confirmTargetedPower = () => {
        if (!selectedTarget) return;
        const power = props.selectedPower;
        const group = getPowerGroup(power);
        socket.emit('use_power', { roomCode: props.roomCode, userId: props.user._id, power, group, targetId: selectedTarget });
        setTargetModalVisible(false);
        setSelectedTarget(null);
    };

    // ─────────────────────────────────────────
    // BOARD PRESS
    // ─────────────────────────────────────────
    const handleNumberPress = useCallback((num) => {
        if (powerMode) {
            socket.emit('use_power', {
                roomCode: props.roomCode, userId: props.user._id,
                power: props.selectedPower, group: 'FREE_MARK', number: num,
            });
            setPowerMode(false);
            setUsedPower(true);
            return;
        }
        if (currentTurn !== props?.user?._id) return;
        if (!playerBoardsRef.current[props?.user?._id]) return;
        setFloatingNumbers(prev => [...prev, num]);
        socket.emit('select_number', { roomCode: props.roomCode, number: num });
    }, [powerMode, currentTurn, socket, props.roomCode, props?.user?._id, props.selectedPower]);

    // ─────────────────────────────────────────
    // SOCKET — power events
    // ─────────────────────────────────────────
    useEffect(() => {
        if (!socket) return;

        socket.on('power_used', ({ power, userId, group, message }) => {
            addPowerNotif(message || `${power} activated`);
            if (userId === props.user._id) {
                setUsedPower(true);
                setPowerMode(false);
            }
        });

        socket.on('power_effect', ({ effect, targetId, value }) => {
            setActiveEffects(prev => ({ ...prev, [targetId]: { ...prev[targetId], [effect]: value } }));
        });

        socket.on('power_failed', ({ reason }) => {
            addPowerNotif(`⚠️ ${reason}`);
            setPowerMode(false);
        });

        socket.on('power_reflected', ({ power }) => {
            addPowerNotif(`↩ ${power} reflected!`);
        });

        socket.on('mark_removed', ({ targetId, number }) => {
            if (targetId === props.user._id) {
                setPickedNumbers(prev => {
                    const idx = prev.lastIndexOf(number);
                    if (idx === -1) return prev;
                    const next = [...prev];
                    next.splice(idx, 1);
                    pickedNumbersRef.current = next;
                    recomputeAfterRemoval(props.user._id, next);
                    return next;
                });
                addPowerNotif('❌ One of your marks was removed!');
            }
        });

        socket.on('player_frozen', ({ targetId, frozenUntil, message }) => {
            setActiveEffects(prev => ({ ...prev, [targetId]: { ...prev[targetId], frozenUntil } }));
            addPowerNotif(message || `❄ Player frozen for 5s`);
        });

        socket.on('player_immune', ({ userId: uid, immuneUntil, message }) => {
            setActiveEffects(prev => ({ ...prev, [uid]: { ...prev[uid], immuneUntil } }));
            addPowerNotif(message || `🛡 Immunity activated`);
        });

        socket.on('extra_turn', ({ playerId }) => {
            setCurrentTurn(playerId);
        });

        socket.on('power_not_implemented', ({ power }) => {
            addPowerNotif(`⚙️ ${power} coming soon!`);
            setUsedPower(true);
        });

        socket.on('tracker_sense_result', ({ opponentInfo }) => {
            setTrackerSenseData(opponentInfo);
            if (trackerDismissTimer.current) clearTimeout(trackerDismissTimer.current);
            trackerDismissTimer.current = setTimeout(() => setTrackerSenseData(null), 6000);
        });
        // ── Mischief Steal ──
        socket.on('mark_stolen', ({ fromId, toId, number, message }) => {
            addPowerNotif(message);
            // If we are the recipient, add the stolen number to our local picked set
            if (toId === props.user._id) {
                setPickedNumbers(prev => {
                    if (prev.includes(number)) return prev;
                    const next = [...prev, number];
                    pickedNumbersRef.current = next;
                    runBingoCheck(next);
                    return next;
                });
            }
        });

        // ── King's Roar ──
        socket.on('turn_skipped', ({ userId, message }) => {
            addPowerNotif(message || `👑 A turn was skipped!`);
            setActiveEffects(prev => {
                const next = { ...prev };
                if (next[userId]?.skipNextTurn) delete next[userId].skipNextTurn;
                return next;
            });
        });

        // ── Predator Focus ──
        socket.on('predator_focus_reveal', ({ boards, duration, message }) => {
            addPowerNotif(message);
            setPredatorReveal({ boards, duration });
            setTimeout(() => setPredatorReveal(null), duration);
        });

        // ── Illusion Clone ──
        socket.on('illusion_clone', ({ userId: uid, fakeLetter, duration, message }) => {
            addPowerNotif(message);
            if (uid !== props.user._id) {
                // Show a fake letter on that player's bingo display
                setIllusionClones(prev => ({ ...prev, [uid]: fakeLetter }));
                setTimeout(() => {
                    setIllusionClones(prev => {
                        const next = { ...prev };
                        delete next[uid];
                        return next;
                    });
                }, duration);
            }
        });

        // ── Trick Swap ──
        socket.on('trick_swap', ({ userId: caster, targetId: victim, myNum, theirNum, message }) => {
            addPowerNotif(message);
            // If I am either party, update my local picked set
            if (caster === props.user._id) {
                setPickedNumbers(prev => {
                    if (prev.includes(theirNum)) return prev;
                    const next = prev.filter(n => n !== myNum);
                    next.push(theirNum);
                    pickedNumbersRef.current = next;
                    runBingoCheck(next);
                    return next;
                });
            }
            if (victim === props.user._id) {
                setPickedNumbers(prev => {
                    if (prev.includes(myNum)) return prev;
                    const next = prev.filter(n => n !== theirNum);
                    next.push(myNum);
                    pickedNumbersRef.current = next;
                    runBingoCheck(next);
                    return next;
                });
            }
        });

        // ── Mind Games ──
        socket.on('mind_games', ({ targetId: victim, shuffleSeed, duration, message }) => {
            addPowerNotif(message);
            if (victim === props.user._id) {
                // Scramble board display using the seed
                const board = [...(playerBoardsRef.current[props.user._id] || [])];
                // Seeded Fisher-Yates
                let seed = shuffleSeed;
                // Avoid bitwise operators to satisfy lint rules; use modulo to keep 32-bit range
                const rand = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967295; };
                for (let i = board.length - 1; i > 0; i--) {
                    const j = Math.floor(rand() * (i + 1));
                    [board[i], board[j]] = [board[j], board[i]];
                }
                setScrambledBoard(board);
                setMindGamesActive(true);
                setTimeout(() => {
                    setScrambledBoard(null);
                    setMindGamesActive(false);
                }, duration);
            }
        });

        // ── Coil Trap ──
        socket.on('coil_trap_triggered', ({ victimId, number, casterId, message }) => {
            addPowerNotif(message);
            if (victimId === props.user._id) {
                // The number we tried to pick got destroyed — server already skipped it,
                // so no local picked update needed. Just a visual warning.
                setCoilTrapWarning(true);
                setTimeout(() => setCoilTrapWarning(false), 2500);
            }
        });

        // ── Heat Sense ──
        socket.on('heat_sense_result', ({ hotNumbers, duration, message }) => {
            addPowerNotif(message);
            setHeatSenseData({ hotNumbers });
            setTimeout(() => setHeatSenseData(null), duration);
        });

        //----------endurance----------
        socket.on('endurance_active', ({ userId: uid, remainingTurns }) => {
            if (uid === props.user._id) {
                addPowerNotif(`🐴 Endurance active — ${remainingTurns} boosted turns left!`);
            }
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
            socket.off('mark_stolen');
            socket.off('turn_skipped');
            socket.off('predator_focus_reveal');
            socket.off('illusion_clone');
            socket.off('trick_swap');
            socket.off('mind_games');
            socket.off('coil_trap_triggered');
            socket.off('heat_sense_result');
            socket.off('tracker_sense_result');
            socket.off('endurance_active');
        };
    }, [socket, addPowerNotif, recomputeAfterRemoval]);



    // ─────────────────────────────────────────
    // SOCKET — game / turn events
    // ─────────────────────────────────────────
    useEffect(() => {
        if (!socket) return;

        socket.on('current_turn', (player) => setCurrentTurn(player?.userId));

        socket.on('number_picked', (numbers) => {
            pickedNumbersRef.current = numbers;
            setPickedNumbers(numbers);
        });

        return () => {
            socket.off('current_turn');
            socket.off('number_picked');
        };
    }, [socket]);
    useEffect(() => {
        if (!socket) return;
        const handleResults = ({ winnerId }) => {
            if (gameEndedRef.current) return;
            gameEndedRef.current = true;
            const iWon = winnerId === props?.user?._id;
            setResult(iWon ? 'win' : 'lose');
            setWinnerPlayerId(winnerId);
            setBingopop(true);
            updateXPFromServer(iWon);
            setTimeout(() => setWinModal(true), 2400);
        };
        socket.on('show_results', handleResults);
        return () => socket.off('show_results', handleResults);
    }, [socket]);

    useEffect(() => {
        if (!socket) return;
        const handleReadyUpdate = ({ readyPlayers }) => setReadyPlayers(readyPlayers);
        const handleRestartGame = () => { resetGameState(); setWinModal(false); };
        socket.on('ready_update', handleReadyUpdate);
        socket.on('restart_game', handleRestartGame);
        return () => {
            socket.off('ready_update', handleReadyUpdate);
            socket.off('restart_game', handleRestartGame);
        };
    }, [socket]);

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
            turnOrderRef.current = order;
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

    useEffect(() => {
        return () => {
            if (trackerDismissTimer.current) clearTimeout(trackerDismissTimer.current);
        };
    }, []);

    // ─────────────────────────────────────────
    // BOARD GENERATION — once only
    // ─────────────────────────────────────────
    useEffect(() => {
        if (!turnOrder?.length || Object.keys(playerBoardsRef.current).length > 0) return;

        const boards = {};
        const wins = {};
        turnOrder.forEach(player => {
            const arr = Array.from({ length: 25 }, (_, i) => i + 1);
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            boards[player.userId] = arr;
            wins[player.userId] = { B: false, I: false, N: false, G: false, O: false, claimedPatterns: [], completed: false };
        });

        playerBoardsRef.current = boards;
        playerWinsRef.current = wins;
        setPlayerBoards(boards);
        setPlayerWins(wins);
    }, [turnOrder]);

    // ─────────────────────────────────────────
    // FLOATING NUMBERS CLEANUP
    // ─────────────────────────────────────────
    useEffect(() => {
        if (!floatingNumbers?.length) return;
        const t = setTimeout(() => setFloatingNumbers(prev => prev.slice(1)), 1000);
        return () => clearTimeout(t);
    }, [floatingNumbers]);

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
        xpUpdatedRef.current = false;
        bingoShownRef.current = false;
        setUsedPower(false);
        setPowerMode(false);
        setActiveEffects({});
        setBingopop(false);
        setTrackerSenseData(null);
        setPredatorReveal(null);
        setHeatSenseData(null);
        setIllusionClones({});
        setMindGamesActive(false);
        setScrambledBoard(null);
        setCoilTrapWarning(false);
        setSkippedTurn(null);
        // ──────────────
        playerBoardsRef.current = {};
        pickedNumbersRef.current = [];
        playerWinsRef.current = {};
        turnOrderRef.current = [];
    };

    const playAgain = () => {
        socket.emit('player_ready', { roomCode: props.roomCode, userId: props.user._id });
    };

    const sendMessage = () => {
        if (!chatInput.trim()) return;
        socket.emit('send_message', { roomCode: props.roomCode, username: props.user.username, text: chatInput.trim() });
        setChatInput('');
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
                        {/* ROOM CODE + ELAPSED TIMER */}
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
                                <PowerNotification key={n.id} message={n.message} onFinish={() => removePowerNotif(n.id)} />
                            ))}
                        </View>

                        <View style={{ flex: 1 }}>
                            {/* PLAYER AVATARS */}
                            {turnOrder?.map((player) => {
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
                                                    key={currentTurn}
                                                    size={55}
                                                    duration={TURN_TIME}
                                                    gameEnded={gameEndedRef.current}
                                                    onComplete={() => {
                                                        if (gameEndedRef.current) return;
                                                        const board = playerBoardsRef.current[player.userId];
                                                        const picked = pickedNumbersRef.current;
                                                        const available = board?.filter(n => !picked.includes(n));
                                                        if (!available?.length) return;
                                                        handleNumberPress(available[Math.floor(Math.random() * available.length)]);
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
                                            <View style={styles.effectBadges}>
                                                {frozen && <Text style={styles.effectBadge}>❄</Text>}
                                                {immune && <Text style={styles.effectBadge}>🛡</Text>}
                                                {reflect && <Text style={styles.effectBadge}>↩</Text>}
                                                {hasEndurance(player.userId) && <Text style={styles.effectBadge}>⏱</Text>}
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
                                {floatingNumbers.map((num, i) => <FloatingNumber key={i} number={num} />)}
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

                            {/* BINGO BOARD */}
                            <ImageBackground
                                source={boardImages[equippedBoard] || boardImages.classic}
                                style={[styles.board, powerMode && styles.boardPowerActive]}
                            >
                                {powerMode && (
                                    <View style={styles.powerModeOverlay} pointerEvents="none">
                                        <Text style={styles.powerModeOverlayText}>Tap a number</Text>
                                    </View>
                                )}
                                <View style={styles.grid}>
                                    {(mindGamesActive && scrambledBoard ? scrambledBoard : playerBoards[props?.user?._id])?.map((num, index) => {
                                        if (!num) return null;
                                        const isPicked = pickedNumbers.includes(num);
                                        const disabled = powerMode
                                            ? isPicked
                                            : (currentTurn !== props?.user?._id || isPicked);
                                        const theme = boardThemes[equippedBoard] || boardThemes.classic;
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
                                                        source={daubImages[equippedDaub] || daubImages.daub}
                                                        style={{ width: 40, height: 40, position: 'absolute', opacity: 0.5 }}
                                                    />
                                                )}
                                                <Text style={[
                                                    styles.numberText,
                                                    { color: isPicked ? theme.pickedNumberColor : theme.numberColor },
                                                    isPicked && {
                                                        textShadowColor: 'rgba(0,0,0,0.3)',
                                                        textShadowOffset: { width: 1, height: 1 },
                                                        textShadowRadius: 2,
                                                    },
                                                ]}>
                                                    {num}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </ImageBackground>

                            {/* BINGO LETTERS */}
                            {playerWins[props?.user?._id] && (() => {
                                const theme = boardThemes[equippedBoard] || boardThemes.classic;
                                return (
                                    <View style={styles.bingowin}>
                                        {LETTERS.map((letter, index) => {
                                            const daubed = playerWins[props?.user?._id]?.[letter];
                                            return (
                                                <View key={index} style={styles.bingoLetterContainer}>
                                                    <View style={[
                                                        styles.bingoLetter,
                                                        { backgroundColor: theme.bg, borderColor: theme.border, borderWidth: 2 },
                                                        daubed && { backgroundColor: theme.daubed, borderColor: '#fff', borderWidth: 2.5 },
                                                    ]}>
                                                        <Text style={[
                                                            styles.letterText,
                                                            { color: theme.text },
                                                            daubed && {
                                                                color: '#fff',
                                                                textShadowColor: 'rgba(0,0,0,0.4)',
                                                                textShadowOffset: { width: 1, height: 1 },
                                                                textShadowRadius: 3,
                                                            },
                                                        ]}>
                                                            {letter}
                                                        </Text>
                                                    </View>
                                                    <FloatingBingoGhost letter={letter} trigger={daubed} />
                                                </View>
                                            );
                                        })}
                                    </View>
                                );
                            })()}
                        </View>

                        {/* ── BOTTOM HUD BAR ── */}
                        <Animated.View
                            style={[
                                styles.hudBar,
                                { bottom: Animated.add(keyboardHeight, 16) },
                            ]}
                        >
                            {/* Power button */}
                            <TouchableOpacity
                                style={[
                                    styles.hudPowerBtn,
                                    usedPower && styles.hudPowerBtnUsed,
                                    powerMode && styles.hudPowerBtnActive,
                                ]}
                                onPress={activatePower}
                                disabled={usedPower}
                                activeOpacity={0.8}
                            >
                                <Text style={{ fontSize: 26 }}>{props.selectedPowerAvatar}</Text>
                                {usedPower && (
                                    <View style={styles.usedOverlay}>
                                        <Text style={styles.usedOverlayText}>USED</Text>
                                    </View>
                                )}
                                {powerMode && <View style={styles.activeModeRing} />}
                            </TouchableOpacity>

                            {/* Power name */}
                            <Text style={styles.hudPowerLabel} numberOfLines={2}>
                                {props.selectedPower}
                            </Text>

                            {/* Divider */}
                            <View style={styles.hudDivider} />

                            {/* Message input */}
                            <TextInput
                                style={[styles.hudInput, { height: Math.min(inputHeight, 80) }]}
                                placeholder="Message..."
                                placeholderTextColor="#717171"
                                value={chatInput}
                                onChangeText={setChatInput}
                                multiline
                                textAlignVertical="top"
                                numberOfLines={3}
                                onContentSizeChange={(e) => {
                                    const h = Math.min(80, e.nativeEvent.contentSize.height);
                                    setInputHeight(h < 40 ? 40 : h);
                                }}
                            />

                            {/* Send icon — only visible when typing */}
                            {chatInput.trim() ? (
                                <TouchableOpacity
                                    onPress={sendMessage}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Icon name="paper-plane" size={18} color="#ffffff" style={{ marginRight: 2 }} />
                                </TouchableOpacity>
                            ) : null}

                            {/* Gift icon */}
                            <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 6, right: 6 }}>
                                <Icon name="gift" size={22} color="#f708d7" />
                            </TouchableOpacity>
                        </Animated.View>

                        {/* BINGO POP */}
                        {bingopop && (
                            <BingoPopUp delay={200} onAnimationEnd={() => setBingopop(false)} />
                        )}

                        {/* TRACKER SENSE OVERLAY */}
                        {trackerSenseData && (
                            <TrackerSenseOverlay
                                data={trackerSenseData}
                                playerWins={playerWins}
                                onDismiss={() => {
                                    if (trackerDismissTimer.current) clearTimeout(trackerDismissTimer.current);
                                    setTrackerSenseData(null);
                                }}
                            />

                        )}
                        {// ── Predator Focus overlay ──
                            predatorReveal && (
                                <PredatorFocusOverlay
                                    boards={predatorReveal.boards}
                                    playerWins={playerWins}
                                    onDismiss={() => setPredatorReveal(null)}
                                />
                            )}

                        {// ── Heat Sense overlay ──
                            heatSenseData && (
                                <HeatSenseOverlay
                                    hotNumbers={heatSenseData.hotNumbers}
                                    onDismiss={() => setHeatSenseData(null)}
                                />
                            )}

                        {// ── Coil Trap warning banner ──
                            coilTrapWarning && (
                                <View style={coilTrapBannerStyle}>
                                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>
                                        🐍 Coil Trap! Your mark was destroyed!
                                    </Text>
                                </View>
                            )}

                        {// ── Mind Games scramble notice ──
                            mindGamesActive && (
                                <View style={mindGamesBannerStyle}>
                                    <Text style={{ color: '#FF6B35', fontWeight: 'bold', fontSize: 13 }}>
                                        🌀 Mind Games — board scrambled!
                                    </Text>
                                </View>
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
                                myUsername={props.user.username}
                                myAvatar={props.user.avatar}
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
                                        : props.selectedPower === 'Mischief Steal'
                                            ? '🃏 Choose player to steal a mark from'
                                            : props.selectedPower === 'Trick Swap'
                                                ? '🔀 Choose player to swap a number with'
                                                : props.selectedPower === 'Mind Games'
                                                    ? '🌀 Choose player to scramble their board'
                                                    : '❌ Choose player to remove a mark'}
                                </Text>
                                <FlatList
                                    data={otherPlayers}
                                    keyExtractor={item => item.userId}
                                    renderItem={({ item }) => (
                                        <TouchableOpacity
                                            style={[styles.targetItem, selectedTarget === item.userId && styles.targetItemSelected]}
                                            onPress={() => setSelectedTarget(item.userId)}
                                        >
                                            <Text style={styles.targetAvatar}>{item.avatar || '🐟'}</Text>
                                            <Text style={styles.targetName}>{item.username}</Text>
                                            {selectedTarget === item.userId && <Icon name="check-circle" size={20} color="#FFD700" />}
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
const coilTrapBannerStyle = {
    position: 'absolute', top: '50%', alignSelf: 'center',
    backgroundColor: 'rgba(200,0,0,0.85)', paddingHorizontal: 20, paddingVertical: 12,
    borderRadius: 16, zIndex: 9999,
};
const mindGamesBannerStyle = {
    position: 'absolute', top: '26%', alignSelf: 'center',
    backgroundColor: 'rgba(20,20,40,0.9)', paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 12, borderWidth: 1, borderColor: '#FF6B35', zIndex: 999,
};
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
    userAvatarImage: { width: '100%', height: '100%', borderRadius: 50, justifyContent: 'center', alignItems: 'center' },
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
    bingoLetter: { width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
    letterText: { fontSize: 22, fontWeight: 'bold' },
    numberText: { fontSize: 19, fontWeight: 'bold' },  // color now dynamic
    box: { width: '20%', height: '20%', justifyContent: 'center', alignItems: 'center' },
    boxPowerHighlight: { backgroundColor: 'rgba(255,215,0,0.3)', borderRadius: 6, borderWidth: 1, borderColor: '#FFD700' },

    exitIcon: { position: 'absolute', top: 50, left: 20, color: '#F8B55F', zIndex: 10 },
    roomCode: { color: '#fff', fontSize: 20, fontWeight: 'bold', alignSelf: 'center', marginTop: 20 },

    // ── BOTTOM HUD BAR ──
    hudBar: {
        position: 'absolute',
        left: 10,
        right: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: 'rgba(8, 6, 24, 0.88)',
        borderRadius: 36,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.22)',
        paddingHorizontal: 10,
        paddingVertical: 8,
        elevation: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
    },
    hudPowerBtn: {
        width: 46,
        height: 46,
        borderRadius: 23,
        backgroundColor: 'rgba(248, 182, 95, 0.18)',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
        flexShrink: 0,
    },
    hudPowerBtnUsed: {
        opacity: 0.35,
    },
    hudPowerBtnActive: {
        borderWidth: 2,
        borderColor: '#FFD700',
        backgroundColor: 'rgba(255,215,0,0.2)',
    },
    hudPowerLabel: {
        color: '#bbb',
        fontSize: 10,
        fontWeight: '600',
        width: 52,
        flexShrink: 0,
        textAlign: 'center',
        lineHeight: 13,
    },
    hudDivider: {
        width: 1,
        height: 28,
        backgroundColor: 'rgba(255,255,255,0.12)',
        flexShrink: 0,
    },
    hudInput: {
        flex: 1,
        minHeight: 40,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.12)',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 6,
        backgroundColor: 'rgba(255,255,255,0.07)',
        fontSize: 14,
        color: '#fff',
    },

    // ── POWER OVERLAYS (shared with HUD button) ──
    usedOverlay: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', borderRadius: 23,
    },
    usedOverlayText: { color: '#fff', fontWeight: 'bold', fontSize: 10 },
    activeModeRing: {
        position: 'absolute', top: -4, left: -4, right: -4, bottom: -4,
        borderRadius: 27, borderWidth: 2, borderColor: '#FFD700',
    },

    // ── POWER NOTIFICATIONS ──
    powerNotifsContainer: {
        position: 'absolute', top: '8%', alignSelf: 'center', zIndex: 999, alignItems: 'center', gap: 6,
    },
    powerNotif: {
        backgroundColor: 'rgba(20,20,20,0.88)', paddingHorizontal: 18, paddingVertical: 8,
        borderRadius: 20, borderWidth: 1, borderColor: '#FFD700',
    },
    powerNotifText: { color: '#FFD700', fontWeight: 'bold', fontSize: 14 },

    // ── TARGET MODAL ──
    targetModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
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

    // ── TRACKER SENSE ──
    trackerOverlay: {
        position: 'absolute', top: '10%', alignSelf: 'center', width: '88%',
        backgroundColor: 'rgba(8,8,28,0.96)', borderRadius: 20, padding: 18,
        borderWidth: 1.5, borderColor: '#FFD700', zIndex: 999,
        shadowColor: '#FFD700', shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.4, shadowRadius: 12, elevation: 20,
    },
    trackerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
    trackerTitle: { color: '#FFD700', fontWeight: 'bold', fontSize: 18 },
    trackerClose: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,215,0,0.15)', justifyContent: 'center', alignItems: 'center' },
    trackerSubtitle: { color: '#aaa', fontSize: 12, marginBottom: 14 },
    trackerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 10 },
    trackerAvatar: { fontSize: 26 },
    trackerName: { color: '#fff', fontSize: 14, fontWeight: '700' },
    trackerMarked: { color: '#888', fontSize: 11, marginTop: 2 },
    trackerLetters: { flexDirection: 'row', gap: 4 },
    trackerLetterCircle: { width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
    trackerLetterFilled: { backgroundColor: '#FFD700', borderColor: '#FFA500' },
    trackerLetterText: { fontSize: 10, fontWeight: 'bold', color: '#666' },
    trackerLetterTextFilled: { color: '#1a1a00' },
    trackerDismissBtn: { marginTop: 10, alignSelf: 'center', paddingHorizontal: 24, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,215,0,0.15)', borderWidth: 1, borderColor: '#FFD700' },
    trackerDismissText: { color: '#FFD700', fontWeight: '600', fontSize: 13 },

});
const overlayStyles = StyleSheet.create({
    container: {
        position: 'absolute', top: '10%', alignSelf: 'center', width: '88%', zIndex: 999,
    },
    box: {
        backgroundColor: 'rgba(8,8,28,0.96)', borderRadius: 20, padding: 18,
        borderWidth: 1.5, borderColor: '#FFD700',
        shadowColor: '#FFD700', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 20,
    },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
    title: { color: '#FFD700', fontWeight: 'bold', fontSize: 18 },
    closeBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: 'rgba(255,215,0,0.15)', justifyContent: 'center', alignItems: 'center' },
    sub: { color: '#aaa', fontSize: 12, marginBottom: 14 },
    boardRow: { marginBottom: 14, backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: 12, padding: 10 },
    oppName: { color: '#fff', fontWeight: '700', fontSize: 14, marginBottom: 6 },
    miniGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 3 },
    miniCell: { width: 26, height: 26, borderRadius: 5, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,215,0,0.3)' },
    miniNum: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    letterDot: { width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
    letterDotFilled: { backgroundColor: '#FFD700', borderColor: '#FFA500' },
    dismissBtn: { marginTop: 10, alignSelf: 'center', paddingHorizontal: 24, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,215,0,0.15)', borderWidth: 1, borderColor: '#FFD700' },
    dismissText: { color: '#FFD700', fontWeight: '600', fontSize: 13 },
    // Heat Sense rows
    heatRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
    heatNumBadge: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,107,53,0.2)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FF6B35' },
    heatNum: { color: '#FF6B35', fontWeight: 'bold', fontSize: 15 },
    heatBarBg: { flex: 1, height: 10, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 5, overflow: 'hidden' },
    heatBarFill: { height: '100%', borderRadius: 5 },
    heatCount: { fontSize: 11, fontWeight: '600', minWidth: 50, textAlign: 'right' },
});
