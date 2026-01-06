import { Image, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import AsyncStorage from "@react-native-async-storage/async-storage";
import { BACKEND_URL } from '../config/backend';


const Profile = () => {
    const [user, setUser] = React.useState(null);
    
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

    const avatarMap = {
        daub: require("../images/daub.png"),
    };
    return (
        <SafeAreaView>
            <View style={styles.container}>
                <View style={styles.avatarContainer}>
                    {user && user.avatar ? ( 
                        <Image source={avatarMap[user.avatar]} style={styles.avatar} />
                    ) : (
                        <Image source= {require("../images/user.jpg")} style={styles.avatar} />
                    )}
                </View>
                <View>
                    {user && (
                        <>
                        <Text style={styles.name}>Name: {user.username}</Text>
                        <Text style={styles.email}>Email: {user.email}</Text>
                        </>
                    )}
                </View>
            </View>
        </SafeAreaView>
    )
}

export default Profile

const styles = StyleSheet.create({
    container: {
        marginTop: 50,
        //flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
    },
    avatarContainer: {
        width: 200,
        height: 200,
        borderRadius: 100,
        borderWidth: 2,
        borderColor: "#F8B55F",
        overflow: "hidden",
    },
    avatar: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    name: {
        fontSize: 24,
        fontWeight: "bold",
        marginTop: 20,
        textAlign: "center",
        color: "#fff",
    },
    email: {
        fontSize: 18,
        marginTop: 10,
        textAlign: "center",
        color: "#FFD67A",
    },
})