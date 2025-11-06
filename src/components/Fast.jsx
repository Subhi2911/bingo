import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CommonSelectionRoom from './CommonSelectionRoom'

const Fast = () => {
    const [gameStarted, setGameStarted] = React.useState(false);
    return (
        <View style={{ flex: 1 }}>
            {!gameStarted && <CommonSelectionRoom />}
        </View>
    )
}

export default Fast

const styles = StyleSheet.create({})