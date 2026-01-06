/* eslint-disable react-native/no-inline-styles */
// WinningModal.js
import React from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
} from "react-native";

const { width } = Dimensions.get("window");

export default function WinningModal({
    result = "win",
    matchedPlayers = [],
    onClose = () => { },
}) {
    const isWin = result === "win";

    const theme = {
        win: {
            bg: "rgba(255, 240, 200, 0.97)",
            header: "#F5B800",
            text: "#5A3400",
            circle: "#FFD773",
            accent: "#FFE8AE",
        },
        lose: {
            bg: "rgba(220, 225, 230, 0.97)",
            header: "#8A939F",
            text: "#2E3A4A",
            circle: "#CED3DA",
            accent: "#DFE3E7",
        },
    }[isWin ? "win" : "lose"];

    // Limit to max 5 players
    const players = matchedPlayers.slice(0, 5);
    const count = players.length;

    let top = [];
    let bottom = [];

    if (count === 2) {
        top = players;
    } else if (count === 3) {
        top = players.slice(0, 1);
        bottom = players.slice(1);
    } else if (count === 4) {
        top = players.slice(0, 2);
        bottom = players.slice(2);
    } else {
        top = players.slice(0, 2);
        bottom = players.slice(2);
    }

    return (
        <View style={styles.overlay}>
            <View style={[styles.card, { backgroundColor: theme.bg }]}>

                {/* Close */}
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                    <Text style={[styles.closeTxt, { color: theme.text }]}>✕</Text>
                </TouchableOpacity>

                {/* Title */}
                <Text style={[styles.mainText, { color: theme.header }]}>
                    {isWin ? "WINNER" : "GAME OVER"}
                </Text>

                {/* Trophy */}
                <View style={[styles.trophyCircle, { backgroundColor: theme.circle }]}>
                    {isWin ? <Image
                        source={require("../images/trophy.png")}
                        style={styles.trophy}
                    /> : <Image
                        source={require("../images/brokenTrophy.png")}
                        style={[styles.trophy, { height: 120, width: 120 }]}
                    />}
                </View>

                {/* Top Row */}
                {top.length > 0 && (
                    <View style={styles.rowTop}>
                        {top.map((p, i) => (
                            <View key={i} style={styles.playerBlock}>
                                <View style={[styles.avatarWrap, { borderColor: theme.header }]}>
                                    {p.avatar && (
                                        <Image source={p.avatar} style={styles.avatar} />
                                    )}
                                </View>
                                <Text
                                    style={[styles.name, { color: theme.text }]}
                                    numberOfLines={1}
                                >
                                    {p.name}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Bottom Row */}
                {bottom.length > 0 && (
                    <View style={styles.rowBottom}>
                        {bottom.map((p, i) => (
                            <View key={i} style={styles.playerBlockSmall}>
                                <View
                                    style={[
                                        styles.avatarWrapSmall,
                                        { borderColor: theme.header },
                                    ]}
                                >
                                    {p.avatar && (
                                        <Image source={p.avatar} style={styles.avatarSmall} />
                                    )}
                                </View>
                                <Text
                                    style={[styles.nameSmall, { color: theme.text }]}
                                    numberOfLines={1}
                                >
                                    {p.name}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}

                {/* Info Boxes */}
                <View style={styles.boxRow}>
                    {players.map((p, i) => (
                        <View key={i} style={[styles.infoBox, { borderColor: theme.header }]}>
                            <Text style={[styles.infoTxt, { color: theme.text }]}>
                                {p.name}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Close Button */}
                <TouchableOpacity onPress={onClose} style={[styles.closetxt, { backgroundColor: theme.accent }]}>
                    <Text style={{ fontWeight: "700" }}>Close</Text>
                </TouchableOpacity>

            </View>
        </View>
    );
}

const AVATAR = Math.round(width * 0.16);
const AVATAR_SMALL = Math.round(width * 0.12);

const styles = StyleSheet.create({
    overlay: {
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
        height: "100%",
    },
    card: {
        width: "100%",
        borderRadius: 22,
        paddingVertical: 26,
        paddingHorizontal: 20,
        alignItems: "center",
        elevation: 10,
    },
    mainText: {
        fontSize: 40,
        fontWeight: "900",
        marginBottom: 10,
        letterSpacing: 2,
    },
    closeBtn: {
        position: "absolute",
        top: 16,
        right: 18,
        padding: 8,
    },
    closeTxt: {
        fontSize: 24,
        fontWeight: "800",
    },
    trophyCircle: {
        width: 150,
        height: 150,
        borderRadius: 80,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 18,
    },
    trophy: {
        width: 95,
        height: 95,
        resizeMode: "contain",
    },
    rowTop: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-evenly",
        marginBottom: 14,
    },
    rowBottom: {
        width: "100%",
        flexDirection: "row",
        justifyContent: "space-evenly",
        marginBottom: 12,
    },
    playerBlock: {
        alignItems: "center",
        width: "40%",
    },
    playerBlockSmall: {
        alignItems: "center",
        width: "30%",
    },
    avatarWrap: {
        width: AVATAR + 6,
        height: AVATAR + 6,
        borderRadius: (AVATAR + 6) / 2,
        borderWidth: 3,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        elevation: 6,
    },
    avatarWrapSmall: {
        width: AVATAR_SMALL + 6,
        height: AVATAR_SMALL + 6,
        borderRadius: (AVATAR_SMALL + 6) / 2,
        borderWidth: 3,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
        elevation: 4,
    },
    avatar: {
        width: AVATAR,
        height: AVATAR,
        borderRadius: AVATAR / 2,
    },
    avatarSmall: {
        width: AVATAR_SMALL,
        height: AVATAR_SMALL,
        borderRadius: AVATAR_SMALL / 2,
    },
    name: {
        marginTop: 8,
        fontWeight: "700",
        fontSize: 14,
        textAlign: "center",
    },
    nameSmall: {
        marginTop: 6,
        fontWeight: "700",
        fontSize: 12,
        textAlign: "center",
    },
    boxRow: {
        width: "100%",
        flexDirection: "row",
        marginTop: 20,
    },
    infoBox: {
        flex: 1,
        marginHorizontal: 4,
        borderWidth: 2,
        borderRadius: 10,
        paddingVertical: 8,
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.25)",
    },
    infoTxt: {
        fontSize: 12,
        fontWeight: "700",
    },
    closetxt: {
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 20,
        elevation: 5,
    },
});
