/* eslint-disable react-native/no-inline-styles */
import { StyleSheet, Text, View, ImageBackground, TouchableOpacity, Image, BackHandler } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import CommonSelectionRoom from './CommonSelectionRoom'
import Icon from 'react-native-vector-icons/FontAwesome5';
import GameScreen from './GameScreen'
import { useNavigation } from '@react-navigation/native';
import CustomAlert from './CustomAlert';
import { useSocket } from '../context/SocketContext';
import { BACKEND_URL } from '../config/backend';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from "react-native";
import GameScreenPower from './GameScreenPower';
import {showAlert2} from './CustomAlert2'
import { useAuth } from '../context/AuthContext';

const Power = () => {
    const socketRef = useSocket();
    const socket = socketRef?.socket;
    const [gameStarted, setGameStarted] = React.useState(false);
    const [playerCount, setPlayerCount] = React.useState(2); // before matchmaking
    const [matchedPlayers, setMatchedPlayers] = React.useState([]); // after match
    const [roomCode, setRoomCode] = React.useState(null);
    const navigation = useNavigation();
    const [ready, setReady] = React.useState(false);
    //const [user, setUser] = React.useState(null);
    const { user }= useAuth();
    const [powerSelected, setPowerSelected] = React.useState(1);
    const avatarPowers = {
        "🐵": [
            "Swift Dash",
            "Tree Leap",
            "Mischief Steal"
        ],
        "🐶": [
            "Loyal Guard",
            "Tracker Sense",
            "Pack Howl"
        ],
        "🐱": [
            "Shadow Step",
            "Silent Claws",
            "Nine Lives"
        ],
        "🦁": [
            "King’s Roar",
            "Dominance",
            "Fear Aura"
        ],
        "🐯": [
            "Ambush Pounce",
            "Blood Frenzy",
            "Predator Focus"
        ],
        "🦊": [
            "Illusion Clone",
            "Trick Swap",
            "Mind Games"
        ],
        "🐮": [
            "Iron Hide",
            "Ground Slam",
            "Steadfast"
        ],
        "🐭": [
            "Quick Escape",
            "Tiny Target",
            "Sneak Bite"
        ],
        "🐴": [
            "Charge Run",
            "Endurance",
            "Hoof Strike"
        ],
        "🐸": [
            "Mega Jump",
            "Sticky Tongue",
            "Poison Skin"
        ],
        "🐔": [
            "Panic Flap",
            "Egg Bomb",
            "Feather Shield"
        ],
        "🐍": [
            "Venom Bite",
            "Coil Trap",
            "Heat Sense"
        ]
    };
    const powerDetails = {
        // 🐵 Monkey
        "Swift Dash": "Instantly marks one random unmarked number on your board.",
        "Tree Leap": "Marks two random unmarked numbers on your board.",
        "Mischief Steal": "Copies the last number marked by an opponent.",

        // 🐶 Dog
        "Loyal Guard": "Protects you from all power effects for 15 seconds.",
        "Tracker Sense": "Reveals the progress of a selected opponent's board.",
        "Pack Howl": "Marks one additional random number on your board.",

        // 🐱 Cat
        "Shadow Step": "Instantly marks one unmarked number of your choice.",
        "Silent Claws": "Removes one marked number from a random opponent.",
        "Nine Lives": "Automatically cancels the first negative power used against you.",

        // 🦁 Lion
        "King’s Roar": "Disables all opponent powers for 10 seconds.",
        "Dominance": "Marks two random unmarked numbers on your board.",
        "Fear Aura": "Prevents a random opponent from marking numbers for 5 seconds.",

        // 🐯 Tiger
        "Ambush Pounce": "Removes one marked number from a selected opponent.",
        "Blood Frenzy": "Marks two random numbers instantly.",
        "Predator Focus": "Highlights the best available move toward completing a Bingo line.",

        // 🦊 Fox
        "Illusion Clone": "Hides your board progress from opponents for 15 seconds.",
        "Trick Swap": "Swaps one marked and one unmarked number on an opponent's board.",
        "Mind Games": "Disables a random opponent's power for one use.",

        // 🐮 Cow
        "Iron Hide": "Makes you immune to all power effects for 15 seconds.",
        "Ground Slam": "Removes one marked number from every opponent.",
        "Steadfast": "Prevents your marked numbers from being altered for 15 seconds.",

        // 🐭 Mouse
        "Quick Escape": "Removes any active negative effect on you.",
        "Tiny Target": "Gives a 50% chance to ignore the next power used against you.",
        "Sneak Bite": "Removes one marked number from a random opponent.",

        // 🐴 Horse
        "Charge Run": "Automatically marks the next number you choose.",
        "Endurance": "Allows you to use your power twice in the same match.",
        "Hoof Strike": "Freezes a selected opponent for 5 seconds.",

        // 🐸 Frog
        "Mega Jump": "Instantly marks any one number of your choice.",
        "Sticky Tongue": "Steals one marked number from an opponent.",
        "Poison Skin": "Reflects the next negative power back to its sender.",

        // 🐔 Chicken
        "Panic Flap": "Instantly marks one random number on your board.",
        "Egg Bomb": "Removes one marked number from all opponents.",
        "Feather Shield": "Protects one completed Bingo line from disruption.",

        // 🐍 Snake
        "Venom Bite": "Freezes a selected opponent for 5 seconds.",
        "Coil Trap": "Blocks an opponent from using their power.",
        "Heat Sense": "Reveals all opponents' board progress for 10 seconds."
    };

    const avatarEmojiVariants = {
        "🐵": ["🙈", "🙉", "🙊"],
        "🐶": ["🐕", "🦮", "🐕‍🦺"],
        "🐱": ["🐈", "😾", "😺"],
        "🦁": ["😺", "🐯", "👑"], // lion-styled vibe
        "🐯": ["🐯", "🐅", "😾"],
        "🦊": ["🦊", "🐕", "🧠"],
        "🐮": ["🐄", "🐂", "🐃"],
        "🐭": ["🐁", "🐀", "🐹"],
        "🐴": ["🐎", "🦄", "🏇"],
        "🐸": ["🐸‍⬛", "🐸", "🐸"],
        "🐔": ["🐓", "🐣", "🐥"],
        "🐍": ["🦎", "🐉", "🐲"]
    };

    // React.useEffect(() => {
    //     const getUser = async () => {
    //         try {
    //             const token = await AsyncStorage.getItem("authToken");
    //             const response = await fetch(`${BACKEND_URL}/api/auth/getuser`, {
    //                 method: "POST",
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                     "auth-token": token,
    //                 },
    //             });
    //             const json = await response.json();
    //             setUser(json);
    //         } catch (error) {
    //             console.log(error);
    //         }
    //     };
    //     getUser();
    // }, []);


    // Disable back button
    React.useEffect(() => {
        const backAction = () => true
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        )
        return () => backHandler.remove()
    }, [])

    const handleReady = () => {
        if (!socket) {
            return
        };
        socket.emit("find_match", {
            socketId: socket.id,
            userId: user?._id,
            username: user?.username, // replace later with real user
            avatar: user?.avatar,
            size: playerCount, // 2,3,4,5 selected earlier
            gameType: 'power',
            selectedPower: avatarPowers[user?.avatar][powerSelected],
        });
    };

    React.useEffect(() => {
        if (!socket || !user) return; // wait for user

        const handleMatchFound = ({ roomCode, players }) => {
            // filter out self safely
            //const filteredPlayers = players.filter(p => p.userId !== (user?._id || ""));
            setMatchedPlayers(players);
            setRoomCode(roomCode);

            setTimeout(() => setGameStarted(true), 2000);
        };

        socket.on("match_found", handleMatchFound);

        return () => socket.off("match_found", handleMatchFound);
    }, [socket, user]);

 
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            {!gameStarted &&
                (<>
                    <Icon
                        name="sign-out-alt"
                        size={30}
                        style={[styles.exitIcon, { transform: [{ scaleX: -1 }] }]}
                        onPress={() => {
                            navigation.goBack();
                            socket.emit("cancel_match", { userId: user._id });
                        }}
                    />


                    <Text style={styles.PowerText}> Power </Text>
                    <CommonSelectionRoom players={ready ? playerCount : 1} matchedPlayers={matchedPlayers} ready={ready} gameType="classic" />
                    <View style={styles.playerSelection}>
                        <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18, alignSelf: 'center' }}>Players:</Text>
                        <TouchableOpacity style={[styles.selectBtn, playerCount === 2 ? { backgroundColor: "#F8B55F" } : {}]} disabled={ready} onPress={() => { setPlayerCount(2) }}>
                            <Text style={{ color: "#fff", fontWeight: "bold" }}>2P</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.selectBtn, playerCount === 3 ? { backgroundColor: "#F8B55F" } : {}]} disabled={ready} onPress={() => { setPlayerCount(3) }}>
                            <Text style={{ color: "#fff", fontWeight: "bold" }}>3P</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.selectBtn, playerCount === 4 ? { backgroundColor: "#F8B55F" } : {}]} disabled={ready} onPress={() => { setPlayerCount(4) }}>
                            <Text style={{ color: "#fff", fontWeight: "bold" }}>4P</Text>
                        </TouchableOpacity>
                        {/* <TouchableOpacity style={[styles.selectBtn, players === 5 ? { backgroundColor: "#F8B55F" } : {}]} onPress={() => { setPlayers(5) }}>
                            <Text style={{ color: "#fff", fontWeight: "bold" }}>5P</Text>
                        </TouchableOpacity> */}
                    </View>


                    <View style={styles.powerSelection}>
                        <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18, alignSelf: 'center' }}>Powers:</Text>
                        {avatarPowers[user?.avatar]?.map((powerName, index) => (
                            <View key={index} style={{ width: 50 }}>
                                <TouchableOpacity
                                    key={powerName}
                                    style={[
                                        styles.power,
                                        powerSelected === index && { backgroundColor: "#F8B55F" }
                                    ]}
                                    disabled={ready}
                                    onPress={() => setPowerSelected(index)}
                                    onLongPress={() => {
                                        showAlert2({ type: 'info', title: powerName, message: powerDetails[powerName] });
                                    }}
                                >
                                    <Text style={styles.powerEmoji}>
                                        {avatarEmojiVariants[user.avatar][index]}
                                    </Text>


                                </TouchableOpacity>
                                <Text style={styles.powerText}>{powerName}</Text>
                            </View>
                        ))}
                    </View>
                    <TouchableOpacity style={styles.readyBtn} onPress={() => { setReady(true); handleReady(); }} >
                        <Text style={{ color: "#000", fontWeight: "bold" }} >Ready</Text>
                    </TouchableOpacity>
                    {/* <Text style={{ position: 'absolute', bottom: 80, color: "#fff", fontSize: 12 }}>(Coming Soon)</Text> */}
                    {/* <TouchableOpacity style={styles.startBtn} onPress={() => setGameStarted(true)}>
                        <Text style={{ color: "#fff", fontWeight: "bold" }}>Start Game</Text>
                    </TouchableOpacity> */}
                </>
                )}
            {gameStarted && ready &&
                (
                    <>
                        <GameScreenPower
                            players={playerCount}
                            matchedPlayers={matchedPlayers}
                            roomCode={roomCode}
                            myId={user._id}
                            user={user}
                            gameType="power"
                            selectedPower={
                                avatarPowers[user?.avatar][powerSelected]
                            }
                            selectedPowerAvatar={avatarEmojiVariants[user.avatar][powerSelected]
                            }
                        />
                    </>

                )}

        </View>
    )
}

