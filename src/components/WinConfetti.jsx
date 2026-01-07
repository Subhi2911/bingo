/* eslint-disable react-native/no-inline-styles */
// WinConfetti.js
import React from 'react';
import ConfettiCannon from 'react-native-confetti-cannon';

const WinConfetti = () => {
    return (
        <ConfettiCannon
            count={250}
            origin={{ x: -10, y: 0 }}
            fadeOut
            style={{ position: 'absolute', top: 0, zIndex: 1000 }}
        />
    );
};

export default WinConfetti;
