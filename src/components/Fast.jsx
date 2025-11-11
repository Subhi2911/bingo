/* eslint-disable react-native/no-inline-styles */
import { BackHandler, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import Icon from 'react-native-vector-icons/FontAwesome5';
import CommonSelectionRoom from './CommonSelectionRoom'
import GameScreenFast from './GameScreenFast'
import { useNavigation } from '@react-navigation/native';
import { useSocket } from '../context/SocketContext';

const Fast = () => {
    const { current: socket } = useSocket();
    const [gameStarted, setGameStarted] = React.useState(false);
    const [playerCount, setPlayerCount] = React.useState(2); // before matchmaking
    const [matchedPlayers, setMatchedPlayers] = React.useState([]); // after match
    const [roomCode, setRoomCode] = React.useState(null);
    const navigation = useNavigation();
    const [ready, setReady] = React.useState(false);

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
        socket.emit("find_match", {
            username: "Nikki", // replace later with real user
            size: playerCount // 2,3,4,5 selected earlier
        });
    }

    React.useEffect(() => {
        if (!socket) return;
        socket.on("match_found", ({ roomCode, players }) => {
            setRoomCode(roomCode);
            setMatchedPlayers(players);
            setTimeout(() => {
                setGameStarted(true);
            }, 2000);

        });


        return () => socket.off("match_found");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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
                    <Text style={styles.FastText}> Fast </Text>
                    <CommonSelectionRoom players={ready ? playerCount : 1} />
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
                        <TouchableOpacity style={[styles.selectBtn, playerCount === 5 ? { backgroundColor: "#F8B55F" } : {}]} disabled={ready} onPress={() => { setPlayerCount(5) }}>
                            <Text style={{ color: "#fff", fontWeight: "bold" }}>5P</Text>
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity style={styles.readyBtn} onPress={() => { setReady(true) }} disabled={ready}>
                        <Text style={{ color: "#000", fontWeight: "bold" }} >Ready</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.startBtn} onPress={() => setGameStarted(true)}>
                        <Text style={{ color: "#fff", fontWeight: "bold" }}>Start Game</Text>
                    </TouchableOpacity>
                </>
                )}
            {gameStarted && ready &&
                (
                    <>
                        <GameScreenFast players={playerCount}
                            matchedPlayers={matchedPlayers}
                            roomCode={roomCode}
                            myId={socket.id} />
                    </>
                )}
        </View>
    )
}

export default Fast

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
    FastText: {
        position: 'absolute',
        top: 50,
        fontSize: 24,
        fontWeight: 'bold',
        color: '#F8B55F',
        zIndex: 10,
    },
})