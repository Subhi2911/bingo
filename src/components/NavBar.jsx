/* eslint-disable react-native/no-inline-styles */
import { StyleSheet, View } from 'react-native';
import React from 'react';
import Icon from 'react-native-vector-icons/FontAwesome5';

const NavBar = (props) => {
  const [selected, setSelected] = React.useState("home");

  const onClick = (name) => {
    setSelected(name);
    props.selectedScreen(name);
  };

  const icons = [
    { name: 'home' },
    { name: 'dice', key: 'play' },
    { name: 'paper-plane', key: 'messages'},
    { name: 'trophy', key: 'leaderboard' },
    { name: 'shopping-cart', key: 'shop' },
    //{ name: 'user', key: 'profile' },
  ];

  return (
    <View style={{
      width: '100%',
      alignItems: 'center',
      position: 'absolute',
      bottom: 30,

    }}>
      <View style={styles.navbar}>
        {icons.map((item) => {
          const key = item.key || item.name; // fallback key
          return (
            <View
              key={key}
              style={[
                styles.iconWrapper,
                selected === key && styles.selectedIcon
              ]}
            >
              <Icon
                name={item.name}
                size={22}
                color="#FFD67A"
                onPress={() => onClick(key)}
                solid={selected === key}
                regular
              />
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default NavBar;

const styles = StyleSheet.create({
  navbar: {
    height: 60,
    width: '90%',
    backgroundColor: '#2A244A',
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
    borderRadius: 30,
    borderColor: "#FFD67A",
    borderWidth: 0.5,
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8, // Android
    zIndex: 99999
  },
  iconWrapper: {
    borderRadius: 50,
    padding: 6,
  },
  selectedIcon: {
    backgroundColor: '#7C4585',
    borderRadius: '50%'
  },
});
