/* eslint-disable react-native/no-inline-styles */
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from "react-native";
import { useNavigation } from '@react-navigation/native';
import Icon from "react-native-vector-icons/FontAwesome5";


const HomeScreen = () => {
  const navigation = useNavigation();
  const launchGame = (mode) => {
    navigation.navigate(mode);
  }

  return (
    <View style={styles.container}>

      {/* DAILY REWARD CARD */}
      <View style={styles.rewardCard}>
        <Text style={styles.rewardTitle}>Daily Reward</Text>
        <Text style={styles.rewardSub}>+25 Coins Available</Text>
        <TouchableOpacity style={styles.claimBtn}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>CLAIM</Text>
        </TouchableOpacity>
      </View>

      {/* TOP USER STATS */}
      <View style={styles.userRow}>
        <Text style={styles.username}>@player123</Text>
        <View style={styles.coinRow}>
          <Icon name="coins" size={18} color="#F8B55F" />
          <Text style={styles.coinText}> 3,450</Text>
        </View>
      </View>

      {/* EVENT BANNER */}
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Weekend Rush!</Text>
        <Text style={styles.bannerSub}>Win x2 Rewards Today</Text>
      </View>

      {/* LEVEL PROGRESS */}
      <View style={{ marginTop: 10 }}>
        <Text style={styles.levelText}>LEVEL 12</Text>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
      </View>

      {/* PLAY BUTTONS */}
      <View style={styles.playGrid}>
        <PlayCard icon="dot-circle" label="Classic" onPress={()=>{launchGame('Classic') }} />
        <PlayCard icon="bolt" label="Fast" onPress={()=>{launchGame('Fast') }}/>
        <PlayCard icon="magic" label="Power Bingo" onPress={()=>{launchGame('Power') }}/>
        <PlayCard icon="lock" label="Private Room" onPress={()=>{launchGame('Private') }}/>
      </View>

      {/* QUICK ACTIONS */}
      <View style={styles.actionsRow}>
        <Action icon="tasks" label="Missions" />
        <Action icon="shopping-cart" label="Shop" />
        <Action icon="trophy" label="Rank" />
      </View>
    </View>
  );
};

const PlayCard = ({ icon, label,onPress }) => (
  <TouchableOpacity style={styles.playCard} onPress={onPress}>
    <Icon name={icon} size={26} color="#FFD67A" />
    <Text style={styles.playLabel}>{label}</Text>
  </TouchableOpacity>
);

const Action = ({ icon, label }) => (
  <TouchableOpacity style={styles.actionBox}>
    <Icon name={icon} size={24} color="#FFD67A" />
    <Text style={styles.actionText}>{label}</Text>
  </TouchableOpacity>
);

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //backgroundColor: "#3D365C",
    padding: 20,
    paddingTop: 40,
  },
  rewardCard: {
    backgroundColor: "#3D365C",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
  },
  rewardTitle: {
    color: "#FFD67A",
    fontSize: 18,
    fontWeight: "bold",
  },
  rewardSub: { color: "#fff", marginTop: 5 },
  claimBtn: {
    marginTop: 8,
    backgroundColor: "#F8B55F",
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 10,
  },
  userRow: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  username: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  coinRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  coinText: { color: "#FFD67A", fontSize: 16 },
  banner: {
    backgroundColor: "#23203C",
    marginTop: 25,
    padding: 15,
    borderRadius: 12,
  },
  bannerTitle: { color: "#FFD67A", fontSize: 18, fontWeight: "bold" },
  bannerSub: { color: "#fff", marginTop: 5 },
  levelText: { color: "#fff" },
  progressBar: {
    backgroundColor: "#fff3",
    height: 10,
    borderRadius: 10,
    marginTop: 5,
    width: "95%",
  },
  progressFill: {
    backgroundColor: "#FFD67A",
    height: "100%",
    width: "68%",
    borderRadius: 10,
  },
  playGrid: {
    marginTop: 25,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  playCard: {
    backgroundColor: "#4A416B",
    width: "48%",
    marginBottom: 15,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  playLabel: { color: "#fff", marginTop: 6, fontWeight: "600" },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 30,
  },
  actionBox: {
    alignItems: "center",
  },
  actionText: {
    color: "#fff",
    marginTop: 5,
  },
});
