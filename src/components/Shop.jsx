/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    FlatList, Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRewardedAd } from 'react-native-google-mobile-ads';
import { BACKEND_URL } from '../config/backend';
import { AD_UNIT_IDS } from '../config/ads';
import { showAlert2 } from './CustomAlert2';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';


// ─── Real money items (₹) ─────────────────────────────────────────────────────
const REAL_ITEMS = [
    { id: 1, name: '100 Coins', desc: '100 Coins', price: "Ad", img: require('../images/bag.png') },
    { id: 2, name: '50 XP', desc: '50 XP', price: "AdXP", img: require('../images/xpicon.png') },
    { id: 3, name: 'Coin Pack', desc: '500 Coins', price: 49, img: require('../images/coin.png') },
    { id: 4, name: 'Mega Coins', desc: '2000 Coins', price: 149, img: require('../images/bag.png') },
    { id: 5, name: 'Free Daubs', desc: 'Extra 5 Marks', price: 99, img: require('../images/daub.png') },
    { id: 6, name: 'Double XP', desc: '1 Match Boost', price: 129, img: require('../images/xp.png') },
    { id: 7, name: 'Instant Claim', desc: 'Auto Claim Win', price: 199, img: require('../images/claim.png') },
    { id: 8, name: 'Theme Pack', desc: 'New Board Skin', price: 299, img: require('../images/theme.png') },
    { id: 5, name: 'Free Boards', desc: 'Extra 1 board', price: 299, img: require('../images/boards/forest.png') },

];

// ─── Board skins ──────────────────────────────────────────────────────────────
const BOARD_SKINS = [
    { id: 'classic', name: 'Classic', price: 0, sub: 'Free', img: require('../images/boards/classic.png') },
    { id: 'ocean', name: 'Ocean', price: 1500, sub: '1500 coins', img: require('../images/boards/ocean.png') },
    { id: 'forest', name: 'Forest', price: 3000, sub: '3000 coins', img: require('../images/boards/forest.png') },
    { id: 'galaxy', name: 'Galaxy', price: 2500, sub: '2500 coins', img: require('../images/boards/galaxy.png') },
    { id: 'candy', name: 'Candy', price: 3500, sub: '3500 coins', img: require('../images/boards/candy.png') },
    { id: 'lava', name: 'Lava', price: 6000, sub: '6000 coins', img: require('../images/boards/lava.png') },
    { id: 'barbie', name: 'barbie', price: 9500, sub: '9500 coins', img: require('../images/boards/barbie.png') }
];

// ─── Daub styles ──────────────────────────────────────────────────────────────
const DAUB_STYLES = [
    { id: 'daub', name: 'Daub', price: 0, sub: 'Free', img: require('../images/daubs/daub (2).png') },
    { id: 'flame', name: 'Flame', price: 1000, sub: '1000 coins', img: require('../images/daubs/flame.png') },
    { id: 'ice', name: 'Ice', price: 2000, sub: '2000 coins', img: require('../images/daubs/ice.png') },
    { id: 'crown', name: 'Crown', price: 4000, sub: '4000 coins', img: require('../images/daubs/crown.png') },
    { id: 'thunder', name: 'Thunder', price: 5000, sub: '5000 coins', img: require('../images/daubs/thunder.png') },
    { id: 'skull', name: 'Skull', price: 5500, sub: '5500 coins', img: require('../images/daubs/skull.png') },
    { id: 'star', name: 'Star', price: 3500, sub: '3500 coins', img: require('../images/daubs/star.png') },
];

