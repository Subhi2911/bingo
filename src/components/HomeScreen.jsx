/* eslint-disable react-native/no-inline-styles */
import React from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    Modal,
    Pressable,
    ImageBackground,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { BACKEND_URL } from "../config/backend";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HomeScreen = () => {
    const navigation = useNavigation();

    const [showRewardsModal, setShowRewardsModal] = React.useState(false);
    const [user, setUser] = React.useState(null);

    const launchGame = (mode) => {
        navigation.navigate(mode);
    };

    React.useEffect(() => {
        const getUser = async () => {
            try {
                const token = await AsyncStorage.getItem("authToken");
                const response = await fetch(`${BACKEND_URL}/api/auth/getuser`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "auth-token": token,
                    },
                });
                const json = await response.json();
                setUser(json);
            } catch (error) {
                console.error(error);
            }
        };
        getUser();
    }, []);

    const dailyReward = {
        1: "100 coins",
        2: "2XP",
        3: "150 coins",
        4: "Mystery Box",
        5: "1x spin",
        6: "4XP",
        7: "1000 coins",
    };

    const handleClaimRewards = async () => {
        try {
            const token = await AsyncStorage.getItem("authToken");
            const response = await fetch(`${BACKEND_URL}/api/games/daily-claim`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": token,
                },
            });
            const json = await response.json();
            console.log(json);
            setUser(json.user);
            alert(json.message);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <View style={styles.container}>
            {/* DAILY REWARD CARD */}
            <Pressable
                style={styles.rewardCard}
                onPress={() => setShowRewardsModal(true)}
            >
                <Text style={styles.rewardTitle}>Daily Reward</Text>
                <Text style={styles.rewardSub}>
                    +{dailyReward[user?.daysLoggedIn % 7 || 1]} available
                </Text>

                <TouchableOpacity style={styles.claimBtn} onPress={handleClaimRewards}>
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>
                        CLAIM
                    </Text>
                </TouchableOpacity>
            </Pressable>

            {/* USER STATS */}
            <View style={styles.userRow}>
                <Text style={styles.username}>{user?.username}</Text>
                <View style={[styles.coinRow, { gap: 20 }]}>
                    <View style={styles.coinRow}>
                        <Image
                            source={require("../images/xpicon.png")}
                            style={{ width: 25, height: 25 }}
                        />
                        <Text style={styles.xpText}> {user?.xp || 0}</Text>
                    </View>
                    <View style={styles.coinRow}>
                        <Icon name="coins" size={18} color="#F8B55F" />
                        <Text style={styles.coinText}> {user?.money}</Text>
                    </View>
                </View>
            </View>

            {/* BANNER */}
            <View style={styles.banner}>
                <Text style={styles.bannerTitle}>Weekend Rush!</Text>
                <Text style={styles.bannerSub}>Win x2 Rewards Today</Text>
            </View>

            {/* LEVEL */}
            <View style={{ marginTop: 10 }}>
                <Text style={styles.levelText}>LEVEL {user?.level}</Text>
                <View style={styles.progressBar}>
                    <View
                        style={[
                            styles.progressFill,
                            { width: `${(user?.level || 1) * 10}%` },
                        ]}
                    />
                </View>
            </View>

            {/* PLAY GRID */}
            <View style={styles.playGrid}>
                <PlayCard icon="dot-circle" label="Classic" onPress={() => launchGame("Classic")} />
                <PlayCard icon="bolt" label="Fast" onPress={() => launchGame("Fast")} />
                <PlayCard icon="magic" label="Power Bingo" onPress={() => launchGame("Power")} />
                <PlayCard icon="lock" label="Private Room" onPress={() => launchGame("Private")} />
            </View>

            {/* ACTIONS */}
            <View style={styles.actionsRow}>
                <Action icon="tasks" label="Missions" />
                <Action icon="shopping-cart" label="Shop" />
                <Action icon="trophy" label="Rank" />
            </View>

            {/* MODAL */}
            <Modal
                visible={showRewardsModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowRewardsModal(false)}
            >
                {/* Backdrop */}
                <Pressable
                    style={styles.modalBackdrop}
                    onPress={() => setShowRewardsModal(false)}
                >
                    {/* Modal Box */}
                    <Pressable
                        style={styles.modalBox}
                        onPress={() => {}}   // prevents closing
                    >
                        {/* Title */}
                        <Text style={styles.modalTitle}>Daily Rewards</Text>

                        {/* Reward Image */}
                        <ImageBackground 
                            source={require("../images/dailyclaims-bg.png")}
                            style={styles.rewardImage}
                            contentFit="contain"
                        >
                            <Text style={styles.rewardText}>
                                +{dailyReward[user?.daysLoggedIn % 7 || 1]}
                            </Text>
                        </ImageBackground>

                        {/* Claim Button */}
                        <TouchableOpacity
                            style={styles.closeBtn}
                            onPress={handleClaimRewards}
                        >
                            <Text style={{ fontWeight: "bold" }}>CLAIM REWARD</Text>
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
    );
};

