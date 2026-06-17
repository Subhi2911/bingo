/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, StyleSheet,
  ActivityIndicator, TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Icon from "react-native-vector-icons/FontAwesome5";
import { BACKEND_URL } from "../config/backend";
import { useNavigation } from "@react-navigation/native";
import { useSocket } from "../context/SocketContext";

const Play = ({ user }) => {
  const navigation = useNavigation();
  const socketRef = useSocket();
  const socket = socketRef?.socket;

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeGame, setActiveGame] = useState(null); // holds rejoin payload

  // ── Check for an ongoing game ──────────────────────────────────────────
  useEffect(() => {
    if (!socket || !user?._id) return;

    socket.emit("check_rejoin", { userId: user._id });

    const handleRejoin = (payload) => setActiveGame(payload);
    const handleNoRejoin = () => setActiveGame(null);

    socket.on("rejoin_available", handleRejoin);
    socket.on("no_rejoin_available", handleNoRejoin);

    return () => {
      socket.off("rejoin_available", handleRejoin);
      socket.off("no_rejoin_available", handleNoRejoin);
    };
  }, [socket, user?._id]);

  // ── Fetch history ──────────────────────────────────────────────────────
  const fetchGameHistory = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const res = await fetch(`${BACKEND_URL}/api/games/gamehistory`, {
        method: "GET",
        headers: { "Content-Type": "application/json", "auth-token": token },
      });
      const data = await res.json();
      if (data.success) setRooms(data.rooms);
    } catch (error) {
      console.log("Game history error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGameHistory(); }, []);

  // ── Rejoin handler ─────────────────────────────────────────────────────
  const handleRejoin = () => {
    if (!activeGame) return;
    navigation.navigate("GameScreen", {
      roomCode: activeGame.roomCode,
      gameType: activeGame.gameType,
      players: activeGame.players.length,
      matchedPlayers: activeGame.players,
      user,
      isRejoin: true,
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────
  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View>
        <Text style={styles.roomCode}>Room: {item.code}</Text>
        <Text style={styles.subText}>Mode: {item.gameType}</Text>
        <Text style={styles.subText}>Players: {item.players.length}</Text>
        <View style={styles.winnerInfo}>
          <Text style={styles.subText}>Winner:</Text>
          <View style={styles.userAvatar}>
            <Text style={{ fontSize: 20 }}>{item?.winner?.avatar || "🐟"}</Text>
          </View>
          <Text style={styles.winnerName}>
            {item?.winner?.username || "—"}
          </Text>
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

      {/* ── Active game banner ── */}
      {activeGame && (
        <TouchableOpacity style={styles.rejoinBanner} onPress={handleRejoin} activeOpacity={0.8}>
          <View style={styles.rejoinLeft}>
            <View style={styles.pulseDot} />
            <View>
              <Text style={styles.rejoinTitle}>Game in progress</Text>
              <Text style={styles.rejoinSub}>
                Room {activeGame.roomCode} · {activeGame.players.length} players
              </Text>
            </View>
          </View>
          <View style={styles.rejoinBtn}>
            <Text style={styles.rejoinBtnText}>Rejoin</Text>
            <Icon name="arrow-right" size={12} color="#fff" />
          </View>
        </TouchableOpacity>
      )}

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
          contentContainerStyle={{
            paddingBottom: 60,
          }}
        />
      )}
    </View>
  );
};

export default Play;

const styles = StyleSheet.create({
  heading: {
    fontSize: 22, fontWeight: "bold", color: "#fff", marginBottom: 16,
  },
  // ── Rejoin banner ──
  rejoinBanner: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "rgba(248,181,95,0.15)",
    borderWidth: 1, borderColor: "#F8B55F",
    borderRadius: 14, padding: 14, marginBottom: 16,
  },
  rejoinLeft: {
    flexDirection: "row", alignItems: "center", gap: 12,
  },
  pulseDot: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: "#4ADE80",  // green = live
  },
  rejoinTitle: {
    color: "#fff", fontWeight: "700", fontSize: 15,
  },
  rejoinSub: {
    color: "#aaa", fontSize: 12, marginTop: 2,
  },
  rejoinBtn: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "#F8B55F", borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  rejoinBtnText: {
    color: "#fff", fontWeight: "700", fontSize: 14,
  },
  // ── History cards ──
  card: {
    backgroundColor: "rgba(0,0,0,0.6)", padding: 14,
    borderRadius: 14, marginBottom: 12,
    flexDirection: "row", justifyContent: "space-between",
  },
  roomCode: { color: "#F8B55F", fontWeight: "bold", fontSize: 16 },
  subText: { color: "#ddd", marginTop: 2 },
  dateText: { color: "#aaa", fontSize: 12, marginTop: 4 },
  winnerInfo: { flexDirection: "row", alignItems: "center", gap: 6 },
  userAvatar: {
    height: 30, width: 30, borderRadius: 15,
    borderWidth: 2, borderColor: "#F8B55F",
    justifyContent: "center", alignItems: "center",
  },
  winnerName: { color: "#F8B55F", fontWeight: "700" },
});