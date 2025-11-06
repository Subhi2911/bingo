/* eslint-disable react-native/no-inline-styles */
import { StyleSheet, Text, View, ImageBackground, TouchableOpacity, Image } from 'react-native'
import React from 'react'


const CommonSelectionRoom = () => {
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
                        <View />
                    </ImageBackground>
                    <TouchableOpacity style={styles.claimBtn}>
                        <Text style={{ color: "#fff", fontWeight: "bold" }}>Start Game</Text>
                    </TouchableOpacity>

                </View>
            </ImageBackground>
        </View>
    )
}

export default CommonSelectionRoom

const styles = StyleSheet.create({
    container:{
        flex: 1,
        height: '100%',
        width: '100%',
    },
    claimBtn: {
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
    },
})
