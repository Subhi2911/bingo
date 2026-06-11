/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
/**
 * CustomAlert2.jsx
 *
 * Drop-in replacement for Alert.alert() across the app.
 *
 * USAGE — imperative API (closest to Alert.alert):
 * ─────────────────────────────────────────────────
 *   import { showAlert } from './CustomAlert2';
 *
 *   // Simple OK alert (e.g. "Daily reward claimed!")
 *   showAlert({
 *     type: 'success',
 *     title: 'Daily reward claimed!',
 *     message: 'Come back tomorrow to keep your streak going.',
 *   });
 *
 *   // Confirm / cancel alert
 *   showAlert({
 *     type: 'confirm',
 *     title: 'Are you sure?',
 *     message: 'This action cannot be undone.',
 *     confirmLabel: 'Yes, do it',
 *     cancelLabel: 'Cancel',
 *     onConfirm: () => handleDelete(),
 *   });
 *
 *   // Power description (long-press)
 *   showAlert({
 *     type: 'power',
 *     title: 'Shadow Step',
 *     subtitle: 'Power · Instant',
 *     message: 'Instantly marks one unmarked number of your choice.',
 *     powerMeta: ['One use per game', 'No cooldown'],
 *   });
 *
 *   // Reward claim with value
 *   showAlert({
 *     type: 'reward',
 *     title: 'Daily Reward',
 *     subtitle: 'Day 4 streak',
 *     message: 'Your daily reward is ready to claim!',
 *     rewardLabel: "Today's reward",
 *     rewardValue: '+150 coins',
 *     confirmLabel: 'Claim now',
 *     cancelLabel: 'Later',
 *     onConfirm: () => claimReward(),
 *   });
 *
 * USAGE — JSX (if you prefer declarative):
 * ─────────────────────────────────────────
 *   import CustomAlert2, { AlertProvider } from './CustomAlert2';
 *
 *   // Wrap your app root once:
 *   <AlertProvider>
 *     <App />
 *   </AlertProvider>
 *
 *   // Or place the component directly:
 *   <CustomAlert2 visible={visible} type="success" title="Done!" message="All good." onOk={() => setVisible(false)} />
 *
 * REPLACING Alert.alert — quick find-replace patterns:
 * ─────────────────────────────────────────────────────
 *   Alert.alert('Title', 'Message')
 *   → showAlert({ type: 'info', title: 'Title', message: 'Message' })
 *
 *   Alert.alert('Title', 'Message', [{ text: 'OK', onPress: fn }])
 *   → showAlert({ type: 'success', title: 'Title', message: 'Message', onConfirm: fn })
 *
 *   Alert.alert('Title', 'Message', [
 *     { text: 'Cancel', style: 'cancel' },
 *     { text: 'OK', onPress: fn }
 *   ])
 *   → showAlert({ type: 'confirm', title: 'Title', message: 'Message', onConfirm: fn })
 */

import React, {
    createContext,
    useContext,
    useRef,
    useState,
    useCallback,
    useEffect,
} from 'react';
import {
    Modal,
    View,
    Text,
    TouchableOpacity,
    Animated,
    StyleSheet,
} from 'react-native';

// ─── Theme tokens ─────────────────────────────────────────────────────────────
const T = {
    purpleBg: '#1E1040',
    purpleSurface: '#2D1B69',
    purpleMid: '#3D2580',
    purpleLite: '#6B4EBF',
    purpleText: '#EDE0FF',
    purpleMuted: '#B8A8D0',
    purpleChip: '#C3A9F0',
    green: '#66BB6A',
    greenDim: '#A8D5AA',
    greenBorder: 'rgba(76,175,80,0.30)',
    greenBg: 'rgba(76,175,80,0.10)',
    amber: '#F0A500',
    amberBorder: 'rgba(240,165,0,0.30)',
    amberBg: 'rgba(240,165,0,0.10)',
    chipBg: 'rgba(107,78,191,0.22)',
    chipBorder: 'rgba(107,78,191,0.45)',
    divider: 'rgba(107,78,191,0.30)',
    backdrop: 'rgba(13,6,36,0.85)',
};

// ─── Icon map (text glyphs — swap with your icon lib if desired) ──────────────
const ICON = {
    success: '✓',
    reward: '🎁',
    power: '⬡',
    confirm: '!',
    info: 'i',
    error: '✕',
};

