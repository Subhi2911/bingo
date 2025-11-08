/* eslint-disable react-native/no-inline-styles */
import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Intro from './Intro';
import NavBar from './NavBar';
import Icon from 'react-native-vector-icons/FontAwesome5';
import HomeScreen from './HomeScreen';
import Video from 'react-native-video';
import Shop from './Shop';
import Leaderboard from './Leaderboard';

const Dashboard = () => {
    const [loading, setLoading] = React.useState(true);

    const [selected, setSelected] = React.useState("home");
    const selectedScreen = (screen) => {
        setSelected(screen);
    }

    React.useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 3000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <SafeAreaView>
            <>
                {loading &&
                    <Intro />
                }
                {!loading && (
                    <ImageBackground
                        source={require('../images/RegisterPage.png')}
                        style={{ width: '100%', height: '100%' }}
                    >
                        <View>
                            <View style={styles.iconContainer}>
                                <Icon name="user" size={30} color="#F8B55F" regular />
                                <View style={styles.iconContainer2}>
                                    <Icon name="paper-plane" size={30} color="#F8B55F" regular />
                                    <Image
                                        source={require('../images/LuckySpin.png')}
                                        style={styles.video}
                                    />
                                </View>
                            </View>

                        </View>
                        {selected === "home" &&
                            <>
                                <HomeScreen />
                            </>}
                        {selected === "shop" &&
                            <>
                                <Shop />
                            </>}
                        {selected === "leaderboard" &&
                            <>
                                <Leaderboard />
                            </>}
                        <>
                            <NavBar selectedScreen={selectedScreen} />
                        </>

                    </ImageBackground>
                )}
            </>

        </SafeAreaView>
    )
}

export default Dashboard

const styles = StyleSheet.create({
    iconContainer: {
        marginTop: 10,
        marginLeft: 10,
        alignItems: 'start',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '90%',
    },
    iconContainer2: {
        display: 'flex',
        flexDirection: 'row',
        gap: 15,
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    video: {
        height: 50,
        width: 50
    }
})