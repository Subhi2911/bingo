/* eslint-disable react-native/no-inline-styles */
import { StyleSheet, Text, View, ImageBackground, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import CommonSelectionRoom from './CommonSelectionRoom'


const Classic = () => {
    const [gameStarted, setGameStarted] = React.useState(false);
    return (
        <View style={{ flex: 1 }}>
            {!gameStarted && <CommonSelectionRoom />}
        </View>
    )
}

export default Classic

const styles = StyleSheet.create({})