const ICON_COLOR = {
    success: { bg: T.greenBg, border: T.greenBorder, color: T.green },
    reward: { bg: T.greenBg, border: T.greenBorder, color: T.green },
    power: { bg: T.chipBg, border: T.chipBorder, color: T.purpleChip },
    confirm: { bg: 'rgba(240,165,0,0.1)', border: T.amberBorder, color: T.amber },
    info: { bg: T.chipBg, border: T.chipBorder, color: T.purpleChip },
    error: { bg: 'rgba(220,50,50,0.1)', border: 'rgba(220,50,50,0.3)', color: '#FF6B6B' },
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
    backdrop: {
        flex: 1,
        backgroundColor: T.backdrop,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    card: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 20,
        backgroundColor: T.purpleMid,
        borderWidth: 1,
        borderColor: T.purpleLite,
        overflow: 'hidden',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingHorizontal: 20,
        paddingTop: 18,
        paddingBottom: 14,
        borderBottomWidth: 1,
        borderBottomColor: T.divider,
    },
    iconBox: {
        width: 38,
        height: 38,
        borderRadius: 11,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        flexShrink: 0,
    },
    iconText: {
        fontSize: 16,
        fontWeight: '600',
    },
    headerText: {
        flex: 1,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        color: T.purpleText,
        lineHeight: 20,
    },
    subtitle: {
        fontSize: 11,
        color: T.purpleMuted,
        marginTop: 2,
        fontWeight: '400',
    },
    body: {
        paddingHorizontal: 20,
        paddingTop: 14,
        paddingBottom: 18,
    },
    message: {
        fontSize: 13,
        color: '#C8B8E8',
        lineHeight: 20,
    },
    // Reward box
    rewardBox: {
        marginTop: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: T.greenBg,
        borderWidth: 1,
        borderColor: T.greenBorder,
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 14,
    },
    rewardLabel: {
        fontSize: 12,
        color: T.greenDim,
    },
    rewardValue: {
        fontSize: 18,
        fontWeight: '600',
        color: T.green,
    },
    // Power chips
    chipsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 12,
        gap: 8,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: T.chipBg,
        borderWidth: 1,
        borderColor: T.chipBorder,
        borderRadius: 20,
        paddingVertical: 5,
        paddingHorizontal: 12,
    },
    chipDot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: T.purpleChip,
    },
    chipText: {
        fontSize: 12,
        color: '#D4BCFF',
        fontWeight: '500',
    },
    // Actions
    actions: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: T.divider,
    },
    actionBtn: {
        flex: 1,
        paddingVertical: 13,
        alignItems: 'center',
        justifyContent: 'center',
    },
    actionDivider: {
        width: 1,
        backgroundColor: T.divider,
    },
    cancelLabel: {
        fontSize: 13,
        color: T.purpleMuted,
        fontWeight: '500',
    },
    confirmLabel: {
        fontSize: 14,
        color: T.green,
        fontWeight: '600',
    },
    okLabel: {
        fontSize: 15,
        color: T.green,
        fontWeight: '600',
    },
    errorLabel: {
        fontSize: 14,
        color: '#FF6B6B',
        fontWeight: '600',
    },
});

