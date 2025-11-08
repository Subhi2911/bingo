/* eslint-disable react-native/no-inline-styles */
import { StyleSheet, Text, View, ImageBackground, TouchableOpacity, Image } from 'react-native'
import React from 'react'


const CommonSelectionRoom = (props) => {
    console.log(props.matchedPlayers);
    const playerPositions = {
        1: [
            { bottom: '2%', left: '11%' }
        ],
        2: [
            { top: '27%', right: '8%' },
            { bottom: '2%', left: '11%' }
        ],
        3: [
            { top: '27%', left: '11%' },
            { top: '27%', right: '8%' },
            { bottom: '2%', left: '11%' },

        ],
        4: [
            { top: '27%', left: '11%' },
            { top: '27%', right: '8%' },
            { bottom: '2%', right: '8%' },
            { bottom: '2%', left: '11%' }
        ],
        5: [
            { top: '27%', left: '11%' },
            { top: '27%', right: '8%' },
            { bottom: '2%', right: '8%' },
            { bottom: '2%', left: '11%' },
            { top: '63%', left: '43%' }
        ]
    };

    const positions = playerPositions[props.players] || playerPositions[1];

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('../images/RegisterPage.png')}
                style={{ flex: 1, width: '100%', height: '100%' }}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ImageBackground
                        source={require('../images/userSelection.png')}
                        style={{ width: 400, height: 400, justifyContent: 'center', marginTop: -180, alignItems: 'center' }}
                    >
                        {positions.map((pos, index) => (
                            <View key={index} style={[styles.player, pos]}>
                                <View
                                    style={[
                                        styles.userAvatar,
                                    ]}
                                >
                                    <Image
                                        source={require('../avatars/daub.png')}
                                        style={[styles.userAvatar,{objectFit:'contain'}]}
                                    />
                                </View>
                                <Text style={styles.userText}>
                                    {index === positions.length - 1
                                        ? "Me"
                                        : props.matchedPlayers[index]?.username || `P${index + 1}`}
                                </Text>

                            </View>
                        ))}

                    </ImageBackground>


                </View>
            </ImageBackground>
        </View>
    )
}

export default CommonSelectionRoom

const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: '100%',
        width: '100%',
    },
    userAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F8B55F',
        borderWidth: 2,
        borderColor: '#fff',

    },
    userText: {
        color: '#fff',
        fontWeight: 'bold',
        marginTop: 5
    },
    player: {
        position: 'absolute',
        alignItems: 'center'
    },

})
