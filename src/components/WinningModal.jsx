// WinningModal.js
import React from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
    Modal,
} from "react-native";

const { width } = Dimensions.get("window");

export default function WinningModal({
    result = "win",
    matchedPlayers = [],
    onClose = () => {},
    winModal
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

    // pad to 5 max
    const players = [...matchedPlayers];
    while (players.length < 5) players.push({ name: "", avatar: null });

    const displayPlayers = players.slice(0, 5);

    const top = displayPlayers.slice(0, 2);
    const bottom = displayPlayers.slice(2);

    return (
        <Modal transparent visible={winModal?"visible":''}>
            <View style={styles.overlay}>
                <View style={[styles.card, { backgroundColor: theme.bg }]}>
                    
                    {/* Close */}
                    <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                        <Text style={[styles.closeTxt, { color: theme.text }]}>✕</Text>
                    </TouchableOpacity>

                    <Text style={[styles.mainText, { color: theme.header }]}>
                        {isWin ? "WINNER" : "GAME OVER"}
                    </Text>

                    {/* Trophy */}
                    <View style={[styles.trophyCircle, { backgroundColor: theme.circle }]}>
                        <Image
                            source={require("../images/trophy.png")}
                            style={styles.trophy}
                        />
                    </View>

                    {/* Top row */}
                    <View style={styles.rowTop}>
                        {top.map((p, i) => (
                            <View key={i} style={styles.playerBlock}>
                                <View style={[styles.avatarWrap, { borderColor: theme.header }]}>
                                    <Image
                                        source={p.avatar}
                                        style={styles.avatar}
                                    />
                                </View>
                                <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
                                    {p.name || "—"}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Bottom row */}
                    <View style={styles.rowBottom}>
                        {bottom.map((p, i) => (
                            <View key={i} style={styles.playerBlockSmall}>
                                <View style={[styles.avatarWrapSmall, { borderColor: theme.header }]}>
                                    <Image
                                        source={p.avatar}
                                        style={styles.avatarSmall}
                                    />
                                </View>
                                <Text style={[styles.nameSmall, { color: theme.text }]} numberOfLines={1}>
                                    {p.name || "—"}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Info Boxes */}
                    <View style={styles.boxRow}>
                        {displayPlayers.map((p, i) => (
                            <View key={i} style={[styles.infoBox, { borderColor: theme.header }]}>
                                <Text style={[styles.infoTxt, { color: theme.text }]}>
                                    {p.name || ""}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const AVATAR = Math.round(width * 0.16);
const AVATAR_SMALL = Math.round(width * 0.12);

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
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
        zIndex: 10,
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
        width: "30%",
    },
    playerBlockSmall: {
        alignItems: "center",
        width: "28%",
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
        justifyContent: "space-between",
        marginTop: 20,
    },
    infoBox: {
        width: "18%",
        borderWidth: 2,
        borderRadius: 10,
        paddingVertical: 8,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.25)",
    },
    infoTxt: {
        fontSize: 12,
        fontWeight: "700",
    },
});
