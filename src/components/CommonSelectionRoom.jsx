/* eslint-disable react-native/no-inline-styles */
import { StyleSheet, Text, View, ImageBackground, Image } from 'react-native';
import React from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../config/backend';

const CommonSelectionRoom = (props) => {
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

    const playerPositions = {
        1: [{ bottom: '2%', left: '10%' }],
        2: [
            { top: '26%', right: '8%' },
            { bottom: '2%', left: '10%' }
        ],
        3: [
            { top: '26%', left: '10%' },
            { top: '26%', right: '8%' },
            { bottom: '2%', left: '10%' }
        ],
        4: [
            { top: '26%', left: '10%' },
            { top: '26%', right: '8%' },
            { bottom: '2%', right: '8%' },
            { bottom: '2%', left: '10%' }
        ],
        5: [
            { top: '26%', left: '10%' },
            { top: '26%', right: '8%' },
            { bottom: '2%', right: '8%' },
            { bottom: '2%', left: '10%' },
            { top: '63%', left: '43%' }
        ]
    };

    const positions = playerPositions[props.players] || playerPositions[1];

    const userAvatars = {
        daub: require('../avatars/daub.png'),
    };

    const meId = user?._id;

    const opponents = (props.matchedPlayers || []).filter(
        p => p && p.userId !== meId
    );


    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('../images/RegisterPage.png')}
                style={{ flex: 1, width: '100%', height: '100%' }}
            >
                {props.ready && (
                    <View style={styles.searching}>
                        <Text style={styles.searchingText}>Searching...</Text>
                    </View>
                )}

                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ImageBackground
                        source={require('../images/userSelection.png')}
                        style={{
                            width: 450,
                            height: 450,
                            justifyContent: 'center',
                            marginTop: -180,
                            alignItems: 'center'
                        }}
                    >
                        {positions.map((pos, index) => {
                            const isBottomSlot = index === positions.length - 1;

                            // 👇 bottom is ALWAYS me
                            const player = isBottomSlot
                                ? user
                                : opponents[index];

                            return (
                                <View key={index} style={[styles.player, pos]}>
                                    <View style={styles.userAvatar}>
                                        <View style={styles.avatarWrap}>
                                            <Image
                                                source={
                                                    userAvatars[player?.avatar] ||
                                                    require('../avatars/user.jpg')
                                                }
                                                style={styles.avatarImage}
                                            />
                                        </View>

                                    </View>

                                    <Text style={styles.userText}>
                                        {isBottomSlot
                                            ? 'Me'
                                            : player?.username || 'Waiting...'}
                                    </Text>
                                </View>
                            );
                        })}
                    </ImageBackground>
                </View>
            </ImageBackground>
        </View>
    );
};

export default CommonSelectionRoom;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },
    avatarWrap: {
        width: 72,
        height: 72,
        borderRadius: 35,
        borderWidth: 2,
        borderColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
    },

    avatarImage: {
        width: 55,
        height: 55,
        borderRadius: 27,
        resizeMode: 'contain',
    },

    userText: {
        color: '#fff',
        fontWeight: 'bold',
        marginTop: 5,
    },
    player: {
        position: 'absolute',
        alignItems: 'center',
    },
    searching: {
        position: 'absolute',
        top: '12%',
        left: '35%',
    },
    searchingText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 22,
    },
});
