/* eslint-disable react-native/no-inline-styles */
import { StyleSheet, Text, View, Image, Pressable, TextInput, ImageBackground } from 'react-native'
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Signup from './Signup';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Intro from './Intro';

const Home = () => {
    const navigation = useNavigation();
    const [loading, setLoading] = React.useState(true);
    const [loggedIn, setLoggedIn] = React.useState(false);
    const [view, setView] = React.useState(1);

    React.useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem("authToken");
            if (token) {
                setLoggedIn(true);
                navigation.navigate("Dashboard");
            } else {
                setLoggedIn(false);

            }
        };

        checkAuth();
    }, [navigation]);


    React.useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <SafeAreaView >
            {<>
                {loading &&
                    <Intro/>
                }
                {!loading && !loggedIn && (
                    <ImageBackground
                        source={require('../images/RegisterPage.png')}
                        style={{ width: '100%', height: '100%' }}
                    >
                        <>
                            <View style={styles.register}>
                                <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#F8B55F', maarginTop: '10' }}>Welcome to Bingo App!</Text>
                                <View>
                                    <View style={{ flexDirection: 'row', width: '100%' }}>
                                        <Pressable style={[styles.view, view === 1 ? { backgroundColor: '#F8B55F' } : {}]} onPress={() => setView(1)}>
                                            <Text style={{ fontSize: 16, fontWeight: '500', color: '#FFFFFF' }}>Register</Text>
                                        </Pressable>
                                        <Pressable style={[styles.view, view === 2 ? { backgroundColor: '#F8B55F' } : {}]} onPress={() => setView(2)}>
                                            <Text style={{ fontSize: 16, fontWeight: '500', color: '#FFFFFF' }}>Login</Text>
                                        </Pressable>
                                    </View>
                                    <View>
                                        {view === 1 &&
                                            <Signup />}
                                        {view === 2 &&
                                            <View style={{ width: '100%', marginTop: 20, gap: 10 }}>
                                                <Text style={{ fontSize: 16, fontWeight: '500', color: '#FFFFFF' }}>Email</Text>
                                                <TextInput style={{ width: 300, height: 40, backgroundColor: '#FFFFFF', borderRadius: 5, paddingLeft: 10, marginBottom: 10 }} placeholder='Enter your email' />
                                                <Text style={{ fontSize: 16, fontWeight: '500', color: '#FFFFFF' }}>Password</Text>
                                                <TextInput style={{ width: 300, height: 40, backgroundColor: '#FFFFFF', borderRadius: 5, paddingLeft: 10, marginBottom: 10 }} placeholder='Enter your password' secureTextEntry={true} />
                                            </View>}
                                    </View>
                                </View>
                            </View>

                        </>
                    </ImageBackground>
                )}
                {
                    loggedIn && (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#000000' }}>You are logged in!</Text>
                        </View>
                    )
                }
            </>}
        </SafeAreaView>
    )
}

export default Home

const styles = StyleSheet.create({
    overlay: {
        display: 'flex',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        //backgroundColor: '#3D365C',
        zIndex: 10,

    },
    register: {
        height: '100%',
        widht: '100%',
        alignItems: 'center',
        //backgroundColor: '#7C4585',
        zIndex: 10,
        paddingTop: 50
    },
    view: {
        marginTop: 20,
        marginRight: 10,
        padding: 10,
    }
})
