/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    Modal, Animated, ActivityIndicator, Image, Share,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../config/backend';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { showAlert2 } from './CustomAlert2';

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
    GLASS: 'rgba(15,35,5,0.78)',
    GLASS_BORDER: 'rgba(255,255,255,0.10)',
    INK: '#F0EDD8',
    INK_MED: '#C8C4A0',
    INK_LIGHT: '#8A9070',
    GOLD: '#E8920A',
    GOLD_LIGHT: '#FDE68A',
    GOLD_BG: 'rgba(232,146,10,0.18)',
    SUCCESS: '#10B981',
    SUCCESS_BG: 'rgba(16,185,129,0.12)',
    DANGER: '#F87171',
    DIV: 'rgba(255,255,255,0.08)',
};

// ─── Receipt Item (for list) ──────────────────────────────────────────────────
export function ReceiptCard({ receipt, onPress }) {
    const statusColor = {
        completed: T.SUCCESS,
        pending: T.GOLD,
        failed: T.DANGER,
    }[receipt.status];

    const statusIcon = {
        completed: '✅',
        pending: '⏳',
        failed: '❌',
    }[receipt.status];

    const formattedDate = new Date(receipt.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });

    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={styles.receiptCard}
        >
            <View style={styles.receiptCardLeft}>
                <Text style={styles.receiptStatusIcon}>{statusIcon}</Text>
                <View style={styles.receiptCardContent}>
                    <Text style={styles.receiptItemName}>{receipt.itemName}</Text>
                    <Text style={styles.receiptDate}>{formattedDate}</Text>
                </View>
            </View>
            <View style={styles.receiptCardRight}>
                <Text style={styles.receiptAmount}>₹{receipt.amount}</Text>
                <Text style={[styles.receiptStatus, { color: statusColor }]}>
                    {receipt.status.charAt(0).toUpperCase() + receipt.status.slice(1)}
                </Text>
            </View>
        </TouchableOpacity>
    );
}

