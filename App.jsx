import { StyleSheet, Alert } from 'react-native';
import React, { useEffect } from 'react';
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
import Ranking from './src/components/Ranking';
import Missions from './src/components/Missions';
import OtherProfile from './src/components/otherProfile.jsx';
import Messaging from './src/components/Messaging.jsx';
import Chat from './src/components/Chat.jsx';
import AvatarSelection from './src/components/AvatarSelection.jsx';
import { NotificationProvider } from './src/context/NotificationContext.js';
import { AuthProvider } from './src/context/AuthContext.js';
import NotificationPanel from './src/components/NotificationPanel.jsx';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import MessageToast from './src/components/MessageToast.jsx';
import TermsOfService from './src/components/TermsOfService.jsx';
import PrivacyPolicy from './src/components/PrivacyPolicy.jsx';

const Stack = createNativeStackNavigator();

// ✅ Helper — reused for foreground display via notifee
const displayLocalNotification = async (remoteMessage) => {
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Notifications',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
  });

  await notifee.displayNotification({
    title: remoteMessage.notification?.title || remoteMessage.data?.title || 'New Message',
    body: remoteMessage.notification?.body || remoteMessage.data?.body || '',
    android: {
      channelId,
      importance: AndroidImportance.HIGH,
      sound: 'default',
      pressAction: {
        id: 'default',
        launchActivity: 'default',
      },
    },
  });
};

const App = () => {

  // ✅ Request permission + save FCM token
  useEffect(() => {
    const requestPermission = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('FCM Permission granted:', authStatus);
        const fcmToken = await messaging().getToken();
        console.log("FCM Token:", fcmToken);

        const authToken = await AsyncStorage.getItem("authToken");
        const response = await fetch(`${BACKEND_URL}/api/auth/save-fcm-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "auth-token": authToken,
          },
          body: JSON.stringify({ fcmToken }),
        });
        const data = await response.json();
        console.log("SAVE TOKEN STATUS:", response.status);
        console.log("SAVE TOKEN RESPONSE:", data);
      }
    };

    requestPermission();
  }, []);

  // ✅ Foreground message handler — show via notifee (NOT Alert)
  useEffect(() => {
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      console.log("📨 Foreground message:", remoteMessage);
      await displayLocalNotification(remoteMessage);
    });

    // App opened by tapping notification from BACKGROUND state
    const unsubscribeBackground = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('🔔 Opened from background tap:', remoteMessage);
      // navigate to Chat if needed:
      // navigationRef.navigate('Chat', { chatId: remoteMessage.data.chatId });
    });

    return () => {
      unsubscribeForeground();
      unsubscribeBackground();
    };
  }, []);

  // ✅ App opened from QUIT state by tapping notification
  useEffect(() => {
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('🚀 Opened from quit state tap:', remoteMessage);
          // navigate to Chat if needed:
          // navigationRef.navigate('Chat', { chatId: remoteMessage.data.chatId });
        }
      });
  }, []);

  // ✅ Load token check
  useEffect(() => {
    const load = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        fetch(`${BACKEND_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    };
    load();
  }, []);

  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <NavigationContainer>
            <MessageToast />
            <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
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
              <Stack.Screen name="TermsOfService" component={TermsOfService} />
              <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
            </Stack.Navigator>
          </NavigationContainer>
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;

const styles = StyleSheet.create({});