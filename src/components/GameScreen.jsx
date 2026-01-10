/* eslint-disable react-native/no-inline-styles */
import {
    BackHandler,
    ImageBackground,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Image,
    Modal
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

const GameScreen = (props) => {
    const navigation = useNavigation();
    const { current: socket } = useSocket();
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
    const TURN_TIME = 15; // seconds per turn
    const turnTimers = {}; // roomCode -> timeoutId
    const letters = ['B', 'I', 'N', 'G', 'O'];
    const [timer, setTimer] = useState(TURN_TIME);
    const [floatingNumbers, setFloatingNumbers] = useState([]);
    const [bingopop, setBingopop] = useState(false);
    const avatarRef = useRef(null);
    const [anchor, setAnchor] = useState(null);
    const [profileVisible, setProfileVisible] = useState(false);
    const [profileDetails, setProfileDetails] = useState(null);
    

    const avatarImages = {
        daub: require('../avatars/daub.png'),
        user: require('../avatars/user.jpg'),
    };
    const gameEndedRef = React.useRef(false);



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
        const handleResults = ({ winnerId }) => {
            // Only handle LOSE here
            if (winnerId !== props?.user?._id) {
                setResult("lose");
                setWinnerPlayerId(winnerId);
                setBingopop(true);
            }
        };

        socket.on("show_results", handleResults);
        return () => socket.off("show_results", handleResults);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {

        console.log("winModal:", winModal, "result:", result);
    }, [winModal, result]);


    useEffect(() => {
        if (!socket) return;

        const handleTurnOrder = (order) => {
            console.log("TURN ORDER RECEIVED:", order);

            setTurnOrder(order);
            setMe(order.find(p => p.userId === props?.user?._id));
        };

        socket.on("turn_order", handleTurnOrder);

        socket.emit("join_room", {
            roomCode: props.roomCode,
            userId: props?.user?._id,
            username: props?.user?.username,
            avatar: props?.user?.avatar
        });

        return () => {
            socket.off("turn_order", handleTurnOrder);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket]);

    useEffect(() => {
        const backAction = () => true;
        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, []);

    const playerPositions = {
        2: [{ top: '15%', right: '10%' }, { bottom: '15%', left: '10%' }],
        3: [{ top: '15%', left: '40%' }, { bottom: '15%', left: '15%' }, { bottom: '15%', right: '15%' }],
        4: [
            { top: '15%', left: '8%' },
            { top: '15%', right: '8%' },
            { bottom: '15%', left: '8%' },
            { bottom: '15%', right: '8%' }
        ],
        5: [
            { left: '8%', top: '22%' },
            { right: '8%', top: '22%' },
            { left: '8%', bottom: '12%' },
            { right: '8%', bottom: '12%' },
            { bottom: '12%', left: '45%' }
        ]
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

    useEffect(() => {
        if (!socket) return;

        socket.on("current_turn", (player) => setCurrentTurn(player?.userId));
        socket.on("number_picked", (numbers) => setPickedNumbers(numbers));

        return () => {
            socket.off("current_turn");
            socket.off("number_picked");
        };
    }, [socket]);

    const [me, setMe] = useState(null);

    const handleNumberPress = (num) => {
        if (currentTurn !== props?.user?._id) return;

        const myBoard = playerBoards[props?.user?._id];
        if (!myBoard) return; // <<< ADD THIS GUARD

        setFloatingNumbers(prev => [...prev, num]);
        socket.emit("select_number", { roomCode: props.roomCode, number: num });
    };

    // remove after animation
    useEffect(() => {
        if (!floatingNumbers?.length) return;

        const timer = setTimeout(() => {
            setFloatingNumbers(prev => prev.slice(1));
        }, 1000);

        return () => clearTimeout(timer);
    }, [floatingNumbers]);


    useEffect(() => {
        console.log("TURN ORDER STATE:", turnOrder);
    }, [turnOrder]);


    useEffect(() => {
        console.log(turnOrder);
        if (!turnOrder?.length) return;
        turnOrder?.forEach(player => {
            checkBingo(player?.userId);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pickedNumbers, turnOrder]);

    const [readyPlayers, setReadyPlayers] = useState({});
    const resetGameState = () => {
        setPickedNumbers([]);
        setPlayerBoards({});
        setPlayerWins({});
        setCurrentTurn(null);
        setResult("");
        setWinnerPlayerId(null);
        gameEndedRef.current = false;
    };
    useEffect(() => {
        if (!socket) return;

        const handleReadyUpdate = ({ readyPlayers }) => setReadyPlayers(readyPlayers);
        const handleRestartGame = () => {
            resetGameState();
            setWinModal(false);
        };

        socket.on("ready_update", handleReadyUpdate);
        socket.on("restart_game", handleRestartGame);

        return () => {
            socket.off("ready_update", handleReadyUpdate);
            socket.off("restart_game", handleRestartGame);
        };
    }, [socket]);

    const playAgain = () => {
        socket.emit("player_ready", { roomCode: props.roomCode, userId: props.user._id });
    };


    const checkBingo = (playerId) => {
        if (gameEndedRef.current) return;
        setPlayerWins(prev => {

            if (!playerBoards[playerId] || !prev[playerId]) return prev;

            const newWins = { ...prev };
            const playerData = { ...newWins[playerId] };
            const numbers = playerBoards[playerId];

            const columns = [
                [0, 5, 10, 15, 20],
                [1, 6, 11, 16, 21],
                [2, 7, 12, 17, 22],
                [3, 8, 13, 18, 23],
                [4, 9, 14, 19, 24]
            ];

            const rows = [
                [0, 1, 2, 3, 4],
                [5, 6, 7, 8, 9],
                [10, 11, 12, 13, 14],
                [15, 16, 17, 18, 19],
                [20, 21, 22, 23, 24]
            ];

            const diagonals = [
                [0, 6, 12, 18, 24],
                [4, 8, 12, 16, 20]
            ];

            const daubLetter = () => {
                const availableLetter = letters.find(l => !playerData[l]);
                if (availableLetter) playerData[availableLetter] = true;
            };

            const checkPatterns = (patterns, type) => {
                patterns.forEach((pattern, i) => {
                    const patternId = `${type}${i}`;
                    if (!playerData.claimedPatterns.includes(patternId) &&
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

            newWins[playerId] = playerData;
            const hasCompletedBingo = letters.every(l => playerData[l]);

            if (hasCompletedBingo && !playerData.completed && !gameEndedRef.current) {
                gameEndedRef.current = true;
                playerData.completed = true;

                // 🔥 SHOW BINGO IMMEDIATELY (same as lose)
                setResult("win");
                setWinnerPlayerId(props?.user?._id);
                setBingopop(true);

                // 🔄 Sync with server (background)
                socket.emit("game_end", {
                    roomCode: props.roomCode,
                    winnerId: props?.user?._id
                });
            }

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
                </View>

                <View style={{ flex: 1 }}>
                    {turnOrder?.map((player, index) => {
                        let pos = {};
                        if (player?.userId === props?.user?._id) {
                            pos = { bottom: '10%', left: '10%' };
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
                                    {isCurrentTurn && (
                                        <AvatarTimer
                                            key={`${player.userId}-${currentTurn}`}
                                            size={55}
                                            duration={TURN_TIME}
                                            onComplete={() => {
                                                const availableNumbers = playerBoards[props?.user?._id]?.filter(
                                                    n => !pickedNumbers.includes(n)
                                                );
                                                if (!availableNumbers?.length) return;
                                                const randomNumber =
                                                    availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
                                                handleNumberPress(randomNumber);
                                            }}
                                        />
                                    )}

                                    <TouchableOpacity
                                        ref={avatarRef}
                                        style={styles.userAvatar}
                                        onPress={() => openProfile(player)}
                                    >
                                        <Image
                                            source={avatarImages[player.avatar]|| require('../images/user.jpg')}
                                            style={styles.userAvatarImage}
                                        />
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

                    <View style={{ position: 'absolute', top: '50%', right: '12%' }}>
                        {pickedNumbers.map((num, index) => (
                            <FloatingNumber key={index} number={num} />
                        ))}
                    </View>

                    <ImageBackground
                        source={require('../images/BingoBoard (2).png')}
                        style={styles.board}
                    >
                        <View style={styles.grid}>
                            {playerBoards[props?.user?._id]?.map((num, index) => {
                                if (!num) return null; // <<< guard
                                const isPicked = pickedNumbers.includes(num);
                                const disabled = currentTurn !== props?.user?._id || isPicked;

                                return (
                                    <TouchableOpacity
                                        key={index}
                                        disabled={disabled}
                                        onPress={() => handleNumberPress(num)}
                                        style={[styles.box, isPicked && { opacity: 0.7 }, disabled && { opacity: 0.4 }]}
                                    >
                                        {isPicked && (
                                            <Image
                                                source={require('../images/daub (2).png')}
                                                style={{ width: 40, height: 40, position: "absolute", opacity: 0.5 }}
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
                                        {/* STATIC letter */}
                                        <View style={[styles.bingoLetter, daubed && styles.daubedLetter]}>
                                            <Text style={[styles.letterText, daubed && styles.daubedText]}>
                                                {letter}
                                            </Text>
                                        </View>

                                        {/* FLOATING ghost */}
                                        <FloatingBingoGhost letter={letter} trigger={daubed} />
                                    </View>
                                );
                            })}
                        </View>


                    )}

                </View>
                {console.log(winModal)}
                {bingopop && (
                    <>
                        {result === 'win' && <WinConfetti />}
                        <BingoPopUp
                            delay={bingopop ? 200 : null}
                            onAnimationEnd={() => {
                                setTimeout(() => {
                                    setWinModal(true);
                                    setBingopop(false);
                                }, 300);
                            }}
                        />
                    </>

                )}
            </ImageBackground>
            <Modal
                transparent
                visible={winModal}
                animationType="fade"
            >

                <WinningModal
                    result={result}
                    matchedPlayers={props.matchedPlayers}
                    onClose={() => setWinModal(false)}
                    winnerPlayerId={winnerPlayerId}
                    playAgain={playAgain}
                    readyPlayers={readyPlayers}
                    user={props.user}
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
                        onClose={() => setProfileVisible(false)} />
                </Modal>
            )}

        </View>
    );
};

export default GameScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%'
    },
    player: {
        position: 'absolute',
        alignItems: 'center'
    },
    userAvatar: {
        width: 55,
        height: 55,
        borderRadius: 30,
        //backgroundColor: '#F8B55F',
        borderWidth: 2,
        borderColor: '#fff',
        padding: 1
    },
    userAvatarImage: {
        width: '100%',
        height: '100%',
        objectFit: 'contain',
        borderRadius: 30
    },
    userText: {
        color: '#fff',
        fontWeight: 'bold',
        marginTop: 70
    },
    board: {
        position: 'absolute',
        top: '30%',
        width: 350,
        height: 350,
        alignSelf: 'center'
    },
    grid: {
        width: '100%',
        height: '100%',
        paddingTop: '25%',
        paddingBottom: '10%',
        paddingLeft: '18%',
        paddingRight: '18%',
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    bingowin: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        position: 'absolute',
        bottom: "28%",
        width: '70%',
        alignSelf: 'center'
    },
    bingoLetterContainer: {
        width: 50,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
    },
    bingoLetter: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#F8B55F',
        justifyContent: 'center',
        alignItems: 'center'
    },
    daubedLetter: {
        backgroundColor: '#FFD700',
        borderWidth: 2,
        borderColor: '#000'
    },
    letterText: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#F00',
        borderColor: '#F00'
    },
    daubedText: {
        color: '#000'
    },
    daubIcon: {
        width: 30,
        height: 30,
        position: 'absolute',
        opacity: 0.5
    },
    box: {
        width: '20%',
        height: '20%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    numberText: {
        fontSize: 19,
        fontWeight: 'bold',
        color: '#000'
    },
    exitIcon: {
        position: 'absolute',
        top: 50,
        left: 20,
        color: '#F8B55F',
        zIndex: 10
    },
    roomCode: {
        color: '#fff',
        fontSize: 20,
        fontWeight: 'bold',
        alignSelf: 'center',
        marginTop: 20
    },

});
