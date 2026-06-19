import React, { useState } from 'react';
import {
    View, Text, TextInput, TouchableOpacity,
    Modal, StyleSheet, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from '../config/backend';
import { showAlert2 } from './CustomAlert2';

const QUICK_AMOUNTS = [10, 50, 100, 250, 500, 1000];

const GiftModal = ({ visible, onClose, chatId, receiverId, receiverName, myCoins, onSuccess }) => {
    const [amount, setAmount]   = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    const selectedAmount = parseInt(amount, 10) || 0;
    const canSend = selectedAmount >= 10 && selectedAmount <= myCoins;

    const handleSend = async () => {
        if (!canSend) return;
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('authToken');
            const res = await fetch(`${BACKEND_URL}/api/gifts/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'auth-token': token },
                body: JSON.stringify({ receiverId, chatId, amount: selectedAmount, message }),
            });
            const json = await res.json();
            if (!res.ok) {
                showAlert2({ type: 'error', title: json.message || 'Gift failed' });
                return;
            }
            showAlert2({ type: 'success', title: `🎁 Sent ${selectedAmount} coins to ${receiverName}!` });
            onSuccess(json.newBalance); // update parent's coin display
            setAmount('');
            setMessage('');
            onClose();
        } catch (e) {
            console.log('Gift error:', e);
            showAlert2({ type: 'error', title: 'Something went wrong' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <View style={g.overlay}>
                <View style={g.sheet}>
                    <Text style={g.title}>🎁 Send a gift</Text>
                    <Text style={g.sub}>To: {receiverName}</Text>

                    {/* Quick-pick amounts */}
                    <Text style={g.label}>Choose amount</Text>
                    <View style={g.quickRow}>
                        {QUICK_AMOUNTS.map(q => (
                            <TouchableOpacity
                                key={q}
                                style={[g.chip, amount == q && g.chipOn,
                                        myCoins < q && g.chipDisabled]}
                                onPress={() => setAmount(String(q))}
                                disabled={myCoins < q}
                            >
                                <Text style={[g.chipTxt, amount == q && g.chipTxtOn,
                                              myCoins < q && g.chipTxtDisabled]}>
                                    🪙 {q}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Manual input */}
                    <TextInput
                        style={g.input}
                        keyboardType="numeric"
                        placeholder="Or type custom amount…"
                        placeholderTextColor="rgba(255,255,255,0.35)"
                        value={amount}
                        onChangeText={setAmount}
                        maxLength={5}
                    />

                    {/* Your balance */}
                    <Text style={g.balance}>
                        Your balance: 🪙 {myCoins}
                        {selectedAmount > 0 && ` → 🪙 ${myCoins - selectedAmount}`}
                    </Text>

                    {/* Message */}
                    <Text style={g.label}>Message (optional)</Text>
                    <TextInput
                        style={[g.input, { height: 72, textAlignVertical: 'top' }]}
                        placeholder="Add a message…"
                        placeholderTextColor="rgba(255,255,255,0.35)"
                        value={message}
                        onChangeText={setMessage}
                        maxLength={100}
                        multiline
                    />

                    {/* Validation feedback */}
                    {selectedAmount > 0 && selectedAmount < 10 && (
                        <Text style={g.warn}>Minimum gift is 10 coins</Text>
                    )}
                    {selectedAmount > myCoins && (
                        <Text style={g.warn}>Not enough coins</Text>
                    )}

                    <View style={g.btnRow}>
                        <TouchableOpacity style={g.cancelBtn} onPress={onClose}>
                            <Text style={g.cancelTxt}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[g.sendBtn, !canSend && g.sendBtnOff]}
                            onPress={() => showAlert2({
                                type: 'confirm',
                                title: `Send ${selectedAmount} coins to ${receiverName}?`,
                                message: message || 'No message',
                                onConfirm: handleSend,
                            })}
                            disabled={!canSend || loading}
                        >
                            {loading
                                ? <ActivityIndicator size="small" color="#3A1A00" />
                                : <Text style={g.sendTxt}>Send 🎁</Text>
                            }
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default GiftModal;

const GOLD = '#FFD67A';
const g = StyleSheet.create({
    overlay:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
    sheet:    { backgroundColor: '#1a0a3a', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
    title:    { color: '#fff', fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
    sub:      { color: 'rgba(255,255,255,0.5)', fontSize: 13, textAlign: 'center', marginBottom: 20 },
    label:    { color: 'rgba(255,255,255,0.6)', fontSize: 12, marginBottom: 8, marginTop: 14 },
    quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
    chip:     { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,214,122,0.4)', backgroundColor: 'rgba(255,255,255,0.08)' },
    chipOn:   { backgroundColor: GOLD, borderColor: GOLD },
    chipDisabled: { opacity: 0.3 },
    chipTxt:  { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
    chipTxtOn:{ color: '#3A1A00', fontWeight: '700' },
    chipTxtDisabled: { color: 'rgba(255,255,255,0.3)' },
    input:    { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, borderWidth: 1, borderColor: 'rgba(255,214,122,0.3)', paddingHorizontal: 14, paddingVertical: 10, color: '#fff', fontSize: 15, marginBottom: 4 },
    balance:  { color: GOLD, fontSize: 12, marginBottom: 4 },
    warn:     { color: '#ff6b6b', fontSize: 12, marginBottom: 4 },
    btnRow:   { flexDirection: 'row', gap: 12, marginTop: 20 },
    cancelBtn:{ flex: 1, paddingVertical: 12, borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', alignItems: 'center' },
    cancelTxt:{ color: 'rgba(255,255,255,0.6)', fontSize: 15 },
    sendBtn:  { flex: 2, paddingVertical: 12, borderRadius: 14, backgroundColor: GOLD, alignItems: 'center' },
    sendBtnOff:{ opacity: 0.4 },
    sendTxt:  { color: '#3A1A00', fontWeight: '700', fontSize: 15 },
});