/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ImageBackground,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { BACKEND_URL } from "../config/backend";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

const NotificationScreen = () => {
    const navigation = useNavigation();
    const [notifications, setNotifications] = useState([]);

    const fetchNotifications = async () => {
        
        try {
            const token = await AsyncStorage.getItem("authToken");
            const res = await fetch(`${BACKEND_URL}/api/notifications`, {
                headers: { "auth-token": token },
            });
            console.log(res);
            if (!res.ok) return;

            const data = await res.json();
            console.log(res);
            console.log(data);
            setNotifications(data);
        } catch (err) {
            console.log("Notification fetch error:", err);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    return (
        <ImageBackground
            source={require("../images/message_bg.png")}
            style={styles.background}
            resizeMode="cover"
        >
            <SafeAreaView style={styles.overlay}>
                <View style={styles.header}>
                    <Icon
                        name="arrow-left"
                        size={26}
                        color="#000"
                        onPress={() => navigation.goBack()}
                    />
                    <Text style={styles.NotificationsText}>Notifications</Text>



                </View>
                <FlatList
                    data={notifications}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.notificationItem,
                                !item.read && styles.unread,
                            ]}
                        >
                            <Text style={styles.title}>{item.title}</Text>
                            <Text style={styles.body}>{item.body}</Text>
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>
                            No notifications yet
                        </Text>
                    }
                />
            </SafeAreaView>
        </ImageBackground>
    );
};

export default NotificationScreen;

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        paddingHorizontal: 16,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    NotificationsText: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 16,
        color: '#000',
    },
    notificationItem: {
        backgroundColor: "#ffffffee",
        padding: 14,
        borderRadius: 12,
        marginBottom: 10,
    },
    unread: {
        borderLeftWidth: 5,
        borderLeftColor: "#4da6ff",
    },
    title: {
        fontWeight: "700",
        fontSize: 16,
        color: "#222",
    },
    body: {
        marginTop: 4,
        fontSize: 14,
        color: "#555",
    },
    emptyText: {
        color: "#000000",
        textAlign: "center",
        marginTop: 70,
        fontSize: 16,
        fontWeight:700
    },
});