// AlertToast.js — green/red/yellow theme
// Usage:
//   Option A (hook): wrap root in <AlertToastProvider>, then useAlertToast()
//   Option B (imperative): render <AlertToastContainer /> once, call showToast()
//
//   showToast('success', 'Welcome back!', "Let's play!");
//   showToast('error', 'Login failed', 'Invalid email or password.');
//   showToast('warning', 'OTP sent', 'Check your email for the 6-digit code.');

import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, Animated, TouchableOpacity, StyleSheet, Platform,
} from 'react-native';

// ─── Theme tokens ─────────────────────────────────────────────────────────────
const COLORS = {
  SUCCESS_BG:     '#F0FAF2',
  SUCCESS_BORDER: '#2E7D32',
  SUCCESS_TITLE:  '#1B5E20',
  SUCCESS_ICON:   '#2E7D32',
  SUCCESS_ICON_BG:'rgba(46,125,50,0.12)',
  SUCCESS_BAR:    'rgba(46,125,50,0.35)',

  ERROR_BG:     '#FFF5F5',
  ERROR_BORDER: '#C62828',
  ERROR_TITLE:  '#B71C1C',
  ERROR_ICON:   '#C62828',
  ERROR_ICON_BG:'rgba(198,40,40,0.12)',
  ERROR_BAR:    'rgba(198,40,40,0.35)',

  WARNING_BG:     '#FFFDE7',
  WARNING_BORDER: '#F9A825',
  WARNING_TITLE:  '#E65100',
  WARNING_ICON:   '#E65100',
  WARNING_ICON_BG:'rgba(249,168,37,0.15)',
  WARNING_BAR:    'rgba(249,168,37,0.5)',

  MSG:   '#666666',
};

const TYPE_CONFIG = {
  success: {
    bg:        COLORS.SUCCESS_BG,
    accent:    COLORS.SUCCESS_BORDER,
    titleColor:COLORS.SUCCESS_TITLE,
    iconColor: COLORS.SUCCESS_ICON,
    iconBg:    COLORS.SUCCESS_ICON_BG,
    barColor:  COLORS.SUCCESS_BAR,
    icon: '✓',
  },
  error: {
    bg:        COLORS.ERROR_BG,
    accent:    COLORS.ERROR_BORDER,
    titleColor:COLORS.ERROR_TITLE,
    iconColor: COLORS.ERROR_ICON,
    iconBg:    COLORS.ERROR_ICON_BG,
    barColor:  COLORS.ERROR_BAR,
    icon: '✕',
  },
  warning: {
    bg:        COLORS.WARNING_BG,
    accent:    COLORS.WARNING_BORDER,
    titleColor:COLORS.WARNING_TITLE,
    iconColor: COLORS.WARNING_ICON,
    iconBg:    COLORS.WARNING_ICON_BG,
    barColor:  COLORS.WARNING_BAR,
    icon: '!',
  },
};

const AUTO_DISMISS_MS = 4000;

