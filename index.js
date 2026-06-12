/* eslint-disable no-unused-vars */
/**
 * @format
 */

import { Buffer } from 'buffer';
global.Buffer = Buffer;

import { AppRegistry } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';
import App from './App';
import { name as appName } from './app.json';

// Create channel + display notification when app is killed/background
messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('📩 Background Message received:', remoteMessage);

  // Must create channel before displaying
  const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Default Notifications',
    importance: AndroidImportance.HIGH,
    sound: 'default',
    vibration: true,
  });

  });

AppRegistry.registerComponent(appName, () => App);