// ─── Receipt Detail Modal ─────────────────────────────────────────────────────
export function ReceiptModal({ visible, receipt, onClose }) {
    const slideAnim = useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        if (visible) {
            Animated.spring(slideAnim, {
                toValue: 1,
                useNativeDriver: true,
                damping: 20,
                stiffness: 220,
            }).start();
        } else {
            Animated.timing(slideAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [visible]);

    if (!receipt) return null;

    const formattedDate = new Date(receipt.createdAt).toLocaleDateString('en-IN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    const formattedTime = new Date(receipt.createdAt).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

    const statusColor = {
        completed: T.SUCCESS,
        pending: T.GOLD,
        failed: T.DANGER,
    }[receipt.status];

    const statusIcon = {
        completed: '✅',
        pending: '⏳',
        failed: '❌',
    }[receipt.status];

    const handleShare = async () => {
        try {
            await Share.share({
                message: `BingoBing Transaction Receipt\n\nItem: ${receipt.itemName}\nAmount: ₹${receipt.amount}\nStatus: ${receipt.status}\nOrder ID: ${receipt.razorpayOrderId}\nDate: ${formattedDate}`,
                title: 'Transaction Receipt',
            });
        } catch (error) {
            console.error('Share error:', error);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="none">
            <View style={styles.receiptOverlay}>
                <Animated.View
                    style={[
                        styles.receiptSheet,
                        {
                            transform: [
                                {
                                    translateY: slideAnim.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: [500, 0],
                                    }),
                                },
                            ],
                            opacity: slideAnim,
                        },
                    ]}
                >
                    {/* Handle */}
                    <View style={styles.modalHandle} />

                    {/* Receipt Header */}
                    <View style={styles.receiptHeader}>
                        <Text style={styles.receiptTitle}>Transaction Receipt</Text>
                        <Text style={[styles.receiptStatus, { color: statusColor, fontSize: 14 }]}>
                            {statusIcon} {receipt.status.toUpperCase()}
                        </Text>
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.receiptContent}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Status Banner */}
                        <View
                            style={[
                                styles.statusBanner,
                                {
                                    backgroundColor:
                                        receipt.status === 'completed'
                                            ? T.SUCCESS_BG
                                            : receipt.status === 'failed'
                                            ? 'rgba(248,113,113,0.12)'
                                            : T.GOLD_BG,
                                },
                            ]}
                        >
                            <Text style={styles.statusBannerText}>
                                {receipt.status === 'completed'
                                    ? '✅ Payment Successful'
                                    : receipt.status === 'failed'
                                    ? '❌ Payment Failed'
                                    : '⏳ Payment Pending'}
                            </Text>
                        </View>

                        {/* Item Details */}
                        <View style={styles.receiptSection}>
                            <Text style={styles.receiptSectionLabel}>Item Details</Text>
                            <View style={styles.receiptDetail}>
                                <Text style={styles.receiptDetailLabel}>Item Name</Text>
                                <Text style={styles.receiptDetailValue}>{receipt.itemName}</Text>
                            </View>
                            <View style={[styles.receiptDetail, styles.receiptDetailLast]}>
                                <Text style={styles.receiptDetailLabel}>Item ID</Text>
                                <Text style={styles.receiptDetailValue}>#{receipt.itemId}</Text>
                            </View>
                        </View>

                        {/* Payment Details */}
                        <View style={styles.receiptSection}>
                            <Text style={styles.receiptSectionLabel}>Payment Details</Text>
                            <View style={styles.receiptDetail}>
                                <Text style={styles.receiptDetailLabel}>Amount</Text>
                                <Text style={[styles.receiptDetailValue, { color: T.GOLD, fontSize: 18, fontWeight: '800' }]}>
                                    ₹{receipt.amount}
                                </Text>
                            </View>
                            <View style={styles.receiptDetail}>
                                <Text style={styles.receiptDetailLabel}>Currency</Text>
                                <Text style={styles.receiptDetailValue}>{receipt.currency || 'INR'}</Text>
                            </View>
                            <View style={[styles.receiptDetail, styles.receiptDetailLast]}>
                                <Text style={styles.receiptDetailLabel}>Payment Method</Text>
                                <Text style={styles.receiptDetailValue}>💳 Razorpay</Text>
                            </View>
                        </View>

                        {/* Transaction IDs */}
                        <View style={styles.receiptSection}>
                            <Text style={styles.receiptSectionLabel}>Transaction IDs</Text>
                            <View style={styles.receiptDetail}>
                                <Text style={styles.receiptDetailLabel}>Order ID</Text>
                                <Text style={[styles.receiptDetailValue, styles.monoText]}>
                                    {receipt.razorpayOrderId}
                                </Text>
                            </View>
                            {receipt.paymentId && (
                                <View style={styles.receiptDetail}>
                                    <Text style={styles.receiptDetailLabel}>Payment ID</Text>
                                    <Text style={[styles.receiptDetailValue, styles.monoText]}>
                                        {receipt.paymentId}
                                    </Text>
                                </View>
                            )}
                            {receipt.signature && (
                                <View style={[styles.receiptDetail, styles.receiptDetailLast]}>
                                    <Text style={styles.receiptDetailLabel}>Signature</Text>
                                    <Text style={[styles.receiptDetailValue, styles.monoText]}>
                                        {receipt.signature.slice(0, 20)}...
                                    </Text>
                                </View>
                            )}
                        </View>

                        {/* Date & Time */}
                        <View style={styles.receiptSection}>
                            <Text style={styles.receiptSectionLabel}>Date & Time</Text>
                            <View style={styles.receiptDetail}>
                                <Text style={styles.receiptDetailLabel}>Date</Text>
                                <Text style={styles.receiptDetailValue}>{formattedDate}</Text>
                            </View>
                            <View style={[styles.receiptDetail, styles.receiptDetailLast]}>
                                <Text style={styles.receiptDetailLabel}>Time</Text>
                                <Text style={styles.receiptDetailValue}>{formattedTime}</Text>
                            </View>
                        </View>

                        {/* Status Info */}
                        {receipt.status === 'failed' && receipt.reason && (
                            <View style={styles.receiptSection}>
                                <Text style={styles.receiptSectionLabel}>Error Details</Text>
                                <View style={[styles.receiptDetail, styles.receiptDetailLast, styles.errorDetail]}>
                                    <Text style={styles.errorDetailText}>{receipt.reason}</Text>
                                </View>
                            </View>
                        )}

                        {receipt.status === 'completed' && (
                            <View style={styles.receiptSection}>
                                <Text style={styles.receiptSectionLabel}>Reward Info</Text>
                                <View style={[styles.receiptDetail, styles.receiptDetailLast]}>
                                    <Text style={styles.receiptDetailLabel}>Completed At</Text>
                                    <Text style={styles.receiptDetailValue}>
                                        {receipt.completedAt
                                            ? new Date(receipt.completedAt).toLocaleString('en-IN')
                                            : '—'}
                                    </Text>
                                </View>
                            </View>
                        )}

                        <View style={{ height: 20 }} />
                    </ScrollView>

                    {/* Actions */}
                    <View style={styles.receiptActions}>
                        <TouchableOpacity
                            style={styles.receiptActionBtn}
                            onPress={handleShare}
                        >
                            <Icon name="share-alt" size={14} color={T.GOLD} />
                            <Text style={styles.receiptActionBtnText}>Share</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.receiptActionBtn, styles.receiptActionBtnPrimary]}
                            onPress={onClose}
                        >
                            <Text style={styles.receiptActionBtnTextPrimary}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </View>
        </Modal>
    );
}

