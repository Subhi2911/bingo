import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const UserSettings = ({ closeDrawer }) => {
  return (
    <View style={styles.menu}>
      <TouchableOpacity onPress={closeDrawer}>
        <Text style={styles.close}>Close ×</Text>
      </TouchableOpacity>

      <Text style={styles.item}>Home</Text>
      <Text style={styles.item}>Profile</Text>
      <Text style={styles.item}>Settings</Text>
      <Text style={styles.item}>Logout</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  menu: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  close: { fontSize: 18, marginBottom: 30 },
  item: {
    fontSize: 18,
    paddingVertical: 15,
    borderBottomWidth: 0.5,
    opacity: 0.8,
  },
});

export default UserSettings;
