import React, { useEffect, useRef } from "react";
import { Animated, Text, View, Image, StyleSheet } from "react-native";

export default function FloatingBingoLetter({ letter, daubed }) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!daubed) return;

    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -60,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daubed]);

  return (
    <Animated.View
      style={{
        transform: [{ translateY }],
        opacity,
      }}
    >
      <View style={[styles.bingoLetter, daubed && styles.daubedLetter]}>
        <Text style={[styles.letterText, daubed && styles.daubedText]}>
          {letter}
        </Text>
      </View>

      {daubed && (
        <Image
          source={require("../images/daub (2).png")}
          style={styles.daubIcon}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bingoLetter: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F8B55F",
    justifyContent: "center",
    alignItems: "center",
  },
  daubedLetter: {
    backgroundColor: "#FFD700",
    borderWidth: 2,
    borderColor: "#000",
  },
  letterText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#F00",
  },
  daubedText: {
    color: "#000",
  },
  daubIcon: {
    width: 30,
    height: 30,
    position: "absolute",
    opacity: 0.5,
  },
});
