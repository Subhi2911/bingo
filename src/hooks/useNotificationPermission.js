// import { Platform, PermissionsAndroid, Linking } from 'react-native';

// const useNotificationPermission = () => {
//     const requestNotificationPermission = async () => {
//         try {
//             // POST_NOTIFICATIONS only exists on Android 13+ (API 33+)
//             // On older versions notifications are on by default — skip
//             if (Platform.OS !== 'android' || Platform.Version < 33) return;

//             const permission = PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS;
//             if (!permission) return; // extra null guard

//             const already = await PermissionsAndroid.check(permission);
//             if (already) return;

//             const result = await PermissionsAndroid.request(permission, {
//                 title: "Enable Notifications",
//                 message: "Allow notifications to get friend requests and game updates.",
//                 buttonPositive: "Allow",
//                 buttonNegative: "Deny",
//             });

//             if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
//                 Linking.openSettings();
//             }
//         } catch (err) {
//             console.log('Permission error:', err);
//         }
//     };

//     return { requestNotificationPermission };
// };

// export default useNotificationPermission;

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