// ─── Alert card component ─────────────────────────────────────────────────────
function AlertCard({
    type = 'info',
    title,
    subtitle,
    message,
    rewardLabel,
    rewardValue,
    powerMeta,
    confirmLabel,
    cancelLabel,
    onConfirm,
    onCancel,
    onOk,
}) {
    const ic = ICON_COLOR[type] ?? ICON_COLOR.info;
    const isSingleAction = type === 'success' || type === 'info' || type === 'power' || type === 'error';

    const handleOk = () => {
        if (onConfirm) onConfirm();
        if (onOk) onOk();
    };

    const handleConfirm = () => {
        if (onConfirm) onConfirm();
    };

    const handleCancel = () => {
        if (onCancel) onCancel();
    };

    return (
        <View style={s.card}>
            {/* Header */}
            <View style={s.header}>
                <View style={[s.iconBox, { backgroundColor: ic.bg, borderColor: ic.border }]}>
                    <Text style={[s.iconText, { color: ic.color }]}>{ICON[type] ?? 'i'}</Text>
                </View>
                <View style={s.headerText}>
                    <Text style={s.title} numberOfLines={2}>{title}</Text>
                    {subtitle ? <Text style={s.subtitle}>{subtitle}</Text> : null}
                </View>
            </View>

            {/* Body */}
            <View style={s.body}>
                {message ? <Text style={s.message}>{message}</Text> : null}

                {/* Reward value box */}
                {type === 'reward' && rewardValue ? (
                    <View style={s.rewardBox}>
                        <Text style={s.rewardLabel}>{rewardLabel ?? "Today's reward"}</Text>
                        <Text style={s.rewardValue}>{rewardValue}</Text>
                    </View>
                ) : null}

                {/* Power meta chips */}
                {type === 'power' && Array.isArray(powerMeta) && powerMeta.length > 0 ? (
                    <View style={s.chipsRow}>
                        {powerMeta.map((m, i) => (
                            <View key={i} style={s.chip}>
                                <View style={s.chipDot} />
                                <Text style={s.chipText}>{m}</Text>
                            </View>
                        ))}
                    </View>
                ) : null}
            </View>

            {/* Actions */}
            <View style={s.actions}>
                {isSingleAction ? (
                    <TouchableOpacity style={s.actionBtn} onPress={handleOk} activeOpacity={0.7}>
                        <Text style={type === 'error' ? s.errorLabel : s.okLabel}>
                            {confirmLabel ?? 'OK'}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <>
                        <TouchableOpacity style={s.actionBtn} onPress={handleCancel} activeOpacity={0.7}>
                            <Text style={s.cancelLabel}>{cancelLabel ?? 'Cancel'}</Text>
                        </TouchableOpacity>
                        <View style={s.actionDivider} />
                        <TouchableOpacity style={s.actionBtn} onPress={handleConfirm} activeOpacity={0.7}>
                            <Text style={s.confirmLabel}>{confirmLabel ?? 'OK'}</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
        </View>
    );
}

// ─── JSX component (declarative) ─────────────────────────────────────────────
export default function CustomAlert2({ visible, onRequestClose, ...props }) {
    const anim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(anim, {
            toValue: visible ? 1 : 0,
            useNativeDriver: true,
            bounciness: 6,
            speed: 18,
        }).start();
    }, [visible]);

    const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] });

    return (
        <Modal
            transparent
            animationType="fade"
            visible={visible}
            onRequestClose={onRequestClose}
            statusBarTranslucent
        >
            <View style={s.backdrop}>
                <Animated.View style={{ width: '100%', transform: [{ scale }], opacity: anim }}>
                    <AlertCard
                        {...props}
                        onOk={onRequestClose}
                        onCancel={onRequestClose}
                    />
                </Animated.View>
            </View>
        </Modal>
    );
}

// ─── Imperative API ───────────────────────────────────────────────────────────
// Mirrors Alert.alert so you can do: showAlert({ type, title, message, ... })

let _show = null; // assigned by AlertProvider

export function showAlert2(config) {
    if (!_show) {
        console.warn(
            '[CustomAlert2] showAlert() called before <AlertProvider> mounted. ' +
            'Wrap your app root with <AlertProvider>.',
        );
        return;
    }
    _show(config);
}

// ─── AlertProvider — mount once at app root ───────────────────────────────────
const AlertContext = createContext(null);

export function AlertProvider({ children }) {
    const [state, setState] = useState({ visible: false, config: {} });
    const anim = useRef(new Animated.Value(0)).current;

    const show = useCallback((config) => {
        setState({ visible: true, config });
        anim.setValue(0);
        Animated.spring(anim, {
            toValue: 1,
            useNativeDriver: true,
            bounciness: 6,
            speed: 18,
        }).start();
    }, []);

    const hide = useCallback(() => {
        Animated.timing(anim, {
            toValue: 0,
            duration: 140,
            useNativeDriver: true,
        }).start(() => setState(prev => ({ ...prev, visible: false })));
    }, []);

    // Wire up imperative API
    useEffect(() => {
        _show = show;
        return () => { _show = null; };
    }, [show]);

    const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.88, 1] });

    const { config } = state;

    return (
        <AlertContext.Provider value={{ show, hide }}>
            {children}
            <Modal
                transparent
                animationType="fade"
                visible={state.visible}
                onRequestClose={hide}
                statusBarTranslucent
            >
                <View style={s.backdrop}>
                    <Animated.View style={{ width: '100%', transform: [{ scale }], opacity: anim }}>
                        <AlertCard
                            {...config}
                            onOk={() => {
                                if (config.onConfirm) config.onConfirm();
                                hide();
                            }}
                            onConfirm={() => {
                                if (config.onConfirm) config.onConfirm();
                                hide();
                            }}
                            onCancel={() => {
                                if (config.onCancel) config.onCancel();
                                hide();
                            }}
                        />
                    </Animated.View>
                </View>
            </Modal>
        </AlertContext.Provider>
    );
}

// Optional hook for advanced use
export function useAlert() {
    return useContext(AlertContext);
}