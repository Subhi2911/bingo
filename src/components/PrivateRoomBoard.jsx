import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  TouchableOpacity,
  Modal,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';

const PrivateRoomBoard = ({
  matchedPlayers = [],
  user,
  maxPlayers = 4,
  friends = [],
  onInviteFriend,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const meId = user?._id;

  // Remove myself from matched players
  const opponents = useMemo(
    () => matchedPlayers.filter(p => p?.userId !== meId),
    [matchedPlayers, meId]
  );

  // Build board slots (maxPlayers - 1 opponents + me)
  const slots = useMemo(() => {
    const temp = [];

    for (let i = 0; i < maxPlayers - 1; i++) {
      temp.push(opponents[i] || null);
    }

    // Last slot is always me
    temp.push(user || null);

    return temp;
  }, [opponents, user, maxPlayers]);

  // Position presets (supports up to 4 players)
  const positions = [
    { top: '8%', left: '15%' },
    { top: '8%', right: '15%' },
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
          const isMe = index === slots.length - 1;
          const posStyle = positions[index] || {};

          return (
            <View key={index} style={[styles.playerSlot, posStyle]}>
              {player ? (
                <>
                  <View style={styles.avatarWrap}>
                    <Text style={styles.avatarText}>
                      {player.avatar || '🐟'}
                    </Text>
                  </View>
                  <Text style={styles.playerName}>
                    {isMe ? 'Me' : player.username || 'Player'}
                  </Text>
                </>
              ) : (
                <View style={{ alignItems: 'center' }}>
                  <TouchableOpacity
                    style={styles.avatarWrap}
                    onPress={() => setModalVisible(true)}
                    activeOpacity={0.8}
                  >
                    <Icon name="user-plus" size={22} color="#FFD36E" />
                  </TouchableOpacity>
                  <Text style={styles.playerName}>Invite</Text>
                </View>
              )}
            </View>
          );
        })}
      </ImageBackground>

      {/* Invite Friends Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Invite Friends</Text>

            <FlatList
              data={friends}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.friendItem}
                  onPress={() => {
                    onInviteFriend?.(item);
                    setModalVisible(false);
                  }}
                >
                  <View style={styles.friendAvatar}>
                    <Text style={styles.avatarText}>
                      {item.avatar || '🙂'}
                    </Text>
                  </View>

                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>{item.username}</Text>
                    <Text style={styles.friendSubText}>Tap to invite</Text>
                  </View>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={{ color: '#fff', textAlign: 'center', marginTop: 20 }}>
                  No friends found
                </Text>
              }
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

export default PrivateRoomBoard;

/* ================= STYLES ================= */

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
    marginBottom: 6,
  },

  avatarText: {
    fontSize: 26,
    color: '#fff',
    fontWeight: 'bold',
  },

  playerName: {
    color: '#FFD36E',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    width: '85%',
    maxHeight: '65%',
    backgroundColor: '#1B1B3A',
    borderRadius: 20,
    padding: 20,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD36E',
    marginBottom: 12,
    textAlign: 'center',
  },

  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 6,
    borderRadius: 12,
    backgroundColor: '#303065',
  },

  friendAvatar: {
    height: 45,
    width: 45,
    borderRadius: 22.5,
    backgroundColor: '#5459AC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  friendInfo: {
    flex: 1,
  },

  friendName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  friendSubText: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 2,
  },

  closeBtn: {
    marginTop: 12,
    alignSelf: 'center',
    paddingHorizontal: 30,
    paddingVertical: 10,
    backgroundColor: '#FFD36E',
    borderRadius: 20,
  },

  closeText: {
    fontWeight: 'bold',
    color: '#000',
  },
});