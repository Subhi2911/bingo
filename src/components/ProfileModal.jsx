/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, { useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Image,
  ImageBackground,
  Dimensions,
} from "react-native";
import Icon from 'react-native-vector-icons/FontAwesome5';
import { BACKEND_URL } from "../config/backend";
import AsyncStorage from "@react-native-async-storage/async-storage";


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const MODAL_WIDTH = 260;
const MODAL_HEIGHT = 240;
const MARGIN = 8;



const avatarImages = {
  daub: require("../avatars/daub.png"),
};



const ProfileModal = ({ visible, anchor, user, onClose, myId }) => {
  const [otherUser, setOtherUser] = React.useState(null);

  useEffect(() => {
    console.log("Fetching other user data for:", user);

    const getOtherUserData = async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/api/auth/user/${user.userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (res.ok) {
          const data = await res.json();
          console.log("Fetched other user:", data);
          setOtherUser(data);
          console.log("Other user data set:", otherUser);
        } else {
          console.log("Response not ok");
        }
      } catch (error) {
        console.error("Fetch error:", error);
      }
    };

    getOtherUserData();
    console.log("User changed:", otherUser);
  }, [user]);

  const [sent, setSent] = React.useState(false);

  const sendFriendRequest = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      console.log(token);
      const response = await fetch(`${BACKEND_URL}/api/auth/send-request/${user?.userId}`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "auth-token": token,
        },
        //body: JSON.stringify({ toUserId: otherUser._id }),
      });
      console.log(response);
      if (response.ok) {
        const json = await response.json();
        setSent(true);
        console.log("Friend request response:", json);
      }
    } catch (error) {
      console.error("Friend request error:", error);
    }
  };

  useEffect(() => {
    setSent(false);
  }, [user?.userId]);



  if (!visible || !anchor || !user || !otherUser) return null;

  //  Position calculation
  let left = anchor.x + anchor.width / 2 - MODAL_WIDTH / 2;
  let top = anchor.y + anchor.height + 30;

  // Clamp horizontally
  if (left < MARGIN) left = MARGIN;
  if (left + MODAL_WIDTH > SCREEN_WIDTH - MARGIN) {
    left = SCREEN_WIDTH - MODAL_WIDTH - MARGIN;
  }

  // Clamp vertically (flip above if needed)
  if (top + MODAL_HEIGHT > SCREEN_HEIGHT - MARGIN) {
    top = anchor.y - MODAL_HEIGHT - 10;
  }



  return (
    <Modal transparent animationType="fade">
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        {/* Prevent backdrop press when touching modal */}
        <TouchableWithoutFeedback>
          <View
            style={[
              styles.container,
              {
                top,
                left,
                borderWidth: 2.5,
                borderColor: "rgba(255,255,255,0.3)",
              },
            ]}
          >
            <ImageBackground
              source={require("../images/profile_bg.png")}
              style={styles.bg}
              imageStyle={styles.bgImage}
            >
              {/* Header */}
              <View style={styles.header}>
                <Image
                  source={
                    avatarImages[user.avatar] ||
                    require("../images/user.jpg")
                  }
                  style={styles.avatar}
                />
                <View>
                  <Text style={styles.name}>{otherUser.username}</Text>
                  <Text style={styles.sub}>Level {otherUser.level}</Text>
                </View>
                <View
                  style={{
                    display: 'flex',
                    marginLeft: 10,
                    justifyContent: 'space-around',
                    alignItems: 'center',
                    position: 'relative',
                  }}
                >
                  {/* Add friend */}
                  {sent || otherUser?.pendingRequests?.includes(myId) ? (
                    <Icon name="clock" size={20} color="#f4a261" />) :
                    <Icon name="user-plus" size={20} color="#1aa705" onPress={sendFriendRequest} />}



                  {/* Warning */}
                  <Icon
                    name="exclamation-triangle"
                    size={20}
                    color="red"
                    style={{ position: 'absolute', top: 0, right: -40 }}
                  />
                </View>
              </View>


              {/* Stats */}
              <View style={styles.statsRow}>
                <Stat label="XP" value={otherUser.xp} />
                <Stat label="Wins" value={otherUser.wins} />
                <Stat label="Coins" value={otherUser.money} />
              </View>

              <Text style={styles.rank}>Rank #{otherUser.rank}</Text>

              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                  Close
                </Text>
              </TouchableOpacity>
            </ImageBackground>
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
};

const Stat = ({ label, value }) => (
  <View style={{ alignItems: "center" }}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  container: {
    position: "absolute",
    width: MODAL_WIDTH,
    height: MODAL_HEIGHT,
    borderRadius: 18,
    overflow: "hidden",
    elevation: 14,
  },
  bg: {
    flex: 1,
    padding: 14,
    justifyContent: "space-between",
  },
  bgImage: {
    borderRadius: 18,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: "#fff",
  },
  name: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  sub: {
    color: "#ddd",
    fontSize: 12,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  statValue: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
  statLabel: {
    color: "#ccc",
    fontSize: 11,
  },
  rank: {
    textAlign: "center",
    color: "#f1c40f",
    fontWeight: "600",
    marginTop: 6,
  },
  closeBtn: {
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.45)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 10,
  },
});

export default ProfileModal;
