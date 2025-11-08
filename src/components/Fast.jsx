/* eslint-disable react-native/no-inline-styles */
import { BackHandler, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import Icon from 'react-native-vector-icons/FontAwesome5';
import CommonSelectionRoom from './CommonSelectionRoom'
import GameScreen from './GameScreen'
import { useNavigation } from '@react-navigation/native';

const Fast = () => {
    const [gameStarted, setGameStarted] = React.useState(false);
    const [players, setPlayers] = React.useState(2);
    const navigation = useNavigation();
    const [ready, setReady]=React.useState(false);

    // Disable back button
    React.useEffect(() => {
        const backAction = () => true
        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        )
        return () => backHandler.remove()
    }, [])
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
                    <CommonSelectionRoom players={ready?players:1}/>
                    <View style={styles.playerSelection}>
                        <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18, alignSelf: 'center' }}>Players:</Text>
                        <TouchableOpacity style={[styles.selectBtn, players === 2 ? { backgroundColor: "#F8B55F" } : {}]} disabled={ready} onPress={() => { setPlayers(2) }}>
                            <Text style={{ color: "#fff", fontWeight: "bold" }}>2P</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.selectBtn, players === 3 ? { backgroundColor: "#F8B55F" } : {}]} disabled={ready} onPress={() => { setPlayers(3) }}>
                            <Text style={{ color: "#fff", fontWeight: "bold" }}>3P</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.selectBtn, players === 4 ? { backgroundColor: "#F8B55F" } : {}]} disabled={ready} onPress={() => { setPlayers(4) }}>
                            <Text style={{ color: "#fff", fontWeight: "bold" }}>4P</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.selectBtn, players === 5 ? { backgroundColor: "#F8B55F" } : {}]} disabled={ready} onPress={() => { setPlayers(5) }}>
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
                        <GameScreen players={players} />
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
     readyBtn:{
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