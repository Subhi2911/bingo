/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */
import React, { useState, useEffect, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    Animated, Easing, Alert, StatusBar, 
    ImageBackground, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../config/backend';
import { showAlert2 } from './CustomAlert2';
import { useAlertToast } from './AlertToast';

// ─── Theme data ───────────────────────────────────────────────────────────────
const BOARD_THEMES = {
    classic: { id: 'classic', name: 'Classic', price: 0,   coins: 'Free',      glow: '#FFD67A', img: require('../images/boards/classic.png') },
    ocean:   { id: 'ocean',   name: 'Ocean',   price: 1500, coins: '1500 coins', glow: '#5DCFFF', img: require('../images/boards/ocean.png')   },
    forest:  { id: 'forest',  name: 'Forest',  price: 3000, coins: '3000 coins', glow: '#7FE891', img: require('../images/boards/forest.png')  },
    galaxy:  { id: 'galaxy',  name: 'Galaxy',  price: 2500, coins: '2500 coins', glow: '#C49BFF', img: require('../images/boards/galaxy.png')  },
    candy:   { id: 'candy',   name: 'Candy',   price: 3500, coins: '3500 coins', glow: '#FFB3D9', img: require('../images/boards/candy.png')   },
    lava:    { id: 'lava',    name: 'Lava',    price: 6000, coins: '6000 coins', glow: '#FF8C42', img: require('../images/boards/lava.png')    },
    barbie:   { id: 'barbie', name: 'barbie',  price: 9500, coins: '9500 coins', glow: '#d15693', img: require('../images/boards/barbie.png')}
};

const DAUB_STYLES = {
    daub:    { id: 'daub',    name: 'Daub',    price: 0,   coins: 'Free',        ring: '#FFD700', img: require('../images/daubs/daub (2).png')    },
    flame:   { id: 'flame',   name: 'Flame',   price: 1000, coins: '1000 coins', ring: '#FF6600', img: require('../images/daubs/flame.png')   },
    ice:     { id: 'ice',     name: 'Ice',     price: 2000, coins: '2000 coins', ring: '#5DCFFF', img: require('../images/daubs/ice.png')     },
    crown:   { id: 'crown',   name: 'Crown',   price: 4000, coins: '4000 coins', ring: '#FFD700', img: require('../images/daubs/crown.png')   },
    thunder: { id: 'thunder', name: 'Thunder', price: 5000, coins: '5000 coins', ring: '#FFFF44', img: require('../images/daubs/thunder.png') },
    skull:   { id: 'skull',   name: 'Skull',   price: 5500, coins: '5500 coins', ring: '#CC44CC', img: require('../images/daubs/skull.png')   },
    star:    { id: 'star',    name: 'Star',    price: 3500, coins: '3500 coins', ring: '#C49BFF', img: require('../images/daubs/star.png') },

};

// ─── Board card ───────────────────────────────────────────────────────────────
const BoardCard = ({ item, selected, owned, onPress }) => {
    const t          = BOARD_THEMES[item.id];
    const isSelected = selected === item.id;
    const isOwned    = owned.includes(item.id);
    const isLocked   = !isOwned;
    const scaleAnim  = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.93, duration: 70,  useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1,    duration: 150, useNativeDriver: true, easing: Easing.out(Easing.back(2)) }),
        ]).start();
        onPress(item.id);
    };

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '48%', marginBottom: 14 }}>
            <TouchableOpacity
                activeOpacity={0.88}
                onPress={handlePress}
                style={[
                    s.boardCard,
                    isSelected && { borderColor: t.glow, borderWidth: 2.5, shadowColor: t.glow, shadowOpacity: 0.7, shadowRadius: 10, elevation: 10 },
                    !isSelected && { borderColor: 'rgba(255,255,255,0.25)' },
                ]}
            >
                {/* Badges */}
                {isSelected && (
                    <View style={[s.badge, { backgroundColor: t.glow }]}>
                        <Text style={s.badgeOnTxt}>✓ ON</Text>
                    </View>
                )}
                {isOwned && !isSelected && (
                    <View style={[s.badge, { backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' }]}>
                        <Text style={s.badgeOwnedTxt}>✓</Text>
                    </View>
                )}
                {isLocked && (
                    <View style={[s.badge, { backgroundColor: 'rgba(0,0,0,0.35)' }]}>
                        <Text style={s.badgeLockedTxt}>🔒</Text>
                    </View>
                )}

                {/* Board image */}
                <View style={[s.boardImgWrap, isLocked && { opacity: 0.45 }]}>
                    <Image source={t.img} style={s.boardImg} resizeMode="contain" />
                </View>

                <Text style={s.cardName}>{item.name}</Text>

                <View style={[
                    s.pricePill,
                    isSelected
                        ? { backgroundColor: t.glow + '30', borderColor: t.glow + '80' }
                        : { backgroundColor: 'rgba(255,255,255,0.12)', borderColor: 'rgba(255,255,255,0.2)' },
                ]}>
                    <Text style={[s.priceTxt, { color: isSelected ? t.glow : 'rgba(255,255,255,0.7)' }]}>
                        {item.price === 0 ? '🎁 Free' : `🪙 ${item.coins}`}
                    </Text>
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};

// ─── Daub card ────────────────────────────────────────────────────────────────
const DaubCard = ({ item, selected, owned, onPress }) => {
    const d          = DAUB_STYLES[item.id];
    const isSelected = selected === item.id;
    const isOwned    = owned.includes(item.id);
    const isLocked   = !isOwned;
    const scaleAnim  = useRef(new Animated.Value(1)).current;

    const handlePress = () => {
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.92, duration: 70,  useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1,    duration: 150, useNativeDriver: true, easing: Easing.out(Easing.back(2)) }),
        ]).start();
        onPress(item.id);
    };

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }], width: '31%', marginBottom: 14 }}>
            <TouchableOpacity
                activeOpacity={0.88}
                onPress={handlePress}
                style={[
                    s.daubCard,
                    isSelected && { borderColor: d.ring, borderWidth: 2.5, shadowColor: d.ring, shadowOpacity: 0.65, shadowRadius: 10, elevation: 10 },
                    !isSelected && { borderColor: 'rgba(255,255,255,0.25)' },
                ]}
            >
                {isSelected && (
                    <View style={[s.badge, { backgroundColor: d.ring }]}>
                        <Text style={s.badgeOnTxt}>✓</Text>
                    </View>
                )}
                {isOwned && !isSelected && (
                    <View style={[s.badge, { backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)' }]}>
                        <Text style={s.badgeOwnedTxt}>✓</Text>
                    </View>
                )}
                {isLocked && (
                    <View style={[s.badge, { backgroundColor: 'rgba(0,0,0,0.35)' }]}>
                        <Text style={s.badgeLockedTxt}>🔒</Text>
                    </View>
                )}

                <View style={[
                    s.daubImgWrap,
                    isSelected && { borderColor: d.ring, borderWidth: 2 },
                    isLocked && { opacity: 0.45 },
                ]}>
                    <Image source={d.img} style={s.daubImg} resizeMode="contain" />
                </View>

                <Text style={s.cardName}>{item.name}</Text>
                <Text style={[s.priceTxtSm, { color: isSelected ? d.ring : 'rgba(255,255,255,0.6)' }]}>
                    {item.price === 0 ? '🎁 Free' : `🪙 ${item.price}`}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

// ─── Main screen ──────────────────────────────────────────────────────────────
const CustomizeScreen = ({ navigation }) => {
    const [activeTab,   setActiveTab]   = useState('boards');
    const [selBoard,    setSelBoard]    = useState('classic');
    const [selDaub,     setSelDaub]     = useState('star');
    const [ownedBoards, setOwnedBoards] = useState(['classic']);
    const [ownedDaubs,  setOwnedDaubs]  = useState(['star']);
    const [saved,       setSaved]       = useState(false);
    const [userCoins,   setUserCoins]   = useState(0);
    const { showToast } = useAlertToast();

    const saveAnim    = useRef(new Animated.Value(1)).current;
    const previewAnim = useRef(new Animated.Value(0)).current;
    const tabUnderAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const init = async () => {
            try {
                // ── Fetch user from server (owned items + coin balance) ──
                const token = await AsyncStorage.getItem('authToken');
                const response = await fetch(`${BACKEND_URL}/api/auth/getuser`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'auth-token': token,
                    },
                });
                const user = await response.json();

                if (user.ownedBoards?.length) setOwnedBoards(user.ownedBoards);
                if (user.ownedDaubs?.length)  setOwnedDaubs(user.ownedDaubs);
                if (user.money != null)        setUserCoins(user.money);

                // ── Load equipped prefs from AsyncStorage (local only) ──
                const [eB, eD] = await Promise.all([
                    AsyncStorage.getItem('equippedBoard'),
                    AsyncStorage.getItem('equippedDaub'),
                ]);
                if (eB) setSelBoard(eB);
                if (eD) setSelDaub(eD);

            } catch (e) { console.log(e); }
        };

        init();
        Animated.timing(previewAnim, { toValue: 1, duration: 500, delay: 120, useNativeDriver: true }).start();
    }, []);

    const flashPreview = () => {
        Animated.sequence([
            Animated.timing(previewAnim, { toValue: 0.35, duration: 80,  useNativeDriver: true }),
            Animated.timing(previewAnim, { toValue: 1,    duration: 260, useNativeDriver: true }),
        ]).start();
    };

    const handleSelectBoard = (id) => {
        if (!ownedBoards.includes(id)) {
            showAlert2({type:'info', title:'Locked 🔒', message:`${BOARD_THEMES[id].name} costs ${BOARD_THEMES[id].coins}.\nVisit the Shop to unlock it.`})
            return;
        }
        setSelBoard(id); setSaved(false); flashPreview();
    };

    const handleSelectDaub = (id) => {
        if (!ownedDaubs.includes(id)) {
            showAlert2({type:'info', title:'Locked 🔒', message:`${DAUB_STYLES[id].name} costs ${DAUB_STYLES[id].coins}.\nVisit the Shop to unlock it.`})
            return;
        }
        setSelDaub(id); setSaved(false); flashPreview();
    };

    const handleSave = async () => {
        try {
            await AsyncStorage.multiSet([
                ['equippedBoard', selBoard],
                ['equippedDaub',  selDaub],
            ]);
            setSaved(true);
            Animated.sequence([
                Animated.timing(saveAnim, { toValue: 0.91, duration: 80,  useNativeDriver: true }),
                Animated.timing(saveAnim, { toValue: 1.07, duration: 140, useNativeDriver: true, easing: Easing.out(Easing.back(3)) }),
                Animated.timing(saveAnim, { toValue: 1,    duration: 100, useNativeDriver: true }),
            ]).start();
        } catch (e) {
            showToast('error','Error','Could mot save preferences.')
        }
    };

    const switchTab = (tab) => {
        setActiveTab(tab);
        Animated.timing(tabUnderAnim, {
            toValue: tab === 'boards' ? 0 : 1,
            duration: 230,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false,
        }).start();
    };

    const tabIndicatorLeft = tabUnderAnim.interpolate({ inputRange: [0, 1], outputRange: ['2%', '52%'] });

    const activeBoard = BOARD_THEMES[selBoard];
    const activeDaub  = DAUB_STYLES[selDaub];
    const boardList   = Object.values(BOARD_THEMES);
    const daubList    = Object.values(DAUB_STYLES);

    return (
        <ImageBackground
            source={require('../images/chat_bg.png')}
            style={s.bgImg}
            resizeMode="cover"
        >
            {/* Dark overlay to make content readable */}
            <View style={s.overlay} />

            <SafeAreaView style={s.safe}>
                <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

                {/* ── Header ── */}
                <View style={s.header}>
                    <TouchableOpacity style={s.backBtn} onPress={() => navigation?.goBack?.()}>
                        <Text style={s.backArrow}>‹</Text>
                    </TouchableOpacity>
                    <Text style={s.headerTitle}>My Loadout</Text>
                    <View style={s.coinsPill}>
                        <Text style={{ fontSize: 14 }}>🪙</Text>
                        <Text style={s.coinsVal}>{userCoins.toLocaleString()}</Text>
                    </View>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={s.scroll}
                >

                    {/* ── Live Preview ── */}
                    <View style={s.previewSection}>
                        <Text style={s.previewLabel}>PREVIEW</Text>

                        <Animated.View style={[s.previewCard, { opacity: previewAnim, borderColor: activeBoard.glow + '66' }]}>
                            {/* Board image large */}
                            <View style={s.previewBoardWrap}>
                                <Image
                                    source={activeBoard.img}
                                    style={s.previewBoardImg}
                                    resizeMode="contain"
                                />
                                {/* Daub floating badge */}
                                <View style={[s.previewDaubBadge, { borderColor: activeDaub.ring, shadowColor: activeDaub.ring }]}>
                                    <Image source={activeDaub.img} style={s.previewDaubImg} resizeMode="contain" />
                                </View>
                            </View>

                            {/* Combo label row */}
                            <View style={s.comboRow}>
                                <View style={[s.comboChip, { borderColor: activeBoard.glow + '70', backgroundColor: activeBoard.glow + '18' }]}>
                                    <Text style={[s.comboChipTxt, { color: activeBoard.glow }]}>{activeBoard.name} Board</Text>
                                </View>
                                <Text style={s.comboPlusTxt}>+</Text>
                                <View style={[s.comboChip, { borderColor: activeDaub.ring + '70', backgroundColor: activeDaub.ring + '18' }]}>
                                    <Text style={[s.comboChipTxt, { color: activeDaub.ring }]}>{activeDaub.name} Daub</Text>
                                </View>
                            </View>
                        </Animated.View>
                    </View>

                    {/* ── Tab bar ── */}
                    <View style={s.tabBar}>
                        <Animated.View style={[s.tabIndicator, { left: tabIndicatorLeft }]} />
                        <TouchableOpacity style={s.tabBtn} onPress={() => switchTab('boards')}>
                            <Text style={[s.tabTxt, activeTab === 'boards' && s.tabTxtActive]}>
                                🎲  Boards
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={s.tabBtn} onPress={() => switchTab('daubs')}>
                            <Text style={[s.tabTxt, activeTab === 'daubs' && s.tabTxtActive]}>
                                ⭐  Daubs
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* ── Section subtitle ── */}
                    <Text style={s.sectionHint}>
                        {activeTab === 'boards'
                            ? 'Choose your board skin for the game'
                            : 'Choose how your numbers get daubed'}
                    </Text>

                    {/* ── Board grid ── */}
                    {activeTab === 'boards' && (
                        <View style={s.grid}>
                            {boardList.map(item => (
                                <BoardCard
                                    key={item.id}
                                    item={item}
                                    selected={selBoard}
                                    owned={ownedBoards}
                                    onPress={handleSelectBoard}
                                />
                            ))}
                        </View>
                    )}

                    {/* ── Daub grid ── */}
                    {activeTab === 'daubs' && (
                        <View style={[s.grid, { justifyContent: 'space-between' }]}>
                            {daubList.map(item => (
                                <DaubCard
                                    key={item.id}
                                    item={item}
                                    selected={selDaub}
                                    owned={ownedDaubs}
                                    onPress={handleSelectDaub}
                                />
                            ))}
                        </View>
                    )}

                    {/* ── Lock hint ── */}
                    <Text style={s.lockHint}>🔒 Locked items can be purchased in the Shop</Text>

                    {/* ── Save button ── */}
                    <Animated.View style={{ transform: [{ scale: saveAnim }], marginBottom: 36 }}>
                        <TouchableOpacity
                            style={[
                                s.saveBtn,
                                saved
                                    ? { backgroundColor: '#22C55E', borderColor: '#86EFAC', shadowColor: '#22C55E' }
                                    : { backgroundColor: '#F8B55F', borderColor: '#FFD67A', shadowColor: '#F8B55F' },
                            ]}
                            onPress={handleSave}
                            activeOpacity={0.88}
                        >
                            <Text style={s.saveBtnTxt}>
                                {saved ? '✓  Loadout Saved!' : 'Save Loadout'}
                            </Text>
                        </TouchableOpacity>
                    </Animated.View>

                </ScrollView>
            </SafeAreaView>
        </ImageBackground>
    );
};

