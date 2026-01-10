/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect, useRef } from "react";
import { View, Image, Animated, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

export default function BingoPopUp({ delay = 500, onAnimationEnd = () => {} }) {
  const [visible, setVisible] = useState(false);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);

      Animated.sequence([
        // 1️⃣ Pop-in animation
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 80,
          useNativeDriver: true,
        }),

        // 2️⃣ Enlarge + fade out
        Animated.parallel([
          Animated.timing(scaleAnim, {
            toValue: 3, // goes out of screen
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 700,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        setVisible(false);
        onAnimationEnd();
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, onAnimationEnd, scaleAnim, opacityAnim]);

  if (!visible) return null;

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: "center",
        alignItems: "center",
        zIndex: 999,
      }}
    >
      <Animated.View
        style={{
          opacity: opacityAnim,
          transform: [
            {
              scale: scaleAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0.2, 1],
              }),
            },
          ],
        }}
      >
        <Image
          source={require("../images/bingo_pop.png")}
          style={{
            width: width * 0.95,
            height: width * 0.45,
            resizeMode: "contain",
          }}
        />
      </Animated.View>
    </View>
  );
}
