/* eslint-disable react-native/no-inline-styles */
import {
    Image,
    ImageBackground,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Modal,
    Pressable,
    TextInput,
} from "react-native";
import React from "react";
import { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Intro from "./Intro";
import NavBar from "./NavBar";
import Icon from "react-native-vector-icons/FontAwesome5";
import HomeScreen from "./HomeScreen";
import Shop from "./Shop";
import Leaderboard from "./Leaderboard";
import Profile from "./Profile";
import Play from "./Play"
import { BACKEND_URL } from "../config/backend";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Search from "./Search";



const Dashboard = () => {
    const [loading, setLoading] = React.useState(true);
    const [selected, setSelected] = React.useState("home");
    const [user, setUser] = React.useState(null);
    const [profileModalVisible, setProfileModalVisible] = React.useState(false);
    const navigation = useNavigation();
    const [searchResults, setSearchResults] = React.useState([]);
    const [query, setQuery] = React.useState("");

    useEffect(() => {
        const timeout = setTimeout(() => {
            if (query.length >= 2) {
                searchUser(query);
            } else {
                setSearchResults([]);
            }
        }, 400);

        return () => clearTimeout(timeout);
    }, [query]);

    const searchUser = async (query) => {
        try {
            const token = await AsyncStorage.getItem("authToken");
            setSelected('search');

            const res = await fetch(
                `${BACKEND_URL}/api/auth/search-user?q=${encodeURIComponent(query)}`,
                {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "auth-token": token,
                    },
                }
            );

            if (!res.ok) return;

            const data = await res.json();
            setSearchResults(data);

        } catch (error) {
            console.error("Search error:", error);
        }
    };

    React.useEffect(() => {
        const token = AsyncStorage.getItem("authToken");
        if (!token) {
            setLoading(false);
            navigation.navigate("Home");
        }
        const timer = setTimeout(() => setLoading(false), 3000);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const openProfile = (item) => {
        navigation.navigate("OtherProfile", { userId: item._id });
    }

    React.useEffect(() => {
        const getUser = async () => {
            try {
                const token = await AsyncStorage.getItem("authToken");
                const res = await fetch(`${BACKEND_URL}/api/auth/getuser`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "auth-token": token,
                    },
                });
                const json = await res.json();
                setUser(json);
            } catch (e) {
                console.log(e);
            }
        };
        getUser();
    }, []);

   
    return (
        <View style={{ flex: 1 }}>
            {loading ? (
                <Intro />
            ) : (
                <ImageBackground
                    source={require("../images/RegisterPage.png")}
                    style={{ flex: 1 }}
                >
                    <SafeAreaView>
                        {selected !== "profile" &&
                            <>
                                <View style={styles.iconContainer}>
                                    <TouchableOpacity
                                        style={styles.avatarContainer}
                                        onPress={() => setProfileModalVisible(true)}
                                    >
                                        <View style={[styles.avatar,{backgroundColor:'#000'}]}>
                                            <Text style={{fontSize:30}}>{user?.avatar}</Text>
                                        </View>
                                    </TouchableOpacity>


                                    <View style={styles.iconContainer2}>
                                        <TouchableOpacity onPress={() => navigation.navigate("Messaging")}>
                                            <Icon name="paper-plane" size={28} color="#F8B55F" />
                                        </TouchableOpacity>
                                        <Image
                                            source={require("../images/LuckySpin.png")}
                                            style={{ width: 45, height: 45 }}
                                        />
                                    </View>
                                </View>

                                {/*Search Bar */}
                                {(selected === 'home' || selected === 'search') &&
                                    <View style={styles.searchBar}>
                                        <Icon name="search" size={18} color="#bab8cc" />
                                        <TextInput
                                            placeholder="Search by Player ID"
                                            value={query}
                                            onChangeText={setQuery}
                                            style={styles.searchInput}
                                        />
                                    </View>}
                            </>}

                    </SafeAreaView>

                    {selected === "home" && <HomeScreen />}
                    {selected === "shop" && <Shop />}
                    {selected === "leaderboard" && <Leaderboard />}
                    {selected === "profile" && <Profile />}
                    {selected === 'play' && <Play />}
                    {selected === 'search' && <Search searchResults={searchResults} onUserPress={(user) => openProfile(user)} />}

                    <NavBar selectedScreen={setSelected} />
                </ImageBackground>
            )}

            {/* PROFILE MODAL */}
            <Modal
                transparent
                visible={profileModalVisible}
                animationType="fade"
                onRequestClose={() => setProfileModalVisible(false)}
            >
                <Pressable
                    style={styles.overlay}
                    onPress={() => setProfileModalVisible(false)}
                >
                    <View style={styles.popup}>
                        <View style={[styles.popupAvatar,{backgroundColor:'#000'}]}>
                            <Text style={{fontSize:40}}>
                                {user?.avatar}
                            </Text>
                            </View>
                        <Text style={styles.name}>{user?.username}</Text>
                        <Text style={styles.email}>{user?.email}</Text>

                        <TouchableOpacity style={styles.btn} onPress={() => {
                            setProfileModalVisible(false);
                            setSelected("profile");
                        }}>
                            <Text style={styles.btnText}>Go to Profile</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.btn, styles.logout]}
                            onPress={async () => {
                                await AsyncStorage.removeItem("authToken");
                                navigation.navigate("Home");
                                setProfileModalVisible(false);
                            }}
                        >
                            <Text style={styles.logoutText}>Logout</Text>
                        </TouchableOpacity>
                        {/* <TouchableOpacity
                            style={[styles.btn, styles.logout]}
                            onPress={async () => {
                                
                                navigation.navigate("AvatarSelection");
                                setProfileModalVisible(false);
                            }}
                        >
                            <Text style={styles.logoutText}>avatar</Text>
                        </TouchableOpacity> */}
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
};

export default Dashboard;

const styles = StyleSheet.create({
    iconContainer: {
        margin: 12,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    iconContainer2: {
        flexDirection: "row",
        gap: 14,
        alignItems: "center",
    },
    avatarContainer: {
        width: 42,
        height: 42,
        borderRadius: 21,
        borderWidth: 2,
        borderColor: "#F8B55F",
        overflow: "hidden",
    },
    avatar: {
        width: "100%",
        height: "100%",
    },

    /* MODAL */
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.35)",
        justifyContent: "flex-start",
        paddingTop: 80,
        paddingLeft: 20,
    },
    popup: {
        width: 240,
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 16,
        elevation: 10,
    },
    searchBar: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#3d365cb6",
        padding: 10,
        borderRadius: 10,
        marginHorizontal: 25,
        marginTop: 10,
        gap: 5,
    },
    searchInput: {
        marginLeft: 12,
        color: "#b8b6c9",
        fontSize: 16,
        fontWeight: 600,
    },
    popupAvatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignSelf: "center",
        marginBottom: 10,
    },
    name: {
        fontSize: 16,
        fontWeight: "600",
        textAlign: "center",
    },
    email: {
        fontSize: 12,
        color: "#777",
        textAlign: "center",
        marginBottom: 12,
    },
    btn: {
        backgroundColor: "#F8B55F",
        paddingVertical: 8,
        borderRadius: 20,
        marginTop: 8,
    },
    btnText: {
        textAlign: "center",
        fontWeight: "600",
    },
    logout: {
        backgroundColor: "#FFE5E5",
    },
    logoutText: {
        color: "#D32F2F",
        textAlign: "center",
        fontWeight: "600",
    },
});
