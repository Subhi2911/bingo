import { checkNotifications, requestNotifications } from 'react-native-permissions';
import { Linking } from 'react-native';

export const getNotificationStatus = async () => {
  const { status } = await checkNotifications();
  return status === 'granted';
};

export const requestNotificationPermission = async () => {
  const { status } = await requestNotifications(['alert', 'sound']);

  if (status === 'blocked') {
    Linking.openSettings();
  }

  return status === 'granted';
};