/* eslint-disable react-native/no-inline-styles */
import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const Intro = () => {
    return (
        <>
            <ImageBackground 
                source={require('../images/Bingo Balls and Cards home bg.png')}
                style={styles.overlay}
            > 
                <View style={styles.overlay}>
                    <Image
                        source={require('../images/BingoIcon.png')}
                        style={{ width: 150, height: 150, borderRadius: 20 }}
                    />
                </View>
            </ImageBackground>
        </>
    )
}

export default Intro

const styles = StyleSheet.create({
    overlay: {
        display: 'flex',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        //backgroundColor: '#3D365C',
        zIndex: 10,

    },
})