const PlayCard = ({ icon, label, onPress }) => (
    <TouchableOpacity style={styles.playCard} onPress={onPress}>
        <Icon name={icon} size={26} color="#FFD67A" />
        <Text style={styles.playLabel}>{label}</Text>
    </TouchableOpacity>
);

const Action = ({ icon, label }) => (
    <TouchableOpacity style={styles.actionBox}>
        <Icon name={icon} size={24} color="#FFD67A" />
        <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
);

export default HomeScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 40,
    },
    rewardCard: {
        backgroundColor: "#3D365C",
        borderRadius: 15,
        padding: 15,
        alignItems: "center",
    },
    rewardTitle: {
        color: "#FFD67A",
        fontSize: 18,
        fontWeight: "bold",
    },
    rewardSub: {
        color: "#fff",
        marginTop: 5,
    },
    claimBtn: {
        marginTop: 8,
        backgroundColor: "#F8B55F",
        paddingHorizontal: 20,
        paddingVertical: 6,
        borderRadius: 10,
    },
    userRow: {
        marginTop: 20,
        flexDirection: "row",
        justifyContent: "space-between",
    },
    username: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
    },
    coinRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    coinText: {
        color: "#FFD67A",
        fontSize: 16,
    },
    xpText: {
        color: "#30c30c",
        fontSize: 16,
    },
    banner: {
        backgroundColor: "#23203C",
        marginTop: 25,
        padding: 15,
        borderRadius: 12,
    },
    bannerTitle: {
        color: "#FFD67A",
        fontSize: 18,
        fontWeight: "bold",
    },
    bannerSub: {
        color: "#fff",
        marginTop: 5,
    },
    levelText: {
        color: "#fff",
    },
    progressBar: {
        backgroundColor: "#fff3",
        height: 10,
        borderRadius: 10,
        marginTop: 5,
        width: "95%",
    },
    progressFill: {
        backgroundColor: "#FFD67A",
        height: "100%",
        borderRadius: 10,
    },
    playGrid: {
        marginTop: 25,
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    playCard: {
        backgroundColor: "#4A416B",
        width: "48%",
        marginBottom: 15,
        paddingVertical: 15,
        borderRadius: 12,
        alignItems: "center",
    },
    playLabel: {
        color: "#fff",
        marginTop: 6,
        fontWeight: "600",
    },
    actionsRow: {
        flexDirection: "row",
        justifyContent: "space-around",
        marginTop: 30,
    },
    actionBox: {
        alignItems: "center",
    },
    actionText: {
        color: "#fff",
        marginTop: 5,
    },

    /* MODAL */
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)", // transparent background
        justifyContent: "center",
        alignItems: "center",
    },
    modalBox: {
        //backgroundColor: "#3D365C",
        width: "85%",
        borderRadius: 18,
        alignItems: "center",
        //paddingVertical: 20,
    },
    modalTitle: {
        color: "#FFD67A",
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 5,
    },
    rewardImage: {
        width: 400,
        height: 450,
        justifyContent: "center",
        alignItems: "center",
    },
    rewardText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        backgroundColor: "rgba(0,0,0,0.4)",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 8,
    },
    closeBtn: {
        marginTop: 15,
        backgroundColor: "#F8B55F",
        paddingHorizontal: 25,
        paddingVertical: 10,
        borderRadius: 12,
    },
});
