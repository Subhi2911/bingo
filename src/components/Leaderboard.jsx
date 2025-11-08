/* eslint-disable react-native/no-inline-styles */
import { FlatList, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { Image } from 'expo-image'

const Play = () => {
    const [selectedMode, setSelectedMode] = React.useState("world");
    const dummyData = [
        { "id": 1, "name": "Aarav", "level": 12, "xp": 11523 },
        { "id": 2, "name": "Priya", "level": 7, "xp": 6734 },
        { "id": 3, "name": "Rahul", "level": 20, "xp": 19512 },
        { "id": 4, "name": "Sneha", "level": 3, "xp": 2478 },
        { "id": 5, "name": "Vikram", "level": 15, "xp": 14321 },
        { "id": 6, "name": "Maya", "level": 1, "xp": 512 },
        { "id": 7, "name": "Omar", "level": 9, "xp": 8650 },
        { "id": 8, "name": "Lina", "level": 27, "xp": 26890 },
        { "id": 9, "name": "Jose", "level": 5, "xp": 4567 },
        { "id": 10, "name": "Mei", "level": 18, "xp": 17643 },
        { "id": 11, "name": "Fatima", "level": 13, "xp": 12678 },
        { "id": 12, "name": "Leo", "level": 22, "xp": 21789 },
        { "id": 13, "name": "Zoe", "level": 4, "xp": 3489 },
        { "id": 14, "name": "Ethan", "level": 30, "xp": 29534 },
        { "id": 15, "name": "Nisha", "level": 11, "xp": 10880 },
        { "id": 16, "name": "Sam", "level": 2, "xp": 1850 },
        { "id": 17, "name": "Chen", "level": 16, "xp": 15211 },
        { "id": 18, "name": "Olga", "level": 14, "xp": 13654 },
        { "id": 19, "name": "Amrita", "level": 8, "xp": 7462 },
        { "id": 20, "name": "Diego", "level": 19, "xp": 18333 },
        { "id": 21, "name": "Hana", "level": 6, "xp": 5234 },
        { "id": 22, "name": "Luca", "level": 21, "xp": 20567 },
        { "id": 23, "name": "Aisha", "level": 24, "xp": 23701 },
        { "id": 24, "name": "Tom", "level": 10, "xp": 9544 },
        { "id": 25, "name": "Kiran", "level": 17, "xp": 16620 },
        { "id": 26, "name": "Sara", "level": 25, "xp": 24399 },
        { "id": 27, "name": "Ivan", "level": 29, "xp": 28712 },
        { "id": 28, "name": "Priyanka", "level": 23, "xp": 22110 },
        { "id": 29, "name": "Arjun", "level": 26, "xp": 25345 },
        { "id": 30, "name": "Bella", "level": 31, "xp": 30456 }
    ]

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('../images/podium.png')}
                style={styles.podium}
            >
                <View />
            </ImageBackground>
            <View style={styles.playersList}>
                <TouchableOpacity style={[styles.selectBtn, selectedMode === "world" ? { backgroundColor: "#F8B55F" } : {}]} onPress={() => { setSelectedMode("world") }}>
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>World</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.selectBtn, selectedMode === "area" ? { backgroundColor: "#F8B55F" } : {}]} onPress={() => { setSelectedMode("area") }}>
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>Area</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.selectBtn, selectedMode === "friends" ? { backgroundColor: "#F8B55F" } : {}]} onPress={() => { setSelectedMode("friends") }}>
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>Friends</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.list}>
                <View style={styles.heading}>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>Name </Text>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>Level </Text>
                    <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18, marginBottom: 10 }}>XP </Text>
                </View>
                {(selectedMode==='world' || selectedMode==='area'|| selectedMode==='friends') && 
                <FlatList
                    data={dummyData}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.content}>
                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>{item.name} (India)</Text>
                            <Text style={{ color: '#F8B55F', fontWeight: 'bold' }}>{item.level}</Text>
                            <Text style={{ color: '#FFE1E0' ,fontWeight: 'bold'}}>{item.xp} XP</Text>
                        </View>
                    )}
                />}
            </View>
        </View>
    )
}

export default Play

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        paddingLeft: '10%',
    },
    podium: {
        width: '90%',
        height: '55%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    playersList: {
        flexDirection: 'row',
        gap: 15,
        position: 'absolute',
        top: '30%',
    },
    selectBtn: {
        backgroundColor: '#252526',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    list: {
        position: 'absolute',
        top:'40%',
        height: '50%',
    },
    heading: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 300,
        paddingBottom: 10,
        borderBottomWidth: 2,
        borderBottomColor: '#F8B55F',
        marginBottom: 10,
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 300,
        marginBottom: 8,
        height: 40,
        alignItems: 'center',
        borderBottomColor: '#ffffff',
        borderBottomWidth: 1,
    },
})