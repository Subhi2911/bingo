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

const Power = () => {
    const socketRef = useSocket();
    const socket = socketRef?.socket;
    const [gameStarted, setGameStarted] = React.useState(false);
    const [playerCount, setPlayerCount] = React.useState(2); // before matchmaking
    const [matchedPlayers, setMatchedPlayers] = React.useState([]); // after match
    const [roomCode, setRoomCode] = React.useState(null);
    const navigation = useNavigation();
    const [ready, setReady] = React.useState(false);
    const [user, setUser] = React.useState(null);
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
        "Swift Dash": "Temporarily increases movement speed, allowing quick repositioning.",
        "Tree Leap": "Jump over obstacles or enemies to reach a safe or strategic spot.",
        "Mischief Steal": "Steals a random item or bonus from the opponent.",

        // 🐶 Dog
        "Loyal Guard": "Reduces incoming damage for a short duration.",
        "Tracker Sense": "Reveals the enemy’s position for a limited time.",
        "Pack Howl": "Boosts attack and defense of nearby allies.",

        // 🐱 Cat
        "Shadow Step": "Instantly teleport a short distance to evade danger.",
        "Silent Claws": "Increases critical hit chance for a brief period.",
        "Nine Lives": "Revives the player once after being defeated.",

        // 🦁 Lion
        "King’s Roar": "Stuns nearby enemies for a short duration.",
        "Dominance": "Temporarily increases attack power.",
        "Fear Aura": "Weakens enemies by reducing their attack strength.",

        // 🐯 Tiger
        "Ambush Pounce": "Leap onto an enemy to deal bonus surprise damage.",
        "Blood Frenzy": "Increases attack speed after dealing damage.",
        "Predator Focus": "Improves accuracy and damage against a single target.",

        // 🦊 Fox
        "Illusion Clone": "Creates a fake clone to confuse enemies.",
        "Trick Swap": "Switch positions with an enemy or ally.",
        "Mind Games": "Causes enemies to miss or misfire attacks.",

        // 🐮 Cow
        "Iron Hide": "Greatly increases defense and reduces damage taken.",
        "Ground Slam": "Slams the ground, damaging nearby enemies.",
        "Steadfast": "Grants immunity to knockback and stuns.",

        // 🐭 Mouse
        "Quick Escape": "Instantly dash away from danger.",
        "Tiny Target": "Reduces chance of being hit by enemies.",
        "Sneak Bite": "Applies poison damage over time.",

        // 🐴 Horse
        "Charge Run": "Rush forward at high speed, knocking enemies back.",
        "Endurance": "Increases stamina and reduces exhaustion.",
        "Hoof Strike": "Powerful kick that pushes enemies away.",

        // 🐸 Frog
        "Mega Jump": "Allows a very high jump to reach elevated areas.",
        "Sticky Tongue": "Pulls an enemy closer or grabs objects.",
        "Poison Skin": "Damages enemies on contact.",

        // 🐔 Chicken
        "Panic Flap": "Move erratically to avoid enemy attacks.",
        "Egg Bomb": "Throws an explosive egg that deals area damage.",
        "Feather Shield": "Absorbs incoming damage for a short time.",

        // 🐍 Snake
        "Venom Bite": "Injects venom that deals damage over time.",
        "Coil Trap": "Immobilizes an enemy by wrapping around them.",
        "Heat Sense": "Detects hidden or invisible enemies."
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

    React.useEffect(() => {
        const getUser = async () => {
            try {
                const token = await AsyncStorage.getItem("authToken");
                const response = await fetch(`${BACKEND_URL}/api/auth/getuser`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "auth-token": token,
                    },
                });
                const json = await response.json();
                setUser(json);
            } catch (error) {
                console.error(error);
            }
        };
        getUser();
    }, []);


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
            console.log('jhuygy')
            return
        };
        console.log(user)
        socket.emit("find_match", {
            socketId: socket.id,
            userId: user?._id,
            username: user?.username, // replace later with real user
            avatar: user?.avatar,
            size: playerCount, // 2,3,4,5 selected earlier
            gameType: 'power'
        });
    };

    React.useEffect(() => {
        if (!socket || !user) return; // wait for user

        const handleMatchFound = ({ roomCode, players }) => {
            // filter out self safely
            //const filteredPlayers = players.filter(p => p.userId !== (user?._id || ""));
            setMatchedPlayers(players);
            console.log(players);
            setRoomCode(roomCode);

            setTimeout(() => setGameStarted(true), 2000);
        };

        socket.on("match_found", handleMatchFound);

        return () => socket.off("match_found", handleMatchFound);
    }, [socket, user]);

    // React.useEffect(() => {
    //     console.log(user);
    //     if (!socket) return;
    //     socket.on("match_found", ({ roomCode, players }) => {
    //         // filter out yourself
    //         setMatchedPlayers(players.filter(p => p.userId !== user.id));
    //         setRoomCode(roomCode);

    //         setTimeout(() => {
    //             setGameStarted(true);
    //         }, 2000);
    //     });

    //     return () => socket.off("match_found");
    //     // eslint-disable-next-line react-hooks/exhaustive-deps
    // }, []);

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            {!gameStarted &&
                (<>
                    <Icon
                        name="sign-out-alt"
                        size={30}
                        style={[styles.exitIcon, { transform: [{ scaleX: -1 }] }]}
                        onPress={() => { navigation.goBack(); }}
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
                                    onLongPress={() =>
                                        Alert.alert(powerName, powerDetails[powerName])
                                    }
                                >
                                    <Text style={styles.powerEmoji}>
                                        {avatarEmojiVariants[user.avatar][index]}
                                    </Text>


                                </TouchableOpacity>
                                <Text style={styles.powerText}>{powerName}</Text>
                            </View>
                        ))}
                    </View>
                    <TouchableOpacity style={styles.readyBtn} onPress={() => { setReady(true); handleReady(); }} disabled={true}>
                        <Text style={{ color: "#000", fontWeight: "bold" }} >Ready (Coming Soon)</Text>
                    </TouchableOpacity>
                    {/* <TouchableOpacity style={styles.startBtn} onPress={() => setGameStarted(true)}>
                        <Text style={{ color: "#fff", fontWeight: "bold" }}>Start Game</Text>
                    </TouchableOpacity> */}
                </>
                )}
            {gameStarted && ready &&
                (
                    <>
                        <GameScreen
                            players={playerCount}
                            matchedPlayers={matchedPlayers}
                            roomCode={roomCode}
                            myId={user._id}
                            user={user}
                            gameType="power" />
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