// ─── Skin card (purchase only) ────────────────────────────────────────────────
const SkinCard = ({ item, coins, owned, onBuy, isBoard }) => {
    const isOwned = owned.includes(item.id);
    const canAfford = coins >= item.price;
    const isFree = item.price === 0;

    return (
        <View style={[s.skinCard, isOwned && s.skinCardOwned]}>
            {/* Owned badge */}
            {isOwned && (
                <View style={s.badgeOwned}>
                    <Text style={s.badgeOwnedTxt}>✓ Owned</Text>
                </View>
            )}

            {/* Thumbnail */}
            <Image
                source={item.img}
                style={isBoard ? s.boardThumb : s.daubThumb}
                resizeMode="contain"
            />

            <Text style={s.skinName}>{item.name}</Text>
            <Text style={s.skinSub}>{isFree ? 'Free' : item.sub}</Text>

            {/* Button */}
            {isOwned ? (
                <View style={[s.btn, s.btnOwned]}>
                    <Text style={s.btnOwnedTxt}>Already Owned</Text>
                </View>
            ) : isFree ? (
                <View style={[s.btn, s.btnOwned]}>
                    <Text style={s.btnOwnedTxt}>Free</Text>
                </View>
            ) : (
                <TouchableOpacity
                    style={[s.btn, !canAfford && s.btnCant]}
                    onPress={() => canAfford && onBuy(item)}
                    disabled={!canAfford}
                >
                    <Text style={[s.btnTxt, !canAfford && s.btnCantTxt]}>
                        🪙 {item.price}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

// ─── Real money card ──────────────────────────────────────────────────────────
const RealCard = ({ item, onBuy, onWatchAd, onWatchXpAd, adLoaded, xpAdLoaded }) => {
    const isAdItem = item.price === "Ad";
    const isXpAdItem = item.price === "AdXP";

    return (
        <View style={s.realCard}>
            <Image source={item.img} style={s.realImg} />
            <Text style={s.realName}>{item.name}</Text>
            <Text style={s.realDesc}>{item.desc}</Text>

            {isAdItem ? (
                <TouchableOpacity
                    style={[s.rupeeBtn, !adLoaded && s.btnCant]}
                    onPress={() => adLoaded && onWatchAd(item)}
                    disabled={!adLoaded}
                >
                    <Text style={[s.rupeeBtnTxt, !adLoaded && s.btnCantTxt]}>
                        {adLoaded ? '🎬 Watch Ad' : 'Loading...'}
                    </Text>
                </TouchableOpacity>
            ) : isXpAdItem ? (
                <TouchableOpacity
                    style={[s.rupeeBtn, !xpAdLoaded && s.btnCant]}
                    onPress={() => xpAdLoaded && onWatchXpAd(item)}
                    disabled={!xpAdLoaded}
                >
                    <Text style={[s.rupeeBtnTxt, !xpAdLoaded && s.btnCantTxt]}>
                        {xpAdLoaded ? '🎬 Watch Ad' : 'Loading...'}
                    </Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity style={s.rupeeBtn} onPress={() => onBuy(item)}>
                    <Text style={s.rupeeBtnTxt}>₹{item.price}</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

// ─── Section header ───────────────────────────────────────────────────────────
const SectionHeader = ({ title, sub }) => (
    <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>{title}</Text>
        {sub && <Text style={s.sectionSub}>{sub}</Text>}
    </View>
);

const AdCard = ({ style }) => (
    <View style={[style ?? s.realCard, { justifyContent: 'center', alignItems: 'center', overflow: 'hidden', padding: 0, minHeight: 50, maxHeight: 180 }]}>
        <BannerAd
            unitId={__DEV__ ? TestIds.BANNER : 'ca-app-pub-2234703611718718/6246590554'}
            size={BannerAdSize.MEDIUM_RECTANGLE}
        />
    </View>
);

// ─── Main Shop ────────────────────────────────────────────────────────────────
const Shop = () => {
    const [user, setUser] = React.useState(null);
    const [skinTab, setSkinTab] = React.useState('boards');
    const [ownedBoards, setOwnedBoards] = React.useState(['classic']);
    const [ownedDaubs, setOwnedDaubs] = React.useState(['star']);

    // ── Rewarded ad: 100 coins for item id 1 ───────────────────────────────────
    const { isLoaded: coinsAdLoaded, isEarnedReward, load: loadCoinsAd, show: showCoinsAd } = useRewardedAd(
        AD_UNIT_IDS.rewardedCoins,
        { requestNonPersonalizedAdsOnly: false }
    );

    React.useEffect(() => { loadCoinsAd(); }, [loadCoinsAd]);

    React.useEffect(() => {
        if (isEarnedReward) grantAdCoins();
    }, [isEarnedReward]);

    const grantAdCoins = async () => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            const res = await fetch(`${BACKEND_URL}/api/rewards/shop-coins`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'auth-token': token },
            });
            const json = await res.json();
            if (!res.ok) { showAlert2({ type: 'error', title: json.message || 'Failed to grant reward' }); return; }

            setUser(prev => ({ ...prev, money: json.money }));
            showAlert2({ type: 'success', title: '+100 Coins added!' });
        } catch (e) {
            console.log(e);
        } finally {
            loadCoinsAd();
        }
    };

    const handleWatchAd = () => {
        if (coinsAdLoaded) showCoinsAd();
    };

    const { isLoaded: xpAdLoaded, isEarnedReward: isEarnedXP, load: loadXpAd, show: showXpAd } = useRewardedAd(
        AD_UNIT_IDS.rewardedXp,
        { requestNonPersonalizedAdsOnly: false }
    );

    React.useEffect(() => { loadXpAd(); }, [loadXpAd]);

    React.useEffect(() => {
        if (isEarnedXP) grantAdXP();
    }, [isEarnedXP]);

    const grantAdXP = async () => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            const res = await fetch(`${BACKEND_URL}/api/rewards/shop-xp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'auth-token': token },
            });
            const json = await res.json();
            if (!res.ok) { showAlert2({ type: 'error', title: json.message || 'Failed to grant XP' }); return; }

            setUser(prev => ({ ...prev, xp: json.xp }));
            showAlert2({ type: 'success', title: '+50 XP added!' });
        } catch (e) {
            console.log(e);
        } finally {
            loadXpAd();
        }
    };

    const handleWatchXpAd = () => {
        if (xpAdLoaded) showXpAd();
    };

    // ── Load user ─────────────────────────────────────────────────────────────
    React.useEffect(() => {
        const init = async () => {
            try {
                const token = await AsyncStorage.getItem('authToken');
                const res = await fetch(`${BACKEND_URL}/api/auth/getuser`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'auth-token': token },
                });
                const data = await res.json();
                setUser(data);
                if (data.ownedBoards?.length) setOwnedBoards(data.ownedBoards);
                if (data.ownedDaubs?.length) setOwnedDaubs(data.ownedDaubs);
            } catch (e) { console.log(e); }
        };
        init();
    }, []);

    // ── Real money purchase ───────────────────────────────────────────────────
    const handleRealBuy = (item) => {
        // TODO: integrate Razorpay / Google Pay here
        showAlert2({ type: 'success', title: `Purchased ${item.name}!` });
    };

    // ── Coin skin purchase ────────────────────────────────────────────────────
    const handleSkinBuy = async (item, type) => {
        if (!user || user.money < item.price) {
            showAlert2({ type: 'error', title: 'Not enough coins!' });
            return;
        }
        try {
            const token = await AsyncStorage.getItem('authToken');
            const res = await fetch(`${BACKEND_URL}/api/shop/buy-skin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'auth-token': token },
                body: JSON.stringify({ skinId: item.id, skinType: type, price: item.price }),
            });
            const json = await res.json();
            if (!res.ok) { showAlert2({ type: 'error', title: json.message || 'Failed' }); return; }

            setUser(prev => ({ ...prev, money: prev.money - item.price }));

            if (type === 'board') {
                setOwnedBoards(prev => [...prev, item.id]);
            } else {
                setOwnedDaubs(prev => [...prev, item.id]);
            }
            showAlert2({ type: 'success', title: `${item.name} unlocked! Visit Customize to equip it.` });
        } catch (e) { console.log(e); }
    };

    const isBoard = skinTab === 'boards';
    const skinItems = isBoard ? BOARD_SKINS : DAUB_STYLES;
    const skinOwned = isBoard ? ownedBoards : ownedDaubs;
    const skinBuy = (item) => handleSkinBuy(item, isBoard ? 'board' : 'daub');

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={[]}
                keyExtractor={() => 'dummy'}
                renderItem={null}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 14, paddingTop: 10, paddingBottom: 120 }}
                ListHeaderComponent={
                    <>
                        <Text style={s.heading}>Game Shop</Text>

                        {/* Coins pill */}
                        <View style={s.coinsPill}>
                            <Text style={{ fontSize: 15 }}>🪙</Text>
                            <Text style={s.coinsVal}>{user?.money ?? '—'}</Text>
                            <Text style={s.coinsLbl}>coins available</Text>
                        </View>

                        {/* ── Boards & Daubs section ── */}
                        <SectionHeader title="Boards & Daubs" sub="Purchase with game coins • Equip from Customize" />

                        {/* Tabs */}
                        <View style={s.tabs}>
                            {['boards', 'daubs'].map(t => (
                                <TouchableOpacity
                                    key={t}
                                    style={[s.tab, skinTab === t && s.tabOn]}
                                    onPress={() => setSkinTab(t)}
                                >
                                    <Text style={[s.tabTxt, skinTab === t && s.tabTxtOn]}>
                                        {t === 'boards' ? '🎲 Boards' : '⭐ Daubs'}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Skin grid */}
                        <View style={s.skinGrid}>
                            {skinItems.map(item => (
                                <SkinCard
                                    key={item.id}
                                    item={item}
                                    coins={user?.money ?? 0}
                                    owned={skinOwned}
                                    onBuy={skinBuy}
                                    isBoard={isBoard}
                                />
                            ))}
                            {skinItems.length % 2 !== 0 && <AdCard style={s.skinCard} />}
                        </View>

                        <View style={s.divider} />

                        {/* ── Premium Store ── */}
                        <SectionHeader title="Premium Store" sub="Purchase with real money" />
                        <View style={s.realGrid}>
                            <View style={s.realGrid}>
                                {REAL_ITEMS.map(item => (
                                    <RealCard
                                        key={item.id}
                                        item={item}
                                        onBuy={handleRealBuy}
                                        onWatchAd={handleWatchAd}
                                        adLoaded={coinsAdLoaded}
                                        onWatchXpAd={handleWatchXpAd}
                                        xpAdLoaded={xpAdLoaded} 
                                    />
                                ))}
                                {REAL_ITEMS.length % 2 !== 0 && <AdCard />}
                            </View>
                        </View>
                    </>
                }
            />
        </View>
    );
};

