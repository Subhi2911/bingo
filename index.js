/* eslint-disable no-unused-vars */
/**
 * @format
 */

import { Buffer } from 'buffer';
global.Buffer = Buffer;

import { AppRegistry } from 'react-native';
import {
  getMessaging,
  setBackgroundMessageHandler,
} from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';

const messaging = getMessaging();

// Create channel + display notification when app is killed/background
setBackgroundMessageHandler(messaging, async remoteMessage => {
  console.log('📩 Background Message received:', remoteMessage);

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
});

AppRegistry.registerComponent(appName, () => App);