/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity,
    ScrollView, ActivityIndicator, ImageBackground, Animated,
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
    DANGER_BG: 'rgba(248,113,113,0.12)',
    WARNING: '#F59E0B',
    WARNING_BG: 'rgba(245,158,11,0.12)',
    DIV: 'rgba(255,255,255,0.08)',
};

// ─── Stat Card Component ──────────────────────────────────────────────────────
function StatCard({ icon, label, value, subtext, color, bgColor }) {
    const fadeIn = useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.timing(fadeIn, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <Animated.View style={{ opacity: fadeIn, flex: 1 }}>
            <View style={[styles.statCard, { backgroundColor: bgColor }]}>
                <View style={styles.statIconWrap}>
                    <Text style={styles.statIcon}>{icon}</Text>
                </View>
                <Text style={styles.statLabel}>{label}</Text>
                <Text style={[styles.statValue, { color }]}>{value}</Text>
                {subtext && <Text style={styles.statSubtext}>{subtext}</Text>}
            </View>
        </Animated.View>
    );
}

// ─── Item Breakdown Row ───────────────────────────────────────────────────────
function ItemBreakdownRow({ itemName, count, amount }) {
    const percentage = (count / 100) * 100; // Assuming max 100 for demo

    return (
        <View style={styles.breakdownRow}>
            <View style={styles.breakdownInfo}>
                <Text style={styles.breakdownItemName}>{itemName}</Text>
                <View style={styles.breakdownMeta}>
                    <Text style={styles.breakdownCount}>{count}x</Text>
                    <Text style={styles.breakdownAmount}>₹{amount}</Text>
                </View>
            </View>
            <View style={styles.breakdownBar}>
                <View
                    style={[
                        styles.breakdownBarFill,
                        { width: `${Math.min(percentage, 100)}%` },
                    ]}
                />
            </View>
        </View>
    );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status, count }) {
    const statusConfig = {
        completed: { icon: '✅', color: T.SUCCESS, label: 'Completed' },
        pending: { icon: '⏳', color: T.WARNING, label: 'Pending' },
        failed: { icon: '❌', color: T.DANGER, label: 'Failed' },
    };

    const config = statusConfig[status] || { icon: '❓', color: '#999', label: 'Unknown' };

    return (
        <View style={styles.statusBadgeWrap}>
            <Text style={styles.statusBadgeIcon}>{config.icon}</Text>
            <View style={{ flex: 1 }}>
                <Text style={styles.statusBadgeLabel}>{config.label}</Text>
                <Text style={[styles.statusBadgeCount, { color: config.color }]}>
                    {count} transaction{count !== 1 ? 's' : ''}
                </Text>
            </View>
        </View>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PaymentStats() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('all'); // all, month, week

    React.useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('authToken');
            const res = await fetch(`${BACKEND_URL}/api/payments/stats/summary`, {
                method: 'GET',
                headers: { 'auth-token': token },
            });

            if (!res.ok) {
                showAlert2({ type: 'error', title: 'Failed to load statistics' });
                setLoading(false);
                return;
            }

            const data = await res.json();
            setStats(data.stats);
        } catch (error) {
            console.error('Load stats error:', error);
            showAlert2({ type: 'error', title: 'Failed to load statistics' });
        } finally {
            setLoading(false);
        }
    };

    // Calculate item totals
    const itemsWithTotals = stats
        ? Object.entries(stats.itemsCounts).map(([itemName, count]) => {
            // Estimate amount based on known items
            const itemRewards = {
                'Coin Pack': { price: 49, reward: 500 },
                'Mega Coins': { price: 149, reward: 2000 },
                'Double XP': { price: 129, reward: 50 },
                'Free Boards': { price: 299, reward: 1 },
            };

            const itemInfo = itemRewards[itemName] || { price: 99, reward: 0 };
            const totalAmount = itemInfo.price * count;

            return {
                name: itemName,
                count,
                amount: totalAmount,
            };
        })
        : [];

    // Sort by count descending
    itemsWithTotals.sort((a, b) => b.count - a.count);

    const averageTransaction = stats && stats.totalTransactions > 0
        ? Math.round(stats.totalSpent / stats.totalTransactions)
        : 0;

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={T.GOLD} />
                <Text style={styles.loadingText}>Loading statistics...</Text>
            </SafeAreaView>
        );
    }

    if (!stats) {
        return (
            <SafeAreaView style={styles.errorContainer}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={styles.errorTitle}>Failed to load statistics</Text>
                <Text style={styles.errorSubtitle}>Please try again later</Text>
                <TouchableOpacity
                    style={styles.retryBtn}
                    onPress={loadStats}
                >
                    <Text style={styles.retryBtnText}>Retry</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <ImageBackground
            source={require('../images/message_bg.png')}
            style={styles.bg}
            resizeMode="cover"
        >
            <View style={styles.bgTint} />

            <SafeAreaView style={styles.safe}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* ── Header ── */}
                    <View style={styles.header}>
                        <View style={{ width: 36 }} />
                        <Text style={styles.headerTitle}>Payment Stats</Text>
                        <TouchableOpacity
                            onPress={loadStats}
                            style={styles.refreshBtn}
                        >
                            <Icon name="sync" size={16} color={T.INK} />
                        </TouchableOpacity>
                    </View>

                    {/* ── Summary Cards ── */}
                    <View style={styles.statsGrid}>
                        <StatCard
                            icon="💳"
                            label="Total Spent"
                            value={`₹${stats.totalSpent}`}
                            color={T.GOLD}
                            bgColor={T.GOLD_BG}
                        />
                        <StatCard
                            icon="🎯"
                            label="Transactions"
                            value={stats.totalTransactions}
                            subtext={`Avg: ₹${averageTransaction}`}
                            color={T.INK}
                            bgColor="rgba(255,255,255,0.08)"
                        />
                    </View>

                    <View style={styles.statsGrid}>
                        <StatCard
                            icon="✅"
                            label="Completed"
                            value={stats.completedTransactions}
                            color={T.SUCCESS}
                            bgColor={T.SUCCESS_BG}
                        />
                        <StatCard
                            icon="⚠️"
                            label="Failed"
                            value={stats.failedTransactions}
                            color={T.DANGER}
                            bgColor={T.DANGER_BG}
                        />
                    </View>

                    {stats.pendingTransactions > 0 && (
                        <View style={styles.statsGrid}>
                            <StatCard
                                icon="⏳"
                                label="Pending"
                                value={stats.pendingTransactions}
                                color={T.WARNING}
                                bgColor={T.WARNING_BG}
                            />
                        </View>
                    )}

                    {/* ── Transaction Status Overview ── */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Transaction Status</Text>
                        <View style={styles.card}>
                            <StatusBadge
                                status="completed"
                                count={stats.completedTransactions}
                            />
                            {stats.pendingTransactions > 0 && (
                                <>
                                    <View style={styles.divider} />
                                    <StatusBadge
                                        status="pending"
                                        count={stats.pendingTransactions}
                                    />
                                </>
                            )}
                            {stats.failedTransactions > 0 && (
                                <>
                                    <View style={styles.divider} />
                                    <StatusBadge
                                        status="failed"
                                        count={stats.failedTransactions}
                                    />
                                </>
                            )}
                        </View>
                    </View>

                    {/* ── Items Breakdown ── */}
                    {itemsWithTotals.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Items Purchased</Text>
                            <View style={styles.card}>
                                {itemsWithTotals.map((item, index) => (
                                    <View key={item.name}>
                                        <ItemBreakdownRow
                                            itemName={item.name}
                                            count={item.count}
                                            amount={item.amount}
                                        />
                                        {index < itemsWithTotals.length - 1 && (
                                            <View style={styles.divider} />
                                        )}
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* ── Insights ── */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Insights</Text>
                        <View style={styles.card}>
                            <InsightRow
                                icon="🏆"
                                label="Most Purchased"
                                value={
                                    itemsWithTotals.length > 0
                                        ? itemsWithTotals[0].name
                                        : 'N/A'
                                }
                            />
                            <View style={styles.divider} />
                            <InsightRow
                                icon="📊"
                                label="Average Per Transaction"
                                value={`₹${averageTransaction}`}
                            />
                            <View style={styles.divider} />
                            <InsightRow
                                icon="📈"
                                label="Success Rate"
                                value={
                                    stats.totalTransactions > 0
                                        ? `${Math.round(
                                            (stats.completedTransactions /
                                                stats.totalTransactions) *
                                            100
                                        )}%`
                                        : 'N/A'
                                }
                            />
                        </View>
                    </View>

                    {/* ── Action Buttons ── */}
                    <View style={styles.actions}>
                        <TouchableOpacity style={styles.actionBtn}>
                            <Icon name="download" size={14} color={T.GOLD} />
                            <Text style={styles.actionBtnText}>Export CSV</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionBtn}>
                            <Icon name="receipt" size={14} color={T.GOLD} />
                            <Text style={styles.actionBtnText}>View Receipts</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{ height: 40 }} />
                </ScrollView>
            </SafeAreaView>
        </ImageBackground>
    );
}

// ─── Insight Row Component ────────────────────────────────────────────────────
function InsightRow({ icon, label, value }) {
    return (
        <View style={styles.insightRow}>
            <View style={styles.insightLeft}>
                <Text style={styles.insightIcon}>{icon}</Text>
                <Text style={styles.insightLabel}>{label}</Text>
            </View>
            <Text style={styles.insightValue}>{value}</Text>
        </View>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    bg: { flex: 1 },
    bgTint: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(5,18,2,0.84)',
    },
    safe: { flex: 1 },

    scrollContent: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        paddingBottom: 40,
    },

    // ── Header ──
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 4,
        marginBottom: 8,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: T.INK,
        letterSpacing: 0.3,
    },
    refreshBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.10)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },

    // ── Stats Grid ──
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 12,
    },
    statCard: {
        flex: 1,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: T.GLASS_BORDER,
        padding: 16,
        alignItems: 'center',
        gap: 6,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
    statIconWrap: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.10)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 4,
    },
    statIcon: {
        fontSize: 20,
    },
    statLabel: {
        color: T.INK_LIGHT,
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    statValue: {
        fontSize: 22,
        fontWeight: '800',
        letterSpacing: 0.3,
    },
    statSubtext: {
        color: T.INK_LIGHT,
        fontSize: 11,
        marginTop: 2,
    },

    // ── Section ──
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        color: T.LABEL,
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 10,
        marginLeft: 2,
    },
    card: {
        backgroundColor: T.GLASS,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: T.GLASS_BORDER,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },

    // ── Status Badge ──
    statusBadgeWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        gap: 12,
    },
    statusBadgeIcon: {
        fontSize: 20,
    },
    statusBadgeLabel: {
        color: T.INK,
        fontSize: 13,
        fontWeight: '600',
    },
    statusBadgeCount: {
        fontSize: 12,
        fontWeight: '600',
        marginTop: 2,
    },

    // ── Breakdown Row ──
    breakdownRow: {
        paddingHorizontal: 14,
        paddingVertical: 12,
        gap: 10,
    },
    breakdownInfo: {
        marginBottom: 6,
    },
    breakdownItemName: {
        color: T.INK,
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    breakdownMeta: {
        flexDirection: 'row',
        gap: 12,
    },
    breakdownCount: {
        color: T.INK_LIGHT,
        fontSize: 12,
        fontWeight: '600',
    },
    breakdownAmount: {
        color: T.GOLD,
        fontSize: 12,
        fontWeight: '700',
    },
    breakdownBar: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.10)',
        borderRadius: 3,
        overflow: 'hidden',
    },
    breakdownBarFill: {
        height: '100%',
        backgroundColor: T.GOLD,
        borderRadius: 3,
    },

    // ── Divider ──
    divider: {
        height: 1,
        backgroundColor: T.DIV,
        marginHorizontal: 14,
    },

    // ── Insight Row ──
    insightRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    insightLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        flex: 1,
    },
    insightIcon: {
        fontSize: 18,
    },
    insightLabel: {
        color: T.INK_MED,
        fontSize: 13,
        fontWeight: '600',
    },
    insightValue: {
        color: T.GOLD,
        fontSize: 14,
        fontWeight: '800',
    },

    // ── Actions ──
    actions: {
        flexDirection: 'row',
        gap: 10,
    },
    actionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: T.GOLD,
        backgroundColor: T.GOLD_BG,
    },
    actionBtnText: {
        color: T.GOLD,
        fontSize: 13,
        fontWeight: '700',
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

    // ── Error ──
    errorContainer: {
        flex: 1,
        backgroundColor: '#0a1a08',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 30,
    },
    errorIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    errorTitle: {
        color: T.INK,
        fontSize: 18,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: 8,
    },
    errorSubtitle: {
        color: T.INK_LIGHT,
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
    },
    retryBtn: {
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 10,
        backgroundColor: T.GOLD,
        alignSelf: 'center',
    },
    retryBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '700',
    },
});