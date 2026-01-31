/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';

const MAX_STARS = 5;
const MAX_LEVEL = 100;

const getTier = (level) => {
  if (level <= 20) return 'BRONZE';
  if (level <= 40) return 'SILVER';
  if (level <= 60) return 'GOLD';
  if (level <= 80) return 'PLATINUM';
  return 'TROPHY';
};

const getTierColor = (tier) => {
  switch (tier) {
    case 'BRONZE':
      return '#cd7f32';
    case 'SILVER':
      return '#C0C0C0';
    case 'GOLD':
      return '#FFD700';
    case 'PLATINUM':
      return '#91a8d0';
    case 'TROPHY':
      return '#f5b301';
    default:
      return '#fff';
  }
};
const getTierIcon = (tier) => {
  switch (tier) {
    case 'BRONZE':
      return '🥉';
    case 'SILVER':
      return '🥈';
    case 'GOLD':
      return '🥇';
    case 'PLATINUM':
      return '💎';
    case 'TROPHY':
      return '🏆';
    default:
      return '⭐';
  }
};


const LevelModal = ({
  visible,
  onClose,
  currentLevel,
  currentStars,
}) => {
  const tier = getTier(currentLevel);
  const tierColor = getTierColor(tier);
  const tierIcon = getTierIcon(tier);


  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.card, { shadowColor: tierColor }]}>

          {/* Tier Badge */}
          <View style={[styles.badge, { backgroundColor: tierColor }]}>
            <Text style={styles.badgeIcon}>{tierIcon}</Text>
          </View>

          {/* Tier Text */}
          <Text style={[styles.tierText, { color: tierColor }]}>
            {tier} TIER
          </Text>

          {/* Level */}
          <Text style={styles.levelText}>Level {currentLevel}</Text>

          {/* Stars */}
          <View style={styles.starRow}>
            {[...Array(MAX_STARS)].map((_, i) => (
              <Text
                key={i}
                style={[
                  styles.star,
                  { opacity: i < currentStars ? 1 : 0.2, color: tierColor },
                ]}
              >
                ★
              </Text>
            ))}
          </View>

          {tier === 'TROPHY' && (
            <Text style={styles.champion}>Champion League 🏆</Text>
          )}

          <TouchableOpacity style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>CONTINUE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>

  );
};


export default LevelModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    width: '82%',
    borderRadius: 25,
    backgroundColor: '#121212',
    paddingVertical: 30,
    paddingHorizontal: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ffbb00',
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.9,
    shadowRadius: 30,
  },


  badge: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },

  badgeIcon: {
    fontSize: 50,
  },

  tierText: {
    fontSize: 22,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 10,
  },

  levelText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
    marginVertical: 10,
  },

  starRow: {
    flexDirection: 'row',
    marginVertical: 18,
  },

  star: {
    fontSize: 38,
    marginHorizontal: 6,
  },

  champion: {
    marginTop: 8,
    fontSize: 18,
    color: '#f5b301',
    fontWeight: 'bold',
  },

  button: {
    marginTop: 25,
    backgroundColor: '#52357B',
    paddingVertical: 12,
    paddingHorizontal: 50,
    borderRadius: 30,
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

});
