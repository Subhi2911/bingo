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
import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import CustomAlert from './CustomAlert';
import { useSocket } from '../context/SocketContext';
import WinningModal from './WinningModal';

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
    const otherPlayers = turnOrder.filter(p => p.id !== props?.user?._id);
    const letters = ['B', 'I', 'N', 'G', 'O'];



    useEffect(() => {

        const handleResults = (finishedPlayers) => {
            console.log("received:", finishedPlayers);

            const index = finishedPlayers.indexOf(props?.user?._id);

            if (index === -1) {
                setResult("lose");   //  not in finished list
            } else {
                setResult(index < 3 ? "win" : "lose");
            }

            setWinModal(true);

        };

        socket.on("show_results", handleResults);

        return () => {
            socket.off("show_results", handleResults);
        };
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
            setMe(order.find(p => p.id === props?.user?._id));
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
        2: [{ top: '8%', right: '10%' }, { bottom: '10%', left: '10%' }],
        3: [{ top: '8%', left: '40%' }, { bottom: '8%', left: '15%' }, { bottom: '8%', right: '15%' }],
        4: [
            { top: '12%', left: '8%' },
            { top: '12%', right: '8%' },
            { bottom: '10%', left: '8%' },
            { bottom: '10%', right: '8%' }
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
    console.log(positions);

    useEffect(() => {
        if (!turnOrder.length) return;
        const boards = {};
        const wins = {};
        turnOrder.forEach(player => {
            const arr = Array.from({ length: 25 }, (_, i) => i + 1);
            shuffle(arr);
            boards[player.id] = arr;
            wins[player.id] = { B: false, I: false, N: false, G: false, O: false, claimedPatterns: [], completed: false };
        });
        setPlayerBoards(boards);
        setPlayerWins(wins);
    }, [turnOrder]);

    const shuffle = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    };

    useEffect(() => {
        if (!socket) return;

        socket.on("current_turn", (player) => setCurrentTurn(player.id));
        socket.on("number_picked", (numbers) => setPickedNumbers(numbers));

        return () => {
            socket.off("current_turn");
            socket.off("number_picked");
        };
    }, [socket]);

    const [me, setMe] = useState(null);

    const handleNumberPress = (num) => {
        if (currentTurn !== props?.user?._id) return;

        socket.emit("select_number", { roomCode: props.roomCode, number: num });
    };

    useEffect(() => {
        socket.on("turn_order", (order) => {
            setTurnOrder(order);
            setMe(order.find(p => p.id === props?.user?._id));
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    useEffect(() => {
        console.log("TURN ORDER STATE:", turnOrder);
    }, [turnOrder]);


    useEffect(() => {
        console.log(turnOrder);
        if (!turnOrder.length) return;
        turnOrder.forEach(player => {
            checkBingo(player.id);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pickedNumbers, turnOrder]);

    const checkBingo = (playerId) => {
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

            if (hasCompletedBingo && !playerData.completed) {
                playerData.completed = true;

                socket.emit("game_end", {
                    roomCode: props.roomCode
                });
            }



            return newWins;
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
                message="Are you sure you want to leave?\nIt will charge you 40 coins."
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
                    {turnOrder.map((player, index) => {
                        let pos = {};

                        if (player.id === props?.user?._id) {
                            pos = { bottom: '10%', left: '10%' };
                        } else {
                            const idx = otherPlayers.findIndex(p => p.id === player.id);
                            pos = positions[idx] || {};
                        }

                        const isCurrentTurn = player.id === currentTurn;

                        return (
                            <View key={player.id} style={[styles.player, pos]}>
                                <View
                                    style={[
                                        styles.userAvatar,
                                        isCurrentTurn && { borderColor: '#0f0', borderWidth: 3 }
                                    ]}
                                />
                                <Text style={styles.userText}>
                                    {player.id === props?.user?._id ? 'Me' : player.username}
                                </Text>
                            </View>
                        );
                    })}

                    <ImageBackground
                        source={require('../images/BingoBoard (2).png')}
                        style={styles.board}
                    >
                        <View style={styles.grid}>
                            {playerBoards[props?.user?._id]?.map((num, index) => {
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
                                        <View style={[styles.bingoLetter, daubed && styles.daubedLetter]}>
                                            <Text style={[styles.letterText, daubed && styles.daubedText]}>
                                                {letter}
                                            </Text>
                                        </View>
                                        {daubed && (
                                            <Image
                                                source={require('../images/daub (2).png')}
                                                style={styles.daubIcon}
                                            />
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    )}

                </View>
                {console.log(winModal)}
                <Modal
                    transparent
                    visible={winModal}
                    animationType="fade"
                >
                    <WinningModal
                        result={result}
                        matchedPlayers={props.matchedPlayers}
                        onClose={() => setWinModal(false)}
                    />
                </Modal>

            </ImageBackground>
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
        backgroundColor: '#F8B55F',
        borderWidth: 2,
        borderColor: '#fff'
    },
    userText: {
        color: '#fff',
        fontWeight: 'bold',
        marginTop: 5
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
        alignItems: 'center'
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
