/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    ImageBackground,
    Touchable
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRoute, useNavigation } from "@react-navigation/native";
import { BACKEND_URL } from "../config/backend";
import { SafeAreaView } from "react-native-safe-area-context";

const OtherProfile = () => {
    const route = useRoute();
    const navigation = useNavigation();
    const { userId } = route.params;

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [requestStatus, setRequestStatus] = useState("none");

    useEffect(() => {
        fetchUserProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchUserProfile = async () => {
        try {
            const token = await AsyncStorage.getItem("authToken");

            const res = await fetch(`${BACKEND_URL}/api/auth/user/${userId}`, {
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": token,
                },
            });

            const data = await res.json();
            console.log("Fetched user:", data);

            // Set the user directly
            setUser(data);

            // If your backend sends requestStatus, use it; otherwise default to "none"
            setRequestStatus(data.requestStatus || "none");

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const sendFriendRequest = async () => {
        try {
            const token = await AsyncStorage.getItem("authToken");

            const res = await fetch(`${BACKEND_URL}/api/auth/send-request/${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "auth-token": token,
                },
            });

            if (res.ok) {
                setRequestStatus("sent");
            }
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" color="#FFD67A" />
            </View>
        );
    }

    if (!user) {
        return (
            <ImageBackground
                source={require("../images/FriendsPage.png")}
                style={styles.backgroundImage}
            >
                <SafeAreaView>
                    <View style={styles.header}>
                        <Icon
                            name="arrow-left"
                            size={26}
                            color="#000"
                            onPress={() => navigation.goBack()}
                        />
                        <Text style={styles.BackText}>Back</Text>
                    </View>
                    <View style={styles.center}>
                        <Text style={{ color: "#fff" }}>User not found</Text>
                    </View>
                </SafeAreaView>
            </ImageBackground>
        );
    }

    return (
        <View>
            <ImageBackground
                source={require("../images/FriendsPage.png")}
                style={{ height: "100%", width: "100%" }}
            >
                <View style={styles.container}>

                    {/* HEADER */}
                    <View style={styles.header}>
                        <Icon
                            name="arrow-left"
                            size={26}
                            color="#000"
                            onPress={() => navigation.goBack()}
                        />
                        <Text style={styles.BackText}>Back</Text>
                    </View>

                    {/* AVATAR */}
                    <View style={styles.avatarCard}>
                        <View style={styles.avatarGlow} />
                        <Text style={styles.avatarEmoji}>{user.avatar || '🐟'}</Text>

                        <View style={styles.levelBadge}>
                            <Text style={styles.levelText}>⭐ Lv {user.level}</Text>
                        </View>
                    </View>

                    <Text style={styles.username}>{user.username}</Text>

                    <View style={styles.statusRow}>
                        <View style={styles.onlineDot} />
                        <Text style={styles.statusText}>Online</Text>
                    </View>

                    <Text style={styles.playerId}>ID: {user.playerId}</Text>

                    {/* USER INFO */}
                    <Text style={styles.username}>{user.username}</Text>
                    <Text style={styles.playerId}>ID: {user.playerId}</Text>

                    {/* STATS */}
                    <View style={styles.statsGrid}>
                        <GameStat icon="trophy" emoji="🏆" label="Wins" value={user.wins.length || 0} />
                        <GameStat icon="star" emoji="⭐" label="Level" value={user.level} />
                        <GameStat icon="bolt" emoji="⚡" label="XP" value={user.xp} />
                        <GameStat icon="fire" emoji="🔥" label="Streak" value={user.streak || 0} />
                    </View>

                    <View style={styles.achievementRow}>
                        {["🥇", "🔥", "👑", "🎯"].map((item, i) => (
                            <View key={i} style={styles.achievementBadge}>
                                <Text style={{ fontSize: 22 }}>{item}</Text>
                            </View>
                        ))}
                    </View>

                    {/* FRIEND ACTION */}
                    {requestStatus === "friends" ? (
                        <View style={styles.friendBadge}>
                            <Icon name="check" size={14} color="#02ac4f" />
                            <Text style={styles.friendText}>Friends</Text>
                        </View>
                    ) : requestStatus === "sent" ? (
                        <View style={styles.pendingBadge}>
                            <Icon name="clock" size={14} color="#FFD67A" />
                            <Text style={styles.pendingText}>Request Sent</Text>
                        </View>
                    ) : (
                        <TouchableOpacity
                            style={styles.addBtn}
                            onPress={sendFriendRequest}
                        >
                            <Icon name="user-plus" size={16} color="#23203C" />
                            <Text style={styles.addBtnText}>Add Friend</Text>
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity style={styles.reportBtn}>
                        <Icon name="exclamation-triangle" size={16} color="#ff0033" />
                        <Text style={styles.addBtnText}>Report User</Text>
                    </TouchableOpacity>
                </View>
            </ImageBackground>
        </View >
    );
};
const GameStat = ({ icon, emoji, label, value }) => (
    <View style={styles.statCard}>
        <Icon name={icon} size={22} color="#FFD67A" />
        <Text style={styles.statEmoji}>{emoji}</Text>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
    </View>
);



export default OtherProfile;

const styles = StyleSheet.create({
    backgroundImage: {
        flex: 1,
        resizeMode: "cover",
    },
    container: {
        flex: 1,
        alignItems: "center",
        paddingTop: 40,
    },
    BackText: {
        fontSize: 22,
        fontWeight: "bold",
        marginLeft: 16,
        color: "#000",
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    headerText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "600",
        marginLeft: 16,
    },
    avatar: {
        width: 220,
        height: 220,
        borderRadius: 110,
        marginTop: 20,
        //backgroundColor: "#ebdede",
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000'
    },
    username: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "800",
        marginTop: 12,
    },
    playerId: {
        color: "#000000",
        marginTop: 4,
    },
    statsRow: {
        flexDirection: "row",
        marginTop: 25,
        gap: 20,
    },
    statBox: {
        alignItems: "center",
    },
   
    
    addBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#FFD67A",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginTop: 30,
    },
    addBtnText: {
        fontWeight: "700",
        color: "#23203C",
    },
    reportBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#ffcccc",
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginTop: 15,
    },
    avatarCard: {
  marginTop: 20,
  alignItems: "center",
  justifyContent: "center",
},
avatarGlow: {
  position: "absolute",
  width: 240,
  height: 240,
  borderRadius: 120,
  backgroundColor: "#FFD67A",
  opacity: 0.25,
},
avatarEmoji: {
  fontSize: 110,
  backgroundColor: "#000",
  width: 220,
  height: 220,
  borderRadius: 110,
  textAlign: "center",
  textAlignVertical: "center",
},
levelBadge: {
  position: "absolute",
  bottom: 10,
  right: 20,
  backgroundColor: "#FFD67A",
  paddingHorizontal: 10,
  paddingVertical: 4,
  borderRadius: 12,
},
levelText: {
  fontWeight: "800",
  color: "#000",
},

statusRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
  marginTop: 4,
},
onlineDot: {
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: "#00ff6a",
},
statusText: {
  color: "#00ff6a",
  fontWeight: "600",
},

statsGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 14,
  marginTop: 25,
},
statCard: {
  width: 140,
  backgroundColor: "#1e1b3a",
  borderRadius: 18,
  padding: 12,
  alignItems: "center",
},
statEmoji: { fontSize: 20 },
statValue: {
  color: "#FFD67A",
  fontSize: 20,
  fontWeight: "800",
},
statLabel: {
  color: "#fff",
  fontSize: 12,
},

achievementRow: {
  flexDirection: "row",
  gap: 12,
  marginTop: 20,
},
achievementBadge: {
  backgroundColor: "#23203C",
  padding: 10,
  borderRadius: 12,
},

actionRow: {
  flexDirection: "row",
  gap: 12,
  marginTop: 30,
},
primaryBtn: {
  flexDirection: "row",
  gap: 8,
  backgroundColor: "#FFD67A",
  paddingHorizontal: 20,
  paddingVertical: 12,
  borderRadius: 25,
},
primaryBtnText: {
  fontWeight: "800",
  color: "#000",
},
secondaryBtn: {
  backgroundColor: "#4e4aff",
  padding: 12,
  borderRadius: 50,
},
dangerBtn: {
  backgroundColor: "#ff3b3b",
  padding: 12,
  borderRadius: 50,
},

    pendingBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 30,
    },
    pendingText: {
        color: "#FFD67A",
        fontWeight: "600",
    },
    friendBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginTop: 30,
    },
    friendText: {
        color: "#02ac4f",
        fontWeight: "600",
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#23203C",
    },
});
