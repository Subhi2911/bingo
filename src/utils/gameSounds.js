import Sound from 'react-native-sound';

Sound.setCategory('Playback');

const winSound = new Sound('game_win.mp3', Sound.MAIN_BUNDLE, (e) => {
    if (e) console.log('win sound load error', e);
});

const loseSound = new Sound('game_lose.mp3', Sound.MAIN_BUNDLE, (e) => {
    if (e) console.log('lose sound load error', e);
});

export const playWinSound = () => {
    winSound.stop(() => winSound.play());
};

export const playLoseSound = () => {
    loseSound.stop(() => loseSound.play());
};
