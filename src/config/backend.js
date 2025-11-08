import DeviceInfo from "react-native-device-info";

let BACKEND_URL;

if (DeviceInfo.isEmulatorSync()) {
  BACKEND_URL = "http://10.0.2.2:5000";
} else {
  BACKEND_URL = "http://10.242.11.58:5000"; // your hotspot IPv4
}

export { BACKEND_URL };
