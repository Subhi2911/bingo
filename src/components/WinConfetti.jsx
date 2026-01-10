/* eslint-disable react-native/no-inline-styles */
import React from "react";
import { Dimensions } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";

const { width } = Dimensions.get("window");

const WinConfetti = () => {
    return (
        <ConfettiCannon
            count={250}
            origin={{ x: width / 2, y: 0 }}
            fadeOut
            explosionSpeed={350}
            fallSpeed={300}
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 999,
                elevation: 999, // Android
                pointerEvents: "none",
            }}
        />
    );
};

export default WinConfetti;
