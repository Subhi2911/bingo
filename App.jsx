import { StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import Home from './src/components/Home';
import Dashboard from './src/components/Dashboard';
import Signup from './src/components/Signup';
import Classic from './src/components/Classic';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer } from '@react-navigation/native';
import Fast from './src/components/Fast';
import Power from './src/components/Power';
import Private from './src/components/Private';
import Profile from './src/components/Profile';
import { SocketProvider } from "./src/context/SocketContext";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_URL } from './src/config/backend';
import HomeScreen from './src/components/HomeScreen';
import Freinds from './src/components/Friends';

const Stack = createNativeStackNavigator();

const App = () => {
  useEffect(() => {
    const token = AsyncStorage.getItem("token");
    if (token) {
      fetch(`${BACKEND_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
  }, []);



  return (
    <SocketProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false, }}>
          <Stack.Screen name="Home" component={Home} />
          <Stack.Screen name="Dashboard" component={Dashboard} />
          <Stack.Screen name="Signup" component={Signup} />
          <Stack.Screen name="Classic" component={Classic} />
          <Stack.Screen name="Fast" component={Fast} />
          <Stack.Screen name="Power" component={Power} />
          <Stack.Screen name="Private" component={Private} />
          <Stack.Screen name="Profile" component={Profile} />
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
          <Stack.Screen name="Friends" component={Freinds} />
        </Stack.Navigator>
      </NavigationContainer>
    </SocketProvider>
  );
}

export default App;

const styles = StyleSheet.create({});
