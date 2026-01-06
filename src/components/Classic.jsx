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


const Classic = () => {
    const { current: socket } = useSocket();
    const [gameStarted, setGameStarted] = React.useState(false);
    const [playerCount, setPlayerCount] = React.useState(2); // before matchmaking
    const [matchedPlayers, setMatchedPlayers] = React.useState([]); // after match
    const [roomCode, setRoomCode] = React.useState(null);
    const navigation = useNavigation();
    const [ready, setReady] = React.useState(false);
    const [user, setUser] = React.useState(null);

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
            size: playerCount // 2,3,4,5 selected earlier
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


                    <Text style={styles.classicText}> Classic </Text>
                    <CommonSelectionRoom players={ready ? playerCount : 1} matchedPlayers={matchedPlayers} ready={ready} />
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
                    <TouchableOpacity style={styles.readyBtn} onPress={() => { setReady(true); handleReady(); }} disabled={!socket || ready}>
                        <Text style={{ color: "#000", fontWeight: "bold" }} >Ready</Text>
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
                            user={user} />
                    </>

                )}

        </View>
    )
}

export default Classic

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
        bottom: 230,
        alignSelf: 'center',

    },
    selectBtn: {
        backgroundColor: "#D9CFC7",
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
        bottom: 300,
        width: '70%',
    },
    exitIcon: {
        position: 'absolute',
        top: 50,
        left: 20,
        color: '#F8B55F',
        zIndex: 10,
    },
    classicText: {
        position: 'absolute',
        top: 50,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#F8B55F',
        zIndex: 10,
    },
})
