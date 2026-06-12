/* eslint-disable no-unused-vars */
import React, { useEffect, useRef } from 'react';
import Home from './src/components/Home';
import Dashboard from './src/components/Dashboard';
import Signup from './src/components/Signup';
import Classic from './src/components/Classic';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
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
import { AlertProvider } from './src/components/CustomAlert2.jsx';
import { AlertToastProvider } from './src/components/AlertToast.jsx';
import ChangePassword from './src/components/ChangePassword.jsx';
import ForgotPassword from './src/components/ForgotPassword.jsx'; // ← uncomment when you create this

const Stack = createNativeStackNavigator();

// ── navigationRef: lets us navigate outside of React components (FCM handlers) ──
export const navigationRef = createNavigationContainerRef();

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
      pressAction: { id: 'default', launchActivity: 'default' },
    },
  });
};

const App = () => {

  // ── Request permission + save FCM token ─────────────────────────────────────
  useEffect(() => {
    const requestPermission = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        const fcmToken = await messaging().getToken();
        const authToken = await AsyncStorage.getItem("authToken"); // ← fixed: was "token"
        if (!authToken) return; // not logged in yet, skip
        await fetch(`${BACKEND_URL}/api/auth/save-fcm-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "auth-token": authToken },
          body: JSON.stringify({ fcmToken }),
        });
      }
    };

    requestPermission();
  }, []);

  // ── Foreground messages ──────────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribeForeground = messaging().onMessage(async remoteMessage => {
      await displayLocalNotification(remoteMessage);
    });

    // App brought from BACKGROUND by tapping notification
    const unsubscribeBackground = messaging().onNotificationOpenedApp(remoteMessage => {
      if (remoteMessage?.data?.chatId && navigationRef.isReady()) {
        navigationRef.navigate('Chat', { chatId: remoteMessage.data.chatId });
      }
    });

    return () => {
      unsubscribeForeground();
      unsubscribeBackground();
    };
  }, []);

  // ── App opened from QUIT state by tapping notification ──────────────────────
  useEffect(() => {
    messaging().getInitialNotification().then(remoteMessage => {
      if (remoteMessage?.data?.chatId && navigationRef.isReady()) {
        navigationRef.navigate('Chat', { chatId: remoteMessage.data.chatId });
      }
    });
  }, []);

  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <AlertToastProvider>
            <AlertProvider>
              <NavigationContainer ref={navigationRef}>
                <MessageToast />
                <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
                  <Stack.Screen name="Home" component={Home} />
                  <Stack.Screen name="Login" component={Home} />  {/* alias so navigation.navigate("Login") works */}
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
                  <Stack.Screen name="ChangePassword" component={ChangePassword} />
                  
                  <Stack.Screen name="ForgotPassword" component={ForgotPassword} /> 
                </Stack.Navigator>
              </NavigationContainer>
            </AlertProvider>
          </AlertToastProvider>
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;