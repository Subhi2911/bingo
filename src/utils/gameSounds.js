import Sound from 'react-native-sound';

Sound.setCategory('Playback');

const winSound = new Sound(
    require('../sounds/gameWin.mp3'),
    Sound.MAIN_BUNDLE
);

const loseSound = new Sound(
    require('../sounds/gameOver.mp3'),
    Sound.MAIN_BUNDLE
);

export const playWinSound = () => {
    winSound.stop(() => {
        winSound.play();
    });
};

export const playLoseSound = () => {
    loseSound.stop(() => {
        loseSound.play();
    });
};
