import React from 'react';
import {
    StyleSheet,
    Text,
    View,
    FlatList,
    Image,
    TouchableOpacity
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';


const Search = ({ searchResults, onUserPress }) => {


    if (!searchResults || searchResults.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Icon name="search" size={18} color="#aaa" />
                <Text style={styles.emptyText}>No players found</Text>
            </View>
        );
    }

    return (
        <FlatList
            data={searchResults}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
                <TouchableOpacity
                    style={styles.userRow}
                    onPress={() => onUserPress?.(item)}
                >
                    <View style={styles.avatar}>
                        <Text style={{ fontSize: 30 }}>{item.avatar || '🐟'}</Text>
                    </View>

                    <View style={styles.info}>
                        <Text style={styles.username}>{item.username}</Text>
                        <Text style={styles.playerId}>ID: {item.playerId}</Text>
                    </View>

                    <View style={styles.levelBox}>
                        <Text style={styles.levelText}>Lv {item.level}</Text>
                    </View>
                </TouchableOpacity>
            )}
        />
    );
};

export default Search;

const styles = StyleSheet.create({
    list: {
        paddingVertical: 10,
        margin: 5,
        marginHorizontal: 15,
    },
    userRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2B2645',
        padding: 12,
        borderRadius: 12,
        marginBottom: 8,
    },
    avatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        marginRight: 12,
    },
    info: {
        flex: 1,
    },
    username: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
    },
    playerId: {
        color: '#aaa',
        fontSize: 12,
        marginTop: 2,
    },
    levelBox: {
        backgroundColor: '#FFD67A',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    levelText: {
        fontWeight: '700',
        fontSize: 12,
        color: '#23203C',
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        color: '#aaa',
        marginTop: 8,
    },
});
