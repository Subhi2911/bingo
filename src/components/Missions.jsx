/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import { View, Text, ImageBackground, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Icon from "react-native-vector-icons/FontAwesome5";
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../config/backend';
import { showAlert2 } from './CustomAlert2';

const Missions = () => {
    const navigation = useNavigation();
    const [missions, setMissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [claimingId, setClaimingId] = useState(null);

    const fetchMissions = useCallback(async () => {
        try {
            const token = await AsyncStorage.getItem('authToken')
            setLoading(true);
            const res = await fetch(`${BACKEND_URL}/api/missions`, {
                method: 'GET',
                headers: { "Content-Type": 'application/json', "auth-token": token },
            });
            console.log(res);
            const data = await res.json();
            if (data.success) setMissions(data.missions);
            else showAlert2({ type: 'error', title: 'Error', message: data.message || 'Failed to load missions' });
        } catch (err) {
            showAlert2({ type: 'error', title: 'Error', message: 'Could not connect to server' });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchMissions(); }, [fetchMissions]);

    const claimReward = async (id) => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            setClaimingId(id);
            const res = await fetch(`${BACKEND_URL}/api/missions/${id}/claim`, {
                method: 'POST',
                headers: { "Content-Type": 'application/json', "auth-token": token },
            });
            
            const data = await res.json();
            if (data.success) {
                setMissions(prev => prev.map(m => m.id === id ? { ...m, ...data.mission } : m));
                showAlert2({ type: 'success', title: '🎉 Reward Claimed!', message: `You received ${data.rewardAmount} ${data.rewardType}!` });
            } else {
                showAlert2({ type: 'error', title: 'Error', message: data.message || 'Could not claim reward' });
            }
        } catch (err) {
            showAlert2({ type: 'error', title: 'Error', message: 'Could not connect to server' });
        } finally {
            setClaimingId(null);
        }
    };

    const renderMission = ({ item }) => {
        const pct = Math.min(100, (item.progress / item.target) * 100);
        const canClaim = item.completed && !item.claimed;
        return (
            <View style={styles.card}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.title}>{item.title}</Text>
                    <Text style={styles.description}>{item.description}</Text>
                    <View style={styles.progressTrack}>
                        <View style={[styles.progressFill, { width: `${pct}%` }]} />
                    </View>
                    <Text style={styles.progressLabel}>{item.progress}/{item.target}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.reward, { color: item.rewardType === 'coins' ? '#F8B55F' : '#30c30c' }]}>
                        {item.reward}
                    </Text>
                    <TouchableOpacity
                        style={[styles.claimBtn, !canClaim && { backgroundColor: '#aaa' }]}
                        disabled={!canClaim || claimingId === item.id}
                        onPress={() => claimReward(item.id)}
                    >
                        {claimingId === item.id
                            ? <ActivityIndicator size="small" color="#fff" />
                            : <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                                {item.claimed && !item.repeatable ? 'Claimed' : canClaim ? 'Claim' : 'In Progress'}
                            </Text>
                        }
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <ImageBackground source={require('../images/FriendsPage.png')} style={{ flex: 1 }}>
                <SafeAreaView style={{ flex: 1 }}>
                    <View style={styles.header}>
                        <Icon name="arrow-left" size={26} color="#000" onPress={() => navigation.goBack()} />
                        <Text style={styles.MissionText}>Missions</Text>
                    </View>
                    {loading
                        ? <ActivityIndicator size="large" color="#52357B" style={{ marginTop: 40 }} />
                        : <FlatList
                            data={missions}
                            keyExtractor={item => item.id.toString()}
                            renderItem={renderMission}
                            contentContainerStyle={{ padding: 16, paddingTop: 20 }}
                            showsVerticalScrollIndicator={true}
                        />
                    }
                </SafeAreaView>
            </ImageBackground>
        </View>
    );
};

export default Missions;

const styles = StyleSheet.create({
    container: { flex: 1, width: '100%', height: '100%' },
    header: { flexDirection: "row", alignItems: "center", marginTop: 20, marginHorizontal: 16 },
    MissionText: { fontSize: 22, fontWeight: "bold", marginLeft: 16, color: "#000" },
    card: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.9)', padding: 12, borderRadius: 12, marginBottom: 12, alignItems: 'center' },
    title: { fontSize: 16, fontWeight: '600', color: '#000' },
    description: { fontSize: 13, color: '#555', marginTop: 4 },
    progressTrack: { height: 6, backgroundColor: '#e0e0e0', borderRadius: 3, marginTop: 8, overflow: 'hidden', marginRight:5 },
    progressFill: { height: 6, backgroundColor: '#7DC20A' },
    progressLabel: { fontSize: 11, color: '#777', marginTop: 4 },
    reward: { fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
    claimBtn: { backgroundColor: '#52357B', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8 },
});