export default Shop;

const GOLD = '#FFD67A';
const TEXT = '#FFFFFF';
const SUB = 'rgba(255,255,255,0.5)';
const BORD = 'rgba(255,214,122,0.3)';

const s = StyleSheet.create({
    heading: { color: TEXT, fontSize: 22, fontWeight: '700', textAlign: 'center', marginBottom: 10 },

    coinsPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(0,0,0,0.25)', borderWidth: 1, borderColor: 'rgba(255,214,122,0.4)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, alignSelf: 'center', marginBottom: 18 },
    coinsVal: { color: GOLD, fontWeight: '700', fontSize: 14 },
    coinsLbl: { color: SUB, fontSize: 12 },

    sectionHeader: { marginBottom: 10 },
    sectionTitle: { color: TEXT, fontSize: 16, fontWeight: '700' },
    sectionSub: { color: SUB, fontSize: 11, marginTop: 2 },

    tabs: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    tab: { flex: 1, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: BORD, backgroundColor: 'rgba(0,0,0,0.2)', alignItems: 'center' },
    tabOn: { backgroundColor: GOLD, borderColor: GOLD },
    tabTxt: { color: SUB, fontSize: 13, fontWeight: '500' },
    tabTxtOn: { color: '#3A1A7A', fontWeight: '700' },

    skinGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5 },
    skinCard: { width: '48%', margin: '1%', backgroundColor: 'rgba(255,255,255,0.10)', borderRadius: 16, borderWidth: 1.5, borderColor: BORD, padding: 12, alignItems: 'center', gap: 5 },
    skinCardOwned: { borderColor: 'rgba(100,255,150,0.6)', backgroundColor: 'rgba(100,255,150,0.05)' },

    badgeOwned: { position: 'absolute', top: 7, right: 7, backgroundColor: 'rgba(100,255,150,0.2)', borderWidth: 1, borderColor: 'rgba(100,255,150,0.6)', borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2 },
    badgeOwnedTxt: { color: '#7AFF9A', fontSize: 9, fontWeight: '700' },

    boardThumb: { width: 80, height: 80, borderRadius: 10 },
    daubThumb: { width: 64, height: 64, borderRadius: 32 },

    skinName: { color: TEXT, fontSize: 13, fontWeight: '600' },
    skinSub: { color: SUB, fontSize: 10 },

    btn: { borderRadius: 12, paddingVertical: 6, width: '100%', alignItems: 'center', marginTop: 2, backgroundColor: '#F8B55F' },
    btnTxt: { color: '#3A1A00', fontSize: 12, fontWeight: '700' },
    btnOwned: { backgroundColor: 'rgba(255,255,255,0.08)' },
    btnOwnedTxt: { color: 'rgba(255,255,255,0.35)', fontSize: 11 },
    btnCant: { backgroundColor: 'rgba(255,255,255,0.08)' },
    btnCantTxt: { color: 'rgba(255,255,255,0.3)', fontSize: 12 },

    divider: { height: 1, backgroundColor: 'rgba(255,214,122,0.2)', marginVertical: 22 },

    realGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5 },
    realCard: { width: '48%', margin: '1%', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, borderWidth: 1, borderColor: '#F8B55F', padding: 10, alignItems: 'center', gap: 4 },
    realImg: { width: 60, height: 60, marginBottom: 4 },
    realName: { color: TEXT, fontSize: 15, fontWeight: '700', textAlign: 'center' },
    realDesc: { color: SUB, fontSize: 12, textAlign: 'center' },
    rupeeBtn: { backgroundColor: '#F8B55F', borderRadius: 10, paddingHorizontal: 20, paddingVertical: 6, marginTop: 4 },
    rupeeBtnTxt: { color: '#3A1A00', fontWeight: '700', fontSize: 13 },
});