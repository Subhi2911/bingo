/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    FlatList, Image, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRewardedAd } from 'react-native-google-mobile-ads';
import RazorpayCheckout from 'react-native-razorpay';
import { BACKEND_URL } from '../config/backend';
import { AD_UNIT_IDS } from '../config/ads';
import { showAlert2 } from './CustomAlert2';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { useAuth } from '../context/AuthContext';
import { RAZORPAY_KEY_ID } from '../config/razorpay'

// ─── Free items (Ad-based only) ───────────────────────────────────────────────
const FREE_ITEMS = [
    { id: 1, name: '100 Coins', desc: '100 Coins', price: "Ad", img: require('../images/bag.png'), type: 'coins' },
    { id: 2, name: '50 XP', desc: '50 XP', price: "AdXP", img: require('../images/xpicon.png'), type: 'xp' },
];

// ─── Premium items (Razorpay ONLY - sorted by type then price) ────────────────
const PREMIUM_ITEMS = [
    // COINS
    { id: 1, name: 'Coin Pack', desc: '500 Coins', price: 49, img: require('../images/coin.png'), razorpayEnabled: true, type: 'coins' },
    { id: 2, name: 'Coin Bundle', desc: '1000 Coins', price: 99, img: require('../images/coin.png'), razorpayEnabled: true, type: 'coins' },
    { id: 3, name: 'Mega Coins', desc: '2000 Coins', price: 149, img: require('../images/bag.png'), razorpayEnabled: true, type: 'coins' },

    // XP
    { id: 4, name: 'XP Booster', desc: '50 XP', price: 79, img: require('../images/xpicon.png'), razorpayEnabled: true, type: 'xp' },
    { id: 5, name: 'Double XP', desc: '100 XP  ', price: 129, img: require('../images/xp.png'), razorpayEnabled: true, type: 'xp' },

    // BOARDS
    { id: 6, name: 'Free Board', desc: 'Extra 1 board', price: 299, img: require('../images/boards/gaming.png'), razorpayEnabled: true, type: 'boards' },
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

            <Text style={s.skinName}>{item?.name}</Text>
            <Text style={s.skinSub}>{isFree ? 'Free' : item?.sub}</Text>

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
                    onPress={() => { showAlert2({ type: 'confirm', title: `Purchasing ${item?.name}`, message: "Are you sure, you want to purchase? ", onConfirm: () => canAfford && onBuy(item) }) }}
                    disabled={!canAfford}
                >
                    <Text style={[s.btnTxt, !canAfford && s.btnCantTxt]}>
                        🪙 {item?.price}
                    </Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

// ─── Premium card (Razorpay) ──────────────────────────────────────────────────
const PremiumCard = ({ item, onBuy, isLoading }) => {
    const typeEmoji = item.type === 'coins' ? '💰' : item.type === 'xp' ? '⭐' : '🎲';

    return (
        <View style={s.premiumCard}>
            <View style={s.typeTag}>
                <Text style={s.typeTagTxt}>{typeEmoji} {item.type.toUpperCase()}</Text>
            </View>

            <Image source={item.img} style={s.premiumImg} resizeMode="contain" />
            <Text style={s.premiumName}>{item.name}</Text>
            <Text style={s.premiumDesc}>{item.desc}</Text>

            <TouchableOpacity
                style={[s.premiumBtn, isLoading && s.btnLoading]}
                onPress={() => onBuy(item)}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator size="small" color="#3A1A00" />
                ) : (
                    <Text style={s.premiumBtnTxt}>₹{item.price}</Text>
                )}
            </TouchableOpacity>
        </View>
    );
};