// ─── Single Toast ─────────────────────────────────────────────────────────────
const ToastItem = ({ id, type, title, message, onDismiss }) => {
  const cfg    = TYPE_CONFIG[type] || TYPE_CONFIG.warning;
  const slideY = useRef(new Animated.Value(60)).current;
  const fadeOp = useRef(new Animated.Value(0)).current;
  const scaleV = useRef(new Animated.Value(0.92)).current;
  const progress = useRef(new Animated.Value(1)).current;
  const timer  = useRef(null);

  const dismiss = useCallback(() => {
    clearTimeout(timer.current);
    Animated.parallel([
      Animated.timing(fadeOp, { toValue: 0, duration: 220, useNativeDriver: false }),
      Animated.timing(slideY, { toValue: -12, duration: 220, useNativeDriver: false }),
      Animated.timing(scaleV, { toValue: 0.95, duration: 220, useNativeDriver: false }),
    ]).start(() => onDismiss(id));
  }, [id, onDismiss, fadeOp, slideY, scaleV]);

  React.useEffect(() => {
    Animated.parallel([
      Animated.spring(slideY, { toValue: 0, tension: 60, friction: 8, useNativeDriver: false }),
      Animated.timing(fadeOp, { toValue: 1, duration: 220, useNativeDriver: false }),
      Animated.spring(scaleV, { toValue: 1, tension: 60, friction: 8, useNativeDriver: false }),
    ]).start();

    Animated.timing(progress, {
      toValue: 0,
      duration: AUTO_DISMISS_MS,
      useNativeDriver: false,
    }).start();

    timer.current = setTimeout(dismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const progressWidth = progress.interpolate({
    inputRange:  [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          opacity:         fadeOp,
          transform:       [{ translateY: slideY }, { scale: scaleV }],
          backgroundColor: cfg.bg,
          borderLeftColor: cfg.accent,
        },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: cfg.iconBg }]}>
        <Text style={[styles.iconText, { color: cfg.iconColor }]}>{cfg.icon}</Text>
      </View>

      <View style={styles.body}>
        <Text style={[styles.title, { color: cfg.titleColor }]} numberOfLines={1}>
          {title}
        </Text>
        {!!message && (
          <Text style={styles.message} numberOfLines={2}>{message}</Text>
        )}
      </View>

      <TouchableOpacity
        onPress={dismiss}
        style={styles.closeBtn}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Text style={[styles.closeText, { color: cfg.accent }]}>✕</Text>
      </TouchableOpacity>

      <Animated.View
        style={[styles.progressBar, { width: progressWidth, backgroundColor: cfg.barColor }]}
      />
    </Animated.View>
  );
};

// ─── Provider (Option A — recommended) ───────────────────────────────────────
const ToastContext = React.createContext(null);

export const AlertToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((type, title, message = '') => {
    const id = Date.now().toString();
    setToasts(prev => [{ id, type, title, message }, ...prev].slice(0, 3));
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <View style={styles.container} pointerEvents="box-none">
        {toasts.map(t => (
          <ToastItem key={t.id} {...t} onDismiss={removeToast} />
        ))}
      </View>
    </ToastContext.Provider>
  );
};

export const useAlertToast = () => {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error('useAlertToast must be used inside <AlertToastProvider>');
  return ctx;
};

// ─── Imperative (Option B) ────────────────────────────────────────────────────
let _show = null;

export const AlertToastContainer = () => {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((type, title, message = '') => {
    const id = Date.now().toString();
    setToasts(prev => [{ id, type, title, message }, ...prev].slice(0, 3));
  }, []);
  const remove = useCallback((id) => setToasts(prev => prev.filter(t => t.id !== id)), []);
  _show = show;
  return (
    <View style={styles.container} pointerEvents="box-none">
      {toasts.map(t => <ToastItem key={t.id} {...t} onDismiss={remove} />)}
    </View>
  );
};

export const showToast = (type, title, message = '') => _show && _show(type, title, message);

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    position:  'absolute',
    top:       Platform.OS === 'ios' ? 56 : 40,
    left:      16,
    right:     16,
    zIndex:    9999,
    elevation: 20,
    gap:       10,
  },
  toast: {
    flexDirection:    'row',
    alignItems:       'flex-start',
    borderRadius:     14,
    borderWidth:      1,
    borderColor:      'rgba(0,0,0,0.07)',
    borderLeftWidth:  3,
    paddingHorizontal: 14,
    paddingVertical:   13,
    overflow:         'hidden',
  },
  iconWrap: {
    width:          34,
    height:         34,
    borderRadius:   10,
    alignItems:     'center',
    justifyContent: 'center',
    marginRight:    11,
    flexShrink:     0,
  },
  iconText: {
    fontSize:   16,
    fontWeight: '700',
  },
  body: {
    flex: 1,
  },
  title: {
    fontSize:    14,
    fontWeight:  '600',
    marginBottom: 2,
  },
  message: {
    fontSize:   13,
    color:      COLORS.MSG,
    lineHeight: 18,
  },
  closeBtn: {
    paddingLeft:  8,
    alignSelf:    'flex-start',
    marginTop:    1,
  },
  closeText: {
    fontSize: 13,
    opacity:  0.6,
  },
  progressBar: {
    position:     'absolute',
    bottom:       0,
    left:         3,
    height:       2,
    borderRadius: 1,
  },
});