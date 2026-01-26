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
import Ranking from './src/components/Ranking'
import Missions from './src/components/Missions'
import OtherProfile from './src/components/otherProfile.jsx';
import Messaging from './src/components/Messaging.jsx';
import Chat from './src/components/Chat.jsx';
import AvatarSelection from './src/components/AvatarSelection.jsx';
import { NotificationProvider } from './src/context/NotificationContext.js';
import { AuthProvider } from './src/context/AuthContext.js'
import NotificationPanel from './src/components/NotificationPanel.jsx';
import messaging from '@react-native-firebase/messaging';

const Stack = createNativeStackNavigator();



const App = () => {
  useEffect(() => {
    const requestPermission = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('FCM Permission granted:', authStatus);
        const token = await messaging().getToken();
        console.log('FCM Token:', token);
        // Send this token to your backend for saving
      }
    };

    requestPermission();
  }, []);

  useEffect(() => {
    const token = AsyncStorage.getItem("token");
    if (token) {
      fetch(`${BACKEND_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
    }
  }, []);



  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
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
              <Stack.Screen name="Ranking" component={Ranking} />
              <Stack.Screen name="Missions" component={Missions} />
              <Stack.Screen name="OtherProfile" component={OtherProfile} />
              <Stack.Screen name="Messaging" component={Messaging} />
              <Stack.Screen name="Chat" component={Chat} />
              <Stack.Screen name="AvatarSelection" component={AvatarSelection} />
              <Stack.Screen name="NotificationPanel" component={NotificationPanel} />
            </Stack.Navigator>
          </NavigationContainer>
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;

const styles = StyleSheet.create({});
