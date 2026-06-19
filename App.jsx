/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
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
import { AlertProvider } from './src/components/CustomAlert2.jsx';
import { AlertToastProvider } from './src/components/AlertToast.jsx';
import ChangePassword from './src/components/ChangePassword.jsx';
import ForgotPassword from './src/components/ForgotPassword.jsx';
import { createNavigationContainerRef } from '@react-navigation/native';
import CustomizeScreen from './src/components/CustomizeScreen.jsx';
import FrozenScreen from './src/components/FrozenScreen.jsx';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from './src/context/AuthContext';
import { useSocket } from './src/context/SocketContext';
import { Platform } from 'react-native';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import Receipts from './src/components/Receipts.jsx';
import PaymentStats from './src/components/PaymentStats.jsx';
import {
  getMessaging,
  getToken,
  onMessage,
  onNotificationOpenedApp,
  getInitialNotification,
  AuthorizationStatus,
  requestPermission,
} from '@react-native-firebase/messaging';

export const navigationRef = createNavigationContainerRef();

const Stack = createNativeStackNavigator();

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

// ── Inner component — lives INSIDE NavigationContainer so useNavigation works ──
const AppNavigator = () => {
  const navigation = useNavigation();
  const socketRef = useSocket();
  const socket = socketRef?.socket;

  const { user, setUser } = useAuth();

  //const [user, setUser] = React.useState(null);

  useEffect(() => {
    if (Platform.OS === 'android') {
      SystemNavigationBar?.navigationHide();
    }
  }, []);


  useEffect(() => {
    if (user?.isFrozen) {
      navigation.navigate("FrozenScreen", {
        message: user.freezeMessage,
        freezeUntil: user.freezeUntil,
        reason: user.freezeReason,
      });
    }
  }, []);
  useEffect(() => {
    if (!socket) return;

    socket.on("accountFrozen", ({ message, freezeUntil, reason }) => {
      // Update context so isFrozen is reflected everywhere
      setUser(prev => ({
        ...prev,
        isFrozen: true,
        freezeMessage: message,
        freezeUntil,
        freezeReason: reason,
      }));
      // Navigate immediately — works from ANY screen
      navigation.navigate("FrozenScreen", { message, freezeUntil, reason });
    });

    socket.on("accountUnfrozen", () => {
      setUser(prev => ({
        ...prev,
        isFrozen: false,
        freezeMessage: null,
        freezeUntil: null,
        freezeReason: null,
      }));
      // Send them back to home
      navigation.navigate("Home");
    });

    return () => {
      socket.off("accountFrozen");
      socket.off("accountUnfrozen");
    };
  }, [socket]);


  return (

    <>
      {/* FIX: MessageToast is now inside NavigationContainer so useNavigation() works */}
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
        <Stack.Screen name="ChangePassword" component={ChangePassword} />
        <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
        <Stack.Screen name="CustomizeScreen" component={CustomizeScreen} />
        <Stack.Screen name="FrozenScreen" component={FrozenScreen} />
        <Stack.Screen name="Receipts" component={Receipts }/>
        <Stack.Screen name="PaymentStats" component={PaymentStats} />
      </Stack.Navigator>
    </>
  );
};

const App = () => {


  // ── Permission + FCM token ──
  useEffect(() => {
    const requestPerm = async () => {
      const messaging = getMessaging();
      const authStatus = await requestPermission(messaging);
      const enabled =
        authStatus === AuthorizationStatus.AUTHORIZED ||
        authStatus === AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        const fcmToken = await getToken(messaging);
        const authToken = await AsyncStorage.getItem("authToken");
        await fetch(`${BACKEND_URL}/api/auth/save-fcm-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "auth-token": authToken },
          body: JSON.stringify({ fcmToken }),
        });
      }
    };
    requestPerm();
  }, []);

  // ── Foreground + background open handler ──
  useEffect(() => {
    const messaging = getMessaging();

    const unsubscribeForeground = onMessage(messaging, async remoteMessage => {
      await displayLocalNotification(remoteMessage);
    });

    const unsubscribeBackground = onNotificationOpenedApp(messaging, remoteMessage => {
      navigationRef.navigate('Chat', { chatId: remoteMessage.data.chatId });
    });

    return () => {
      unsubscribeForeground();
      unsubscribeBackground();
    };
  }, []);

  // ── Quit state ──
  useEffect(() => {
    const messaging = getMessaging();
    getInitialNotification(messaging).then(remoteMessage => {
      if (remoteMessage && navigationRef.isReady()) {
        navigationRef.navigate('Chat', { chatId: remoteMessage.data.chatId });
      }
    });
  }, []);

  // Load token check
  useEffect(() => {
    const load = async () => {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        fetch(`${BACKEND_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    };
    load();
  }, []);

  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <AlertToastProvider>
            <AlertProvider>
              <NavigationContainer ref={navigationRef}>
                {/* AppNavigator renders MessageToast + Stack inside the container */}
                <AppNavigator />
              </NavigationContainer>
            </AlertProvider>
          </AlertToastProvider>
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;