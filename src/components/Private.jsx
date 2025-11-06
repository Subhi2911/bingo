import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import CommonSelectionRoom from './CommonSelectionRoom'

const Private = () => {
    const [gameStarted, setGameStarted] = React.useState(false);
    return (
        <View style={{ flex: 1 }}>
            {!gameStarted && <CommonSelectionRoom />}
        </View>
    )
}

export default Private

const styles = StyleSheet.create({})