export default CustomizeScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────
const GOLD  = '#FFD67A';
const WHITE = '#FFFFFF';
const GLASS = 'rgba(255,255,255,0.13)';
const GLASS_BORDER = 'rgba(255,255,255,0.28)';

const s = StyleSheet.create({
    // Background
    bgImg:   { flex: 1, width: '100%', height: '100%' },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,30,60,0.62)' },
    safe:    { flex: 1 },
    scroll:  { paddingHorizontal: 16, paddingBottom: 20 },

    // Header
    header:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.12)' },
    backBtn:     { width: 38, height: 38, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, marginRight: 12, borderWidth: 1, borderColor: GLASS_BORDER },
    backArrow:   { color: WHITE, fontSize: 26, lineHeight: 28 },
    headerTitle: { flex: 1, color: WHITE, fontSize: 21, fontWeight: '800', letterSpacing: 0.3 },
    coinsPill:   { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(248,181,95,0.18)', borderWidth: 1, borderColor: 'rgba(248,181,95,0.45)', borderRadius: 18, paddingHorizontal: 13, paddingVertical: 6 },
    coinsVal:    { color: GOLD, fontWeight: '700', fontSize: 14 },

    // Preview
    previewSection: { alignItems: 'center', paddingTop: 22, paddingBottom: 18 },
    previewLabel:   { color: 'rgba(255,255,255,0.45)', fontSize: 10, fontWeight: '700', letterSpacing: 3, marginBottom: 14 },
    previewCard:    { width: '100%', alignItems: 'center', backgroundColor: GLASS, borderRadius: 24, borderWidth: 1.5, padding: 20, gap: 14 },

    previewBoardWrap:  { position: 'relative', width: 200, height: 200, alignItems: 'center', justifyContent: 'center' },
    previewBoardImg:   { width: 190, height: 190 },
    previewDaubBadge:  { position: 'absolute', bottom: 0, right: 0, width: 62, height: 62, borderRadius: 31, backgroundColor: 'rgba(0,0,0,0.55)', borderWidth: 2.5, shadowOpacity: 0.7, shadowRadius: 8, shadowOffset: { width: 0, height: 0 }, justifyContent: 'center', alignItems: 'center' },
    previewDaubImg:    { width: 46, height: 46 },

    // Combo chips
    comboRow:     { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
    comboPlusTxt: { color: 'rgba(255,255,255,0.4)', fontSize: 18, fontWeight: '700' },
    comboChip:    { borderWidth: 1, borderRadius: 20, paddingHorizontal: 13, paddingVertical: 5 },
    comboChipTxt: { fontSize: 12, fontWeight: '700' },

    // Tabs
    tabBar:       { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 4, marginBottom: 10, position: 'relative', overflow: 'hidden', borderWidth: 1, borderColor: GLASS_BORDER },
    tabIndicator: { position: 'absolute', top: 4, width: '46%', height: '100%', borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.22)' },
    tabBtn:       { flex: 1, paddingVertical: 11, alignItems: 'center' },
    tabTxt:       { color: 'rgba(255,255,255,0.45)', fontSize: 14, fontWeight: '600' },
    tabTxtActive: { color: WHITE, fontWeight: '800' },

    sectionHint: { color: 'rgba(255,255,255,0.45)', fontSize: 12, textAlign: 'center', marginBottom: 16 },

    // Grids
    grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 8 },

    // Board card
    boardCard: {
        backgroundColor: GLASS,
        borderRadius: 20,
        borderWidth: 1.5,
        padding: 10,
        alignItems: 'center',
        gap: 8,
    },
    boardImgWrap: { width: '100%', height: 120, justifyContent: 'center', alignItems: 'center' },
    boardImg:     { width: '100%', height: '100%' },

    // Daub card
    daubCard: {
        backgroundColor: GLASS,
        borderRadius: 20,
        borderWidth: 1.5,
        padding: 10,
        alignItems: 'center',
        gap: 6,
    },
    daubImgWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.2)' },
    daubImg:     { width: 48, height: 48 },

    // Shared card text
    cardName:    { color: WHITE, fontSize: 13, fontWeight: '700', textAlign: 'center' },
    pricePill:   { borderWidth: 1, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 3 },
    priceTxt:    { fontSize: 11, fontWeight: '600' },
    priceTxtSm:  { fontSize: 10, fontWeight: '600', textAlign: 'center' },

    // Badges
    badge:         { position: 'absolute', top: 8, right: 8, borderRadius: 10, paddingHorizontal: 7, paddingVertical: 2, zIndex: 2 },
    badgeOnTxt:    { fontSize: 9, fontWeight: '800', color: '#0D0B1A' },
    badgeOwnedTxt: { fontSize: 9, fontWeight: '700', color: WHITE },
    badgeLockedTxt:{ fontSize: 10 },

    // Footer
    lockHint: { color: 'rgba(255,255,255,0.3)', fontSize: 11, textAlign: 'center', marginBottom: 22 },
    saveBtn:  { borderRadius: 18, borderWidth: 2, paddingVertical: 17, alignItems: 'center', shadowOpacity: 0.45, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
    saveBtnTxt: { color: '#0D0B1A', fontSize: 16, fontWeight: '900', letterSpacing: 0.4 },
});