/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    ImageBackground,
    FlatList
} from 'react-native';


const items = [
    {
        id: 1,
        name: "Coin Pack",
        desc: "500 Coins",
        price: 49,
        img: require('../images/coin.png')
    },
    {
        id: 2,
        name: "Mega Coins",
        desc: "2000 Coins",
        price: 149,
        img: require('../images/bag.png')
    },
    {
        id: 3,
        name: "Free Daubs",
        desc: "Extra 5 Marks",
        price: 99,
        img: require('../images/daub.png')
    },
    {
        id: 4,
        name: "Double XP",
        desc: "1 Match Boost",
        price: 129,
        img: require('../images/xp.png')
    },
    {
        id: 5,
        name: "Instant Claim",
        desc: "Auto Claim Win",
        price: 199,
        img: require('../images/claim.png')
    },
    {
        id: 6,
        name: "Theme Pack",
        desc: "New Board Skin",
        price: 299,
        img: require('../images/theme.png')
    },
    {
        id: 7,
        name: "Mega Coins",
        desc: "2000 Coins",
        price: 149,
        img: require('../images/bag.png')
    },
    {
        id: 8,
        name: "Free Daubs",
        desc: "Extra 5 Marks",
        price: 99,
        img: require('../images/daub.png')
    },
    {
        id: 9,
        name: "Double XP",
        desc: "1 Match Boost",
        price: 129,
        img: require('../images/xp.png')
    },
    {
        id: 10,
        name: "Instant Claim",
        desc: "Auto Claim Win",
        price: 199,
        img: require('../images/claim.png')
    },
    {
        id: 11,
        name: "Theme Pack",
        desc: "New Board Skin",
        price: 299,
        img: require('../images/theme.png')
    },
    {
        id: 12,
        name: "Coin Pack",
        desc: "500 Coins",
        price: 49,
        img: require('../images/coin.png')
    },
];

const Shop = () => {
    const buyItem = (name) => {
        console.log("Buying:", name);
    };

    return (
        <ImageBackground
            source={require('../images/RegisterPage.png')}
            style={{ flex: 1 }}
        >
            <View style={{ flex: 1, padding: 10 }}>
                <Text style={styles.heading}>Game Shop</Text>

                <FlatList
                    data={items}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Image source={item.img} style={styles.image} />
                            <Text style={styles.title}>{item.name}</Text>
                            <Text style={styles.desc}>{item.desc}</Text>

                            <TouchableOpacity
                                style={styles.buyBtn}
                                onPress={() => buyItem(item.name)}
                            >
                                <Text style={{ color: "#fff", fontWeight: "bold" }}>
                                    ₹{item.price}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={2}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContainer}
                />

            </View>
        </ImageBackground>
    );
};

export default Shop;

const styles = StyleSheet.create({
    heading: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
        marginVertical: 10,
    },
    scrollContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        paddingBottom: 50,
        alignItems: 'center',
        gap: 10,
        
    },
    card: {
        width: "48%", // 2 in a row
        backgroundColor: "rgba(255,255,255,0.15)",
        borderRadius: 14,
        marginTop: 10,
        padding: 10,
        borderWidth: 1,
        borderColor: "#F8B55F",
        alignItems: "center",
        marginRight: 5,
        
    },
    image: {
        width: 60,
        height: 60,
        marginBottom: 6,
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
        textAlign: "center",
    },
    desc: {
        fontSize: 12,
        color: "#ddd",
        marginTop: 2,
        textAlign: "center",
    },
    buyBtn: {
        backgroundColor: "#F8B55F",
        marginTop: 8,
        paddingHorizontal: 20,
        paddingVertical: 6,
        borderRadius: 8,
    },
});