// ─── Receipts Screen (for profile) ────────────────────────────────────────────
export default function Receipts() {
    const [receipts, setReceipts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReceipt, setSelectedReceipt] = useState(null);
    const [receiptModalVisible, setReceiptModalVisible] = useState(false);

    React.useEffect(() => {
        loadReceipts();
    }, []);

    const loadReceipts = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('authToken');
            const res = await fetch(`${BACKEND_URL}/api/payments/history`, {
                method: 'GET',
                headers: { 'auth-token': token },
            });

            if (!res.ok) {
                showAlert2({ type: 'error', title: 'Failed to load receipts' });
                setLoading(false);
                return;
            }

            const data = await res.json();
            setReceipts(data.payments || []);
        } catch (error) {
            console.error('Load receipts error:', error);
            showAlert2({ type: 'error', title: 'Failed to load receipts' });
        } finally {
            setLoading(false);
        }
    };

    const openReceipt = (receipt) => {
        setSelectedReceipt(receipt);
        setReceiptModalVisible(true);
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={T.GOLD} />
                <Text style={styles.loadingText}>Loading receipts...</Text>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>Transaction History</Text>

                {receipts.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>💳</Text>
                        <Text style={styles.emptyTitle}>No transactions yet</Text>
                        <Text style={styles.emptySubtitle}>Your purchase history will appear here</Text>
                    </View>
                ) : (
                    <View style={styles.receiptsList}>
                        {receipts.map((receipt, index) => (
                            <ReceiptCard
                                key={receipt._id || index}
                                receipt={receipt}
                                onPress={() => openReceipt(receipt)}
                            />
                        ))}
                    </View>
                )}
            </ScrollView>

            <ReceiptModal
                visible={receiptModalVisible}
                receipt={selectedReceipt}
                onClose={() => setReceiptModalVisible(false)}
            />
        </SafeAreaView>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a1a08',
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingVertical: 20,
        paddingBottom: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: T.INK,
        marginBottom: 20,
    },

    // ── Receipt Card ──
    receiptCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: T.GLASS,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: T.GLASS_BORDER,
        paddingHorizontal: 14,
        paddingVertical: 12,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    receiptCardLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        flex: 1,
    },
    receiptStatusIcon: {
        fontSize: 24,
    },
    receiptCardContent: {
        flex: 1,
    },
    receiptItemName: {
        color: T.INK,
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
    },
    receiptDate: {
        color: T.INK_LIGHT,
        fontSize: 12,
    },
    receiptCardRight: {
        alignItems: 'flex-end',
        gap: 3,
    },
    receiptAmount: {
        color: T.GOLD,
        fontSize: 16,
        fontWeight: '800',
    },
    receiptStatus: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'capitalize',
    },

    // ── Receipt Modal ──
    receiptOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'flex-end',
    },
    receiptSheet: {
        backgroundColor: 'rgba(18,40,8,0.97)',
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        borderTopWidth: 1,
        borderColor: T.GLASS_BORDER,
        maxHeight: '90%',
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 20,
    },
    modalHandle: {
        width: 40,
        height: 4,
        backgroundColor: '#ccc',
        borderRadius: 2,
        alignSelf: 'center',
        marginBottom: 12,
    },
    receiptHeader: {
        alignItems: 'center',
        marginBottom: 16,
    },
    receiptTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: T.INK,
        marginBottom: 4,
    },
    receiptContent: {
        paddingBottom: 16,
    },

    // ── Status Banner ──
    statusBanner: {
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    statusBannerText: {
        color: T.INK,
        fontSize: 14,
        fontWeight: '700',
        textAlign: 'center',
    },

    // ── Receipt Section ──
    receiptSection: {
        marginBottom: 20,
    },
    receiptSectionLabel: {
        color: T.LABEL,
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        marginBottom: 8,
        marginLeft: 4,
    },
    receiptDetail: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.08)',
    },
    receiptDetailLast: {
        borderBottomWidth: 0,
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 10,
    },
    receiptDetailLabel: {
        color: T.INK_LIGHT,
        fontSize: 13,
        fontWeight: '600',
        flex: 1,
    },
    receiptDetailValue: {
        color: T.INK,
        fontSize: 14,
        fontWeight: '600',
        flex: 1,
        textAlign: 'right',
        flexShrink: 1,
    },
    monoText: {
        fontFamily: 'Menlo',
        fontSize: 11,
        letterSpacing: 0.3,
    },

    // ── Error Detail ──
    errorDetail: {
        backgroundColor: 'rgba(248,113,113,0.10)',
        paddingVertical: 12,
    },
    errorDetailText: {
        color: T.DANGER,
        fontSize: 13,
        fontWeight: '600',
        lineHeight: 18,
    },

    // ── Actions ──
    receiptActions: {
        flexDirection: 'row',
        gap: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.10)',
    },
    receiptActionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: T.GOLD,
    },
    receiptActionBtnText: {
        color: T.GOLD,
        fontSize: 14,
        fontWeight: '700',
    },
    receiptActionBtnPrimary: {
        flex: 1.5,
        backgroundColor: T.GOLD,
        borderColor: T.GOLD,
    },
    receiptActionBtnTextPrimary: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },

    // ── Empty State ──
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        paddingHorizontal: 20,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    emptyTitle: {
        color: T.INK,
        fontSize: 18,
        fontWeight: '700',
        marginBottom: 6,
    },
    emptySubtitle: {
        color: T.INK_LIGHT,
        fontSize: 14,
        textAlign: 'center',
    },

    // ── Loading ──
    loadingContainer: {
        flex: 1,
        backgroundColor: '#0a1a08',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: T.INK,
        fontSize: 14,
        marginTop: 12,
    },

    receiptsList: {
        gap: 0,
    },
});