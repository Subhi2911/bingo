import { FlatList, ImageBackground, StyleSheet, Text, TouchableOpacity, View, Image, AsyncStorage } from 'react-native'
import React from 'react';
import Icon from "react-native-vector-icons/FontAwesome5";
import { useNavigation } from '@react-navigation/native';

import { BACKEND_URL } from '../config/backend';

const Ranking = () => {
    const [selectedMode, setSelectedMode] = React.useState("world");
    const navigation = useNavigation();
    const [topUsers, setTopUsers]=React.useState(null);
    const [userRank, setUserRank] = React.useState(null);
    const [currentUser, setCurrentUser] = React.useState(null);
    

    const fetchLeaderboard = async () => {
    try {
        const token = await AsyncStorage.getItem('authToken');

        const res = await fetch(`${BACKEND_URL}/api/leaderboard`, {
            headers: {
                'auth-token': token,
            },
        });

        const data = await res.json();

        setTopUsers(data.topUsers);
        setUserRank(data.userRank);
        setCurrentUser(data.currentUser);

    } catch (err) {
        console.log(err);
    }
};


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
                source={require('../images/FriendsPage.png')}
                style={{ flex: 1 }}
            >
                <View style={styles.header}>
                    <Icon
                        name="arrow-left"
                        size={26}
                        color="#000"
                        onPress={() => navigation.goBack()}
                    />
                    <Text style={styles.RankingText}>Ranking</Text>
                </View>
                <Image
                    source={require('../images/podium.png')}
                    style={styles.podium}
                />

                {/* Mode selector */}
                <View style={styles.playersList}>
                    {['world', 'area', 'friends'].map(mode => (
                        <TouchableOpacity
                            key={mode}
                            style={[styles.selectBtn, selectedMode === mode && { backgroundColor: "#F8B55F" }]}
                            onPress={() => setSelectedMode(mode)}
                        >
                            <Text style={{ color: "#fff", fontWeight: "bold" }}>{mode.charAt(0).toUpperCase() + mode.slice(1)}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* FlatList */}
                <View style={styles.list}>
                    <View style={styles.heading}>
                        <Text style={styles.headingText}>Name</Text>
                        <Text style={styles.headingText}>Level</Text>
                        <Text style={styles.headingText}>XP</Text>
                    </View>

                    <FlatList
                        data={topUsers}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={({ item }) => (
                            <View style={styles.content}>
                                <Text style={styles.contentText}>{item.name} (India)</Text>
                                <Text style={styles.levelText}>{item.level}</Text>
                                <Text style={styles.xpText}>{item.xp} XP</Text>
                            </View>
                        )}
                        showsVerticalScrollIndicator={true}
                    />
                </View>
            </ImageBackground>
        </View>
    )
}

export default Ranking

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
        //paddingHorizontal: 16,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 60, // header a little lower
        marginHorizontal: 16,
    },
    RankingText: {
        fontSize: 22,
        fontWeight: "bold",
        marginLeft: 16,
        color: "#000",
    },
    podium: {
        width: '100%',
        height: '35%',
        resizeMode: 'contain',
        alignSelf: 'center',
    },
    playersList: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        //marginTop: 0,
        marginBottom: 10,
    },
    selectBtn: {
        backgroundColor: '#252526',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
    },
    list: {
        flex: 1,
    },
    heading: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
        paddingHorizontal: 10,
        borderBottomWidth: 2,
        borderBottomColor: '#F8B55F',
    },
    headingText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
        width: 100,
        textAlign: 'center',
    },
    content: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        height: 40,
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#fff',
    },
    contentText: {
        color: '#fff',
        fontWeight: 'bold',
        width: 100,
        textAlign: 'center',
    },
    levelText: {
        color: '#F8B55F',
        fontWeight: 'bold',
        width: 50,
        textAlign: 'center',
    },
    xpText: {
        color: '#FFE1E0',
        fontWeight: 'bold',
        width: 80,
        textAlign: 'center',
    },
})
