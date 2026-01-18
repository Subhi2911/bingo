/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ImageBackground,
  ActivityIndicator,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/FontAwesome5";
import { BACKEND_URL } from "../config/backend";

const Play = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGameHistory = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      console.log(token);

      const res = await fetch(`${BACKEND_URL}/api/games/gamehistory`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "auth-token": token,
        },
      });

      const data = await res.json();

      if (data.success) {
        setRooms(data.rooms);
      }
      console.log(data);
    } catch (error) {
      console.log("Game history error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGameHistory();
  }, []);
  

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.roomCode}>Room: {item.code}</Text>
        <Text style={styles.subText}>Mode: {item.gameType}</Text>
        <Text style={styles.subText}>
          Players: {item.players.length}
        </Text>
        <View style={styles.winnerInfo}>
          <Text style={styles.subText}>
            Winner:
          </Text>

          <View style={styles.userAvatar}>
            <Text style={{ fontSize: 25 }}>{item.avatar || '🐟'}</Text>
          </View>
          <Text style={styles.winnerName}>{item?.winner?.username || 'undefined'}</Text>


        </View>

      </View>

      <View style={{ alignItems: "flex-end" }}>
        <Icon name="history" size={18} color="#F8B55F" />
        <Text style={styles.dateText}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  return (

    <View style={{ flex: 1, padding: 16 }}>
      <Text style={styles.heading}>Game History</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#F8B55F" />
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={{ color: "#fff", textAlign: "center", marginTop: 50 }}>
              No games played yet 🎯
            </Text>
          }
        />
      )}
    </View>

  );
};

export default Play;
const styles = StyleSheet.create({
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  roomCode: {
    color: "#F8B55F",
    fontWeight: "bold",
    fontSize: 16,
  },
  subText: {
    color: "#ddd",
    marginTop: 2,
  },
  dateText: {
    color: "#aaa",
    fontSize: 12,
    marginTop: 4,
  },
  winnerInfo: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  userAvatar: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#F8B55F'
  },
  winnerName: {
    color: '#F8B55F',
    fontWeight: 700
  }
});
