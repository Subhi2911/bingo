/* eslint-disable react-native/no-inline-styles */
import { View, Text, ImageBackground, StyleSheet, FlatList, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from "react-native-vector-icons/FontAwesome5";
import { useNavigation } from '@react-navigation/native';

const Missions = () => {
    const navigation = useNavigation();

    // Actual Bingo Missions
    const initialMissions = [
        { id: 1, title: "Daub 10 numbers", description: "Mark 10 numbers in any game.", reward: "50 XP", claimed: false, rewardType:"XP"},
        { id: 2, title: "Win 1 Classic Game", description: "Win your first classic Bingo game.", reward: "100 XP", claimed: false ,rewardType:"XP"},
        { id: 3, title: "Win 1 Fast Game", description: "Win your first fast Bingo game.", reward: "120 XP", claimed: false,rewardType:"XP" },
        { id: 4, title: "Collect 500 Coins", description: "Earn 500 coins by playing games.", reward: "50 Coins", claimed: false ,rewardType:"coins" },
        { id: 5, title: "Daub 12 numbers", description: "Mark 50 numbers in any games.", reward: "150 XP", claimed: false ,rewardType:"XP" },
        { id: 6, title: "Win 3 Classic Games", description: "Win 3 classic Bingo games.", reward: "300 XP", claimed: false ,rewardType:"XP"},
        { id: 7, title: "Win 3 Fast Games", description: "Win 3 fast Bingo games.", reward: "350 XP", claimed: false ,rewardType:"XP"},
        { id: 8, title: "Play 5 Games", description: "Participate in 5 Bingo games.", reward: "75 XP", claimed: false ,rewardType:"XP"},
        { id: 9, title: "Invite a Friend", description: "Invite a friend to play Bingo.", reward: "100 Coins", claimed: false ,rewardType:"coins"},
        { id: 10, title: "Reach +5 level", description: "Level up to level 5.", reward: "200 XP", claimed: false ,rewardType:"XP"},
        { id: 11, title: "Win with Bingo Pattern", description: "Win a game with a full Bingo pattern.", reward: "250 XP", claimed: false ,rewardType:"XP"},
        { id: 12, title: "Daub 15 numbers", description: "Mark 100 numbers in total.", reward: "300 XP", claimed: false ,rewardType:"XP"},
        { id: 13, title: "Win 5 Classic Games", description: "Win 5 classic Bingo games.", reward: "500 XP", claimed: false ,rewardType:"XP"},
        { id: 14, title: "Win 5 Fast Games", description: "Win 5 fast Bingo games.", reward: "550 XP", claimed: false ,rewardType:"XP"},
        { id: 15, title: "Collect 2000 Coins", description: "Earn 2000 coins from games.", reward: "500 Coins", claimed: false ,rewardType:"coins"},
        { id: 16, title: "Play 20 Games", description: "Participate in 20 Bingo games.", reward: "250 XP", claimed: false ,rewardType:"XP"},
        { id: 17, title: "Get 3 BINGOs in a row", description: "Win 3 games in a row with Bingo.", reward: "400 XP", claimed: false ,rewardType:"XP"},
        { id: 18, title: "Reach +10 level", description: "Level up to level 10.", reward: "400 XP", claimed: false ,rewardType:"XP"},
        { id: 19, title: "Invite 3 Friends", description: "Invite 3 friends to the game.", reward: "300 Coins", claimed: false ,rewardType:"coins" },
        { id: 20, title: "Win 10 Fast Games", description: "Win 10 fast Bingo games.", reward: "1000 XP", claimed: false ,rewardType:"XP"},
    ];

    const [missions, setMissions] = useState(initialMissions);

    const claimReward = (id) => {
        setMissions(missions.map(m => m.id === id ? { ...m, claimed: true } : m));
    }

    const renderMission = ({ item }) => (
        <View style={styles.card}>
            <View style={{ flex: 1 }}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.reward, {color:item.rewardType==='coins'?'#F8B55F':'#30c30c'}]}>{item.reward}</Text>
                <TouchableOpacity
                    style={[styles.claimBtn, item.claimed && { backgroundColor: '#aaa' }]}
                    disabled={item.claimed}
                    onPress={() => claimReward(item.id)}
                >
                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                        {item.claimed ? 'Claimed' : 'Claim'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <ImageBackground
                source={require('../images/FriendsPage.png')}
                style={{ flex: 1 }}
            >
                <SafeAreaView style={{ flex: 1 }}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Icon
                            name="arrow-left"
                            size={26}
                            color="#000"
                            onPress={() => navigation.goBack()}
                        />
                        <Text style={styles.MissionText}>Missions</Text>
                    </View>

                    {/* Missions List */}
                    <FlatList
                        data={missions}
                        keyExtractor={item => item.id.toString()}
                        renderItem={renderMission}
                        contentContainerStyle={{ padding: 16, paddingTop: 20 }}
                        showsVerticalScrollIndicator={true}
                    />
                </SafeAreaView>
            </ImageBackground>
        </View>
    )
}

export default Missions

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 20,
        marginHorizontal: 16,
    },
    MissionText: {
        fontSize: 22,
        fontWeight: "bold",
        marginLeft: 16,
        color: "#000",
    },
    card: {
        flexDirection: 'row',
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: 12,
        borderRadius: 12,
        marginBottom: 12,
        alignItems: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    description: {
        fontSize: 13,
        color: '#555',
        marginTop: 4,
    },
    reward: {
        fontSize: 14,
        fontWeight: 'bold',
        //color: '#F8B55F',
        marginBottom: 8,
    },
    claimBtn: {
        backgroundColor: '#52357B',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
});
