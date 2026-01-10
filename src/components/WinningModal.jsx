/* eslint-disable react-native/no-inline-styles */
import React, { useLayoutEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ImageBackground,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import WinConfetti from "./WinConfetti";
import { playWinSound, playLoseSound } from "../utils/gameSounds";
import { useState } from "react/cjs/react.development";
import Icon from "react-native-vector-icons/FontAwesome5";

const { width } = Dimensions.get("window");

export default function WinningModal({
  winnerPlayerId,
  result = "win",
  matchedPlayers = [],
  onClose = () => { },
  readyPlayers = {},
  playAgain,
  user
}) {
  const navigation = useNavigation();
  const isWin = result === "win";
  //const [readyPlayers, setReadyPlayers] = useState(readyPlayers);

  /* ------------------ PLAYER SEGREGATION ------------------ */
  const winnerPlayer = matchedPlayers.find(
    (p) => p.userId === winnerPlayerId
  );
  const otherPlayers = matchedPlayers.filter(
    (p) => p.userId !== winnerPlayerId
  );

  const playAain = () => {
    playAgain();
  }

  /* ------------------ SOUND (SYNCED) ------------------ */
  const soundPlayedRef = useRef(false);

  useLayoutEffect(() => {
    if (soundPlayedRef.current) return;
    if (isWin) playWinSound();
    else playLoseSound();
    soundPlayedRef.current = true;
  }, [isWin]);

  const userAvatar = {
    daub: require("../avatars/daub.png"),
  };



  /* ------------------ THEME ------------------ */
  const theme = {
    win: {
      bg: "rgba(255, 240, 200, 0.97)",
      header: "#F5B800",
      text: "#5A3400",
      circle: "#FFD773",
      accent: "#FFE8AE",
    },
    lose: {
      bg: "rgba(91, 110, 129, 0.97)",
      header: "#bfcee2ff",
      text: "#dfe3e9ff",
      circle: "#CED3DA",
      accent: "#DFE3E7",
    },
  }[isWin ? "win" : "lose"];

  return (
    <View style={styles.overlay}>
      {/* CONFETTI */}


      {/* CARD WRAPPER WITH BORDER/GLOW */}
      <View
        style={[
          styles.cardWrapper,
          isWin ? styles.winGlow : styles.loseBorder,
          { backgroundColor: theme.bg },
        ]}
      >
        {/* CARD BACKGROUND IMAGE */}
        <ImageBackground
          source={
            isWin
              ? require("../images/pattern_confetti.png")
              : require("../images/pattern_dark.png")
          }
          style={styles.card}
          imageStyle={{ borderRadius: 22, resizeMode: "cover" }}
        >
          {/* CLOSE BUTTON */}
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={[styles.closeTxt, { color: theme.text }]}>✕</Text>
          </TouchableOpacity>

          {/* TITLE */}
          <Text style={[styles.mainText, { color: theme.header }]}>
            {isWin ? "WINNER" : "GAME OVER"}
          </Text>

          {/* TROPHY */}
          <View
            style={[styles.trophyCircle, { backgroundColor: theme.circle }]}
          >
            <Image
              source={
                isWin
                  ? require("../images/trophy.png")
                  : require("../images/brokenTrophy.png")
              }
              style={styles.trophy}
            />
          </View>

          {/* WINNER PLAYER */}
          {winnerPlayer && (
            <View style={styles.rowTop}>
              <View style={styles.playerBlock}>
                <View
                  style={[
                    styles.avatarWrap,
                    { borderColor: theme.header, borderWidth: 4 },
                  ]}
                >
                  <Image
                    source={
                      userAvatar[winnerPlayer.avatar] ||
                      require("../avatars/user.jpg")
                    }
                    style={styles.avatar}
                  />
                  {readyPlayers[winnerPlayer.userId] && (
                    <Icon
                      name="thumbs-up"
                      size={18}
                      color="#FFD700"
                      style={{
                        position: "absolute",
                        bottom: -4,
                        right: -4,
                        backgroundColor: "#000",
                        borderRadius: 10,
                        padding: 4,
                      }}
                    />
                  )}

                </View>
                <Text style={[styles.name, { color: theme.text }]}>
                  🏆 {winnerPlayer.username}
                </Text>
                {isWin && (
                  <Text style={styles.winnerBadge}>CHAMPION</Text>
                )}
              </View>
            </View>
          )}

          {/* OTHER PLAYERS */}
          {otherPlayers.length > 0 && (
            <View style={styles.rowBottom}>
              {otherPlayers.slice(0, 4).map((p, i) => (
                <View key={i} style={styles.playerBlockSmall}>
                  <View
                    style={[
                      styles.avatarWrapSmall,
                      { borderColor: theme.header },
                    ]}
                  >
                    <Image
                      source={
                        userAvatar[p.avatar] || require("../avatars/user.jpg")
                      }
                      style={styles.avatarSmall}
                    />
                    {readyPlayers[p.userId] && (
                      <Icon
                        name="thumbs-up"
                        size={18}
                        color="#FFD700"
                        style={{
                          position: "absolute",
                          bottom: -4,
                          right: -4,
                          backgroundColor: "#000",
                          borderRadius: 10,
                          padding: 4,
                        }}
                      />
                    )}

                  </View>
                  <Text
                    style={[styles.nameSmall, { color: theme.text }]}
                    numberOfLines={1}
                  >
                    {p.username}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* CLOSE BUTTON */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Home")}
            style={[styles.closetxt, { backgroundColor: theme.accent }]}
          >
            <Text style={{ fontWeight: "700" }}>Close</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => playAgain()}
            style={[styles.closetxt, { backgroundColor: theme.accent }]}
          >
            <Text style={{ fontWeight: "700" }}>Play Again</Text>
          </TouchableOpacity>
        </ImageBackground>
      </View>
    </View>
  );
}

/* ------------------ STYLES ------------------ */

const AVATAR = Math.round(width * 0.16);
const AVATAR_SMALL = Math.round(width * 0.12);

const styles = StyleSheet.create({
  overlay: {
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    height: "100%",
  },
  cardWrapper: {
    borderRadius: 26,
    padding: 4,
    width: "100%",

  },
  winGlow: {
    borderWidth: 3,
    borderColor: "#FFD700",
    shadowColor: "#FFD700",
    shadowOpacity: 0.9,
    shadowRadius: 18,
    elevation: 20,
  },
  loseBorder: {
    borderWidth: 2,
    borderColor: "#9AA0A6",
  },
  card: {
    borderRadius: 22,
    paddingVertical: 26,
    paddingHorizontal: 20,
    alignItems: "center",

  },
  mainText: {
    fontSize: 40,
    fontWeight: "900",
    marginBottom: 10,
    letterSpacing: 2,
  },
  closeBtn: {
    position: "absolute",
    top: 16,
    right: 18,
    padding: 8,
  },
  closeTxt: {
    fontSize: 24,
    fontWeight: "800",
  },
  trophyCircle: {
    width: 150,
    height: 150,
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  trophy: {
    width: 95,
    height: 95,
    resizeMode: "contain",
  },
  rowTop: {
    width: "100%",
    alignItems: "center",
    marginBottom: 18,
  },
  rowBottom: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginBottom: 12,
  },
  playerBlock: {
    alignItems: "center",
  },
  playerBlockSmall: {
    alignItems: "center",
    width: "30%",
  },
  avatarWrap: {
    width: AVATAR + 6,
    height: AVATAR + 6,
    borderRadius: (AVATAR + 6) / 2,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
  },
  avatarWrapSmall: {
    width: AVATAR_SMALL + 6,
    height: AVATAR_SMALL + 6,
    borderRadius: (AVATAR_SMALL + 6) / 2,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    resizeMode: "contain",
  },
  avatarSmall: {
    width: AVATAR_SMALL,
    height: AVATAR_SMALL,
    borderRadius: AVATAR_SMALL / 2,
    resizeMode: "contain",
  },
  name: {
    marginTop: 8,
    fontWeight: "700",
    fontSize: 15,
    textAlign: "center",
  },
  nameSmall: {
    marginTop: 6,
    fontWeight: "700",
    fontSize: 12,
    textAlign: "center",
  },
  winnerBadge: {
    marginTop: 6,
    backgroundColor: "#FFD700",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 10,
    fontWeight: "900",
    color: "#5A3400",
  },
  closetxt: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 20,
    elevation: 5,
  },
});