// ─── Free reward card ──────────────────────────────────────────────────────────
const FreeCard = ({ item, onBuy, onWatchAd, adLoaded, isLoading }) => {
    const isAd = item.price === "Ad" || item.price === "AdXP";

    return (
        <View style={s.freeCard}>
            <Image source={item.img} style={s.freeImg} resizeMode="contain" />
            <Text style={s.freeName}>{item.name}</Text>
            <Text style={s.freeDesc}>{item.desc}</Text>

            {isAd ? (
                <TouchableOpacity
                    style={[s.freeBtn, !adLoaded && s.btnCant]}
                    onPress={() => adLoaded && onBuy(item)}
                    disabled={!adLoaded}
                >
                    <Text style={[s.freeBtnTxt, !adLoaded && s.btnCantTxt]}>
                        {adLoaded ? '🎬 Watch Ad' : 'Loading...'}
                    </Text>
                </TouchableOpacity>
            ) : null}
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
    <View style={[style ?? s.premiumCard, { justifyContent: 'center', alignItems: 'center', overflow: 'hidden', padding: 0, minHeight: 50, maxHeight: 180 }]}>
        <BannerAd
            unitId={__DEV__ ? TestIds.BANNER : 'ca-app-pub-2234703611718718/6246590554'}
            size={BannerAdSize.MEDIUM_RECTANGLE}
        />
    </View>
);

// ─── Main Shop ────────────────────────────────────────────────────────────────
const Shop = () => {
    const { user, setUser, fetchUser } = useAuth();
    const [skinTab, setSkinTab] = React.useState('boards');
    const [ownedBoards, setOwnedBoards] = React.useState(user.ownedBoards || ['classic']);
    const [ownedDaubs, setOwnedDaubs] = React.useState(user.ownedDaubs || ['daub']);
    const [loadingItemId, setLoadingItemId] = React.useState(null);

    // ── Rewarded ad: 100 coins for item id 1 ───────────────────────────────────
    // ✅ FIXED: Now uses TestIds in dev mode (consistent with XP ad)
    const { isLoaded: coinsAdLoaded, isEarnedReward, load: loadCoinsAd, show: showCoinsAd } = useRewardedAd(
        __DEV__ ? TestIds.REWARDED : AD_UNIT_IDS.rewardedCoins,
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
        __DEV__ ? TestIds.REWARDED : AD_UNIT_IDS.rewardedXp,
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

            setUser(prev => ({ ...prev, levelXp: json.levelXp , totalXp: json.totalXp}));
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

    // ── Razorpay payment handler ───────────────────────────────────────────────
    const handleRazorpayPayment = async (item) => {
        try {
            setLoadingItemId(item.id);

            // Step 1: Create order on backend
            const token = await AsyncStorage.getItem('authToken');
            const orderRes = await fetch(`${BACKEND_URL}/api/payments/create-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'auth-token': token },
                body: JSON.stringify({
                    itemId: item.id,
                    itemName: item.name,
                    amount: item.price,
                }),
            });

            const orderData = await orderRes.json();
            if (!orderRes.ok) {
                showAlert2({ type: 'error', title: orderData.message || 'Failed to create order' });
                setLoadingItemId(null);
                return;
            }

            // Step 2: Open Razorpay checkout
            const options = {
                description: item.name,
                image: 'https://kommodo.ai/i/r4wM91zToF99rJhC1xxq',
                currency: 'INR',
                key: RAZORPAY_KEY_ID,
                amount: item.price * 100, // Amount in paise
                order_id: orderData.orderId,
                name: 'BingoBing',
                prefill: {
                    email: user?.email || '',
                    contact: user?.phone || '',
                },
                theme: { color: '#FFD67A' },
            };

            RazorpayCheckout.open(options)
                .then(async (data) => {
                    // Step 3: Payment successful, verify on backend
                    const verifyRes = await fetch(`${BACKEND_URL}/api/payments/verify-payment`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'auth-token': token },
                        body: JSON.stringify({
                            razorpay_order_id: data.razorpay_order_id,
                            razorpay_payment_id: data.razorpay_payment_id,
                            razorpay_signature: data.razorpay_signature,
                            itemId: item.id,
                        }),
                    });

                    const verifyData = await verifyRes.json();
                    if (!verifyRes.ok) {
                        showAlert2({ type: 'error', title: 'Payment verification failed' });
                        setLoadingItemId(null);
                        return;
                    }

                    // Step 4: Update user state
                    setUser(prev => ({
                        ...prev,
                        ...verifyData.updatedUser, // Backend returns updated user with new coins/xp
                    }));

                    showAlert2({
                        type: 'success',
                        title: `Payment successful! ${item.name} added to your account.`,
                    });

                    setLoadingItemId(null);
                })
                .catch((error) => {
                    if (error.code === 'CANCELLED') {
                        showAlert2({ type: 'info', title: 'Payment cancelled' });
                    } else {
                        showAlert2({ type: 'error', title: 'Payment failed: ' + error.description });
                    }
                    setLoadingItemId(null);
                });
        } catch (e) {
            console.log('Razorpay error:', e);
            showAlert2({ type: 'error', title: 'An error occurred. Please try again.' });
            setLoadingItemId(null);
        }
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
            await fetchUser();
            if (!res.ok) {
                showAlert2({ type: 'error', title: json.message || 'Failed' });
                return;
            }

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

                        {/* ── Free Rewards (Ad-based) ── */}
                        <SectionHeader title="Free Rewards" sub="Watch ads to earn coins & XP" />
                        <View style={s.freeGrid}>
                            {FREE_ITEMS.map(item => (
                                <FreeCard
                                    key={item.id}
                                    item={item}
                                    onBuy={item.type === 'coins' ? handleWatchAd : handleWatchXpAd}
                                    onWatchAd={handleWatchAd}
                                    adLoaded={item.type === 'coins' ? coinsAdLoaded : xpAdLoaded}
                                />
                            ))}
                        </View>
                        {/* Banner Ad - Below Free Rewards */}
                        <View style={s.bannerAdContainer}>
                            <BannerAd
                                unitId={__DEV__ ? TestIds.BANNER : 'ca-app-pub-2234703611718718/6246590554'}
                                size={BannerAdSize.BANNER}
                            />
                        </View>
                        <View style={s.divider} />

                        {/* ── Premium Store (Razorpay only) ── */}
                        <SectionHeader title="Premium Store" sub="Purchase with real money • Sorted by type" />
                        <View style={s.premiumGrid}>
                            {PREMIUM_ITEMS.map(item => (
                                <PremiumCard
                                    key={item.id}
                                    item={item}
                                    onBuy={handleRazorpayPayment}
                                    isLoading={loadingItemId === item.id}
                                />
                            ))}
                            {PREMIUM_ITEMS.length % 2 !== 0 && <AdCard style={s.premiumCard} />}
                        </View>
                        {/* Banner Ad - Below Premium Store */}
                        <View style={s.bannerAdContainer}>
                            <BannerAd
                                unitId={__DEV__ ? TestIds.BANNER : 'ca-app-pub-2234703611718718/6246590554'}
                                size={BannerAdSize.BANNER}
                            />
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
    btnLoading: { opacity: 0.7 },

    divider: { height: 1, backgroundColor: 'rgba(255,214,122,0.2)', marginVertical: 22 },

    // FREE REWARDS SECTION
    freeGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5 },
    freeCard: { width: '48%', margin: '1%', backgroundColor: 'rgba(100,255,150,0.1)', borderRadius: 14, borderWidth: 1.5, borderColor: 'rgba(100,255,150,0.4)', padding: 10, alignItems: 'center', gap: 4 },
    freeImg: { width: 60, height: 60 },
    freeName: { color: TEXT, fontSize: 13, fontWeight: '700', textAlign: 'center' },
    freeDesc: { color: SUB, fontSize: 11, textAlign: 'center' },
    freeBtn: { backgroundColor: 'rgba(100,255,150,0.3)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 5, marginTop: 4, borderWidth: 1, borderColor: 'rgba(100,255,150,0.6)' },
    freeBtnTxt: { color: '#7AFF9A', fontWeight: '700', fontSize: 11 },

    // PREMIUM STORE SECTION
    premiumGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5 },
    premiumCard: { width: '48%', margin: '1%', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 14, borderWidth: 1.5, borderColor: GOLD, padding: 10, alignItems: 'center', gap: 5 },
    typeTag: { position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(248,181,95,0.2)', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
    typeTagTxt: { color: GOLD, fontSize: 9, fontWeight: '700' },
    premiumImg: { width: 60, height: 60, marginTop: 4 },
    premiumName: { color: TEXT, fontSize: 13, fontWeight: '700', textAlign: 'center' },
    premiumDesc: { color: SUB, fontSize: 11, textAlign: 'center' },
    premiumBtn: { backgroundColor: GOLD, borderRadius: 10, paddingHorizontal: 18, paddingVertical: 6, marginTop: 6, width: '100%', alignItems: 'center' },
    premiumBtnTxt: { color: '#3A1A00', fontWeight: '700', fontSize: 13 },
    bannerAdContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 16,
        backgroundColor: 'rgba(0,0,0,0.1)',
        borderRadius: 12,
        overflow: 'hidden',
        minHeight: 60,
    }
});