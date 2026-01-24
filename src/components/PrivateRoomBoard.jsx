import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Modal, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

const PrivateRoomBoard = ({ matchedPlayers = [], user, maxPlayers = 4, friends = [], onInviteFriend }) => {
  const meId = user?._id;
  const opponents = matchedPlayers.filter(p => p.userId !== meId);

  const [modalVisible, setModalVisible] = useState(false);

  // Build slots array
  const slots = [];
  for (let i = 0; i < maxPlayers - 1; i++) {
    slots.push(opponents[i] || null); // null = empty slot
  }
  slots.push(user); // bottom slot is me

  // Position presets
  const positions = [
    { top: '10%', left: '15%' },
    { top: '10%', right: '15%' },
    { bottom: '10%', right: '15%' },
    { bottom: '10%', left: '15%' },
  ];

  return (
    <View style={styles.boardContainer}>
      <ImageBackground
        source={require('../images/RegisterPage.png')}
        style={styles.boardBg}
      >
        {slots.map((player, index) => {
          const isBottom = index === slots.length - 1;
          const posStyle = positions[index] || { top: '50%', left: '50%' };

          return (
            <View key={index} style={[styles.playerSlot, posStyle]}>
              {player ? (
                <>
                  <View style={styles.avatarWrap}>
                    <Text style={styles.avatarText}>{player.avatar || '🐟'}</Text>
                  </View>
                  <Text style={styles.playerName}>
                    {isBottom ? 'Me' : player.username}
                  </Text>
                </>
              ) : (
                <View style={{ alignItems: 'center' }}>
                  <TouchableOpacity
                    style={styles.avatarWrap}
                    onPress={() => setModalVisible(true)}
                  >
                    <Icon name="users" size={28} color="#FFD36E" />
                  </TouchableOpacity>
                  <Text style={styles.playerName}>Invite</Text>
                </View>
              )}
            </View>
          );
        })}
      </ImageBackground>

      {/* Friends Invite Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Invite Friends</Text>
            <FlatList
              data={friends}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.friendItem}
                  onPress={() => {
                    onInviteFriend(item);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.friendText}>{item.username}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={{ color: '#fff' }}>No friends found</Text>}
            />
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  boardContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  boardBg: {
    width: 350,
    height: 350,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerSlot: {
    position: 'absolute',
    alignItems: 'center',
  },
  avatarWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: '#FFD36E',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    marginBottom: 5,
  },
  avatarText: {
    fontSize: 28,
  },
  playerName: {
    color: '#FFD36E',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '60%',
    backgroundColor: '#1B1B3A',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD36E',
    marginBottom: 10,
    textAlign: 'center',
  },
  friendItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FFD36E',
  },
  friendText: {
    color: '#fff',
    fontSize: 18,
  },
  closeBtn: {
    marginTop: 10,
    alignSelf: 'center',
    paddingHorizontal: 30,
    paddingVertical: 10,
    backgroundColor: '#FFD36E',
    borderRadius: 20,
  },
  closeText: {
    fontWeight: 'bold',
  },
});

export default PrivateRoomBoard;