export default Power;

const styles = StyleSheet.create({
    startBtn: {
        marginTop: 10,
        backgroundColor: "#F8B55F",
        paddingHorizontal: 20,
        paddingVertical: 5,
        borderRadius: 10,
        height: 40,
        width: 120,
        fontSize: 26,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 180,
        alignSelf: 'center',
    },
    readyBtn: {
        marginTop: 10,
        backgroundColor: "#EEEEEE",
        paddingHorizontal: 20,
        paddingVertical: 5,
        borderRadius: 10,
        height: 40,
        width: 120,
        fontSize: 26,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 100,
        alignSelf: 'center',

    },
    selectBtn: {
        backgroundColor: "#353432",
        paddingHorizontal: 15,
        paddingVertical: 5,
        borderRadius: 10,
        height: 40,
        fontSize: 20,
        justifyContent: 'center',
        alignItems: 'center',
        color: '#000',
    },
    playerSelection: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
        position: 'absolute',
        bottom: 250,
        width: '75%',
    },
    exitIcon: {
        position: 'absolute',
        top: 50,
        left: 20,
        color: '#F8B55F',
        zIndex: 10,
    },
    PowerText: {
        position: 'absolute',
        top: 50,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#F8B55F',
        zIndex: 10,
    },
    power: {
        width: 50,
        height: 50,
        backgroundColor: '#353432',
        borderRadius: 25,
        alignItems: "center",
        justifyContent: "center",
    },
    powerSelection: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
        position: 'absolute',
        bottom: 160,
        width: '75%',
    },

    //   powerSelection: {
    //     flexDirection: "row",
    //     flexWrap: "wrap",
    //     justifyContent: "space-between",
    //     marginTop: 16,
    //   },
    //   power: {
    //     width: 80,
    //     height: 100,
    //     borderRadius: 40,
    //     backgroundColor: "#eee",
    //     alignItems: "center",
    //     justifyContent: "center",
    //     marginBottom: 12,
    //     padding: 6,
    //   },
    powerEmoji: {
        fontSize: 28,
    },
    powerText: {
        fontSize: 10,
        textAlign: "center",
        marginTop: 4,
        color: "#fff",
    },
})
