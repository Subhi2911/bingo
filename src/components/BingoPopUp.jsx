/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect, useRef } from "react";
import { View, Image, Animated, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export default function BingoPopUp({ delay = 500, onAnimationEnd = () => {} }) {
  const [visible, setVisible] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(true);

      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }).start(() => {
        onAnimationEnd(); // fire once animation completes
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, onAnimationEnd, scaleAnim]);

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
            width: width * 0.95,   // almost full width
            height: width * 0.45,  // keeps aspect ratio
            resizeMode: "contain",
          }}
        />
      </Animated.View>
    </View>
  );
}
