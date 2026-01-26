/* eslint-disable react-native/no-inline-styles */
// components/Bell.js
import { View, TouchableOpacity } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";

export default function Bell({ hasUnread, onPress }) {
    return (
        <TouchableOpacity onPress={onPress}>
            <Icon name="bell" size={28} color="#F8B55F" />
            {hasUnread && (
                <View style={{
                    position: "absolute",
                    top: -2,
                    right: -2,
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: "red"
                }} />
            )}
        </TouchableOpacity>
    );
}