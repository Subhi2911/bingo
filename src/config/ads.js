import { TestIds } from 'react-native-google-mobile-ads';

export const AD_UNIT_IDS = {
    banner: __DEV__
        ? TestIds.BANNER
        : 'ca-app-pub-2234703611718718/6246590554',

    interstitial: __DEV__
        ? TestIds.INTERSTITIAL
        : 'ca-app-pub-2234703611718718/4953690183',

    rewardedCoins: __DEV__
        ? TestIds.REWARDED
        : 'ca-app-pub-2234703611718718/9057616994', //shop coin

    rewardedSpin: __DEV__
        ? TestIds.REWARDED
        : 'ca-app-pub-2234703611718718/9444629805', //spin

    rewardedXP: __DEV__
        ? TestIds.REWARDED
        : 'ca-app-pub-2234703611718718/4274991779',

};