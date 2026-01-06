// /* eslint-disable react-native/no-inline-styles */
// import {
//     BackHandler,
//     ImageBackground,
//     StyleSheet,
//     Text,
//     TouchableOpacity,
//     View,
//     Image
// } from 'react-native';
// import React, { useEffect, useState } from 'react';
// import { useNavigation } from '@react-navigation/native';
// import Icon from 'react-native-vector-icons/FontAwesome5';
// import CustomAlert from './CustomAlert';
// import { useSocket } from '../context/SocketContext';

// const GameScreen = (props) => {
//     const navigation = useNavigation();
//     const { current: socket } = useSocket();
//     const [showAlert, setShowAlert] = useState(false);
//     const [numbers, setNumbers] = useState([]);
//     const [currentTurn, setCurrentTurn] = useState(null);
//     const [pickedNumbers, setPickedNumbers] = useState([]);
//     const [turnOrder, setTurnOrder] = useState([]);
//     const [playerWins, setPlayerWins] = useState({});
//     // Format: { playerId: { B: false, I: false, N: false, G: false, O: false } }

//     // Join room
//     useEffect(() => {
//         if (!socket) return;
//         console.log(props)
//         socket.emit("join_room", { roomCode: props.roomCode,userId:props.userId, username: props.username });
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [socket]);

//     // Disable back button
//     useEffect(() => {
//         const backAction = () => true;
//         const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
//         return () => backHandler.remove();
//     }, []);

//     // Generate random board numbers
//     useEffect(() => {
//         const arr = Array.from({ length: 25 }, (_, i) => i + 1);
//         shuffle(arr);
//         setNumbers(arr);
//     }, []);

//     const shuffle = (array) => {
//         for (let i = array.length - 1; i > 0; i--) {
//             const j = Math.floor(Math.random() * (i + 1));
//             [array[i], array[j]] = [array[j], array[i]];
//         }
//     };

//     // Player avatar positions
//     const playerPositions = {
//         2: [{ top: '8%', right: '10%' }, { bottom: '10%', left: '10%' }],
//         3: [{ top: '8%', left: '40%' }, { bottom: '8%', left: '15%' }, { bottom: '8%', right: '15%' }],
//         4: [
//             { top: '12%', left: '8%' },
//             { top: '12%', right: '8%' },
//             { bottom: '10%', left: '8%' },
//             { bottom: '10%', right: '8%' }
//         ],
//         5: [
//             { left: '8%', top: '22%' },
//             { right: '8%', top: '22%' },
//             { left: '8%', bottom: '12%' },
//             { right: '8%', bottom: '12%' },
//             { bottom: '12%', left: '45%' }
//         ]
//     };
//     const positions = playerPositions[props.players] || [];

//     //player wins
//     // Initialize playerWins when turnOrder changes
//     useEffect(() => {
//         const wins = {};
//         turnOrder.forEach(player => {
//             wins[player.id] = { B: false, I: false, N: false, G: false, O: false };
//         });
//         setPlayerWins(wins);
//     }, [turnOrder]);

//     // Check bingo whenever pickedNumbers changes
//     useEffect(() => {
//         turnOrder.forEach(player => {
//             checkBingo(player.id, pickedNumbers);
//         });
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [pickedNumbers, turnOrder]);



//     const checkBingo = (playerId, pickedNumbers) => {
//         if (!playerWins[playerId]) return; // safety check

//         const newWins = { ...playerWins };
//         const letters = ['B', 'I', 'N', 'G', 'O'];

//         // Define index patterns
//         const columns = [
//             [0, 5, 10, 15, 20],
//             [1, 6, 11, 16, 21],
//             [2, 7, 12, 17, 22],
//             [3, 8, 13, 18, 23],
//             [4, 9, 14, 19, 24]
//         ];

//         const rows = [
//             [0, 1, 2, 3, 4],
//             [5, 6, 7, 8, 9],
//             [10, 11, 12, 13, 14],
//             [15, 16, 17, 18, 19],
//             [20, 21, 22, 23, 24]
//         ];

//         const diagonals = [
//             [0, 6, 12, 18, 24],
//             [4, 8, 12, 16, 20]
//         ];

//         // Check columns
//         columns.forEach((col, i) => {
//             if (col.every(idx => pickedNumbers.includes(numbers[idx]))) {
//                 newWins[playerId][letters[i]] = true;
//             }
//         });

//         // Check rows
//         rows.forEach((row) => {
//             if (row.every(idx => pickedNumbers.includes(numbers[idx]))) {
//                 letters.forEach((letter, i) => {
//                     newWins[playerId][letter] = true;
//                 });
//             }
//         });

//         // Check diagonals
//         diagonals.forEach(diag => {
//             if (diag.every(idx => pickedNumbers.includes(numbers[idx]))) {
//                 letters.forEach(letter => {
//                     newWins[playerId][letter] = true;
//                 });
//             }
//         });

//         setPlayerWins(newWins);

//         // Game end logic (first 3 winners or all but one)
//         const winners = Object.entries(newWins)
//             .filter(([_, lettersObj]) => Object.values(lettersObj).every(Boolean))
//             .map(([id]) => id);

//         if (winners.length >= Math.min(turnOrder.length - 1, 3)) {
//             socket.emit('game_end', { winners });
//         }
//     };



//     // Socket listeners
//     useEffect(() => {
//         if (!socket) return;

//         socket.on("turn_order", (order) => setTurnOrder(order));
//         socket.on("current_turn", (player) => setCurrentTurn(player.id));
//         socket.on("number_picked", (numbers,) => setPickedNumbers(numbers));

//         return () => {
//             socket.off("turn_order");
//             socket.off("current_turn");
//             socket.off("number_picked");
//         };
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [socket]);

//     const handleNumberPress = (num) => {
//         if (currentTurn !== socket.id) return;
//         socket.emit("select_number", { roomCode: props.roomCode, number: num });
//     };

//     return (
//         <View style={styles.container}>
//             {/* Exit icon */}
//             <Icon
//                 name="sign-out-alt"
//                 size={30}
//                 style={[styles.exitIcon, { transform: [{ scaleX: -1 }] }]}
//                 onPress={() => setShowAlert(true)}
//             />

//             <CustomAlert
//                 visible={showAlert}
//                 title="Exit Game"
//                 message="Are you sure you want to leave?\nIt will charge you 40 coins."
//                 onCancel={() => setShowAlert(false)}
//                 onConfirm={() => navigation.goBack()}
//             />

//             <ImageBackground
//                 source={require('../images/gameScreen.jpg')}
//                 style={{ width: '100%', height: '100%' }}
//             >
//                 {/* Room code */}
//                 <View style={{ position: 'absolute', top: '3%', left: '40%' }}>
//                     <Text style={styles.roomCode}>{props.roomCode}</Text>
//                 </View>

//                 <View style={{ flex: 1 }}>
//                     {/* Players */}
//                     {console.log(turnOrder)}
//                     {turnOrder.map((player, index) => {
//                         const pos = positions[index] || {};
//                         const isMe = player.id === socket.id;
//                         const isCurrentTurn = player.id === currentTurn;

//                         return (
//                             <View key={player.id} style={[styles.player, pos]}>
//                                 <View
//                                     style={[
//                                         styles.userAvatar,
//                                         isCurrentTurn && { borderColor: '#0f0', borderWidth: 3 }
//                                     ]}
//                                 />
//                                 <Text style={styles.userText}>{isMe ? 'Me' : player.username}</Text>
//                             </View>
//                         );
//                     })}

//                     {/* Bingo Board */}
//                     <ImageBackground
//                         source={require('../images/BingoBoard (2).png')}
//                         style={styles.board}
//                     >
//                         <View style={styles.grid}>
//                             {numbers.map((num, index) => {
//                                 console.log(numbers);
//                                 const isPicked = pickedNumbers.includes(num);
//                                 const disabled = currentTurn !== socket.id || isPicked;

//                                 return (
//                                     <TouchableOpacity
//                                         key={index}
//                                         disabled={disabled}
//                                         onPress={() => handleNumberPress(num)}
//                                         style={[styles.box, isPicked && { opacity: 0.7 }, disabled && { opacity: 0.4 }]}
//                                     >
//                                         {isPicked && (
//                                             <Image
//                                                 source={require('../images/daub (2).png')}
//                                                 style={{ width: 40, height: 40, position: "absolute" }}
//                                             />
//                                         )}
//                                         <Text style={styles.numberText}>{num}</Text>
//                                     </TouchableOpacity>
//                                 );
//                             })}
//                         </View>
//                     </ImageBackground>
//                     <View style={styles.bingowin}>
//                         {['B', 'I', 'N', 'G', 'O'].map((letter, index) => {
//                             const daubed = playerWins[socket.id]?.[letter]; // current player
//                             return (
//                                 <View key={index} style={styles.bingoLetterContainer}>
//                                     <View style={[styles.bingoLetter, daubed && styles.daubedLetter]}>
//                                         <Text style={[styles.letterText, daubed && styles.daubedText]}>
//                                             {letter}
//                                         </Text>
//                                     </View>
//                                     {daubed && (
//                                         <Image
//                                             source={require('../images/daub (2).png')}
//                                             style={styles.daubIcon}
//                                         />
//                                     )}
//                                 </View>
//                             );
//                         })}
//                     </View>
                    


//                 </View>
//             </ImageBackground>
//         </View>
//     );
// };

// export default GameScreen;

// const styles = StyleSheet.create({
//     container: {
//         flex: 1,
//         width: '100%',
//         height: '100%'
//     },
//     player: {
//         position: 'absolute',
//         alignItems: 'center'
//     },
//     userAvatar: {
//         width: 55,
//         height: 55,
//         borderRadius: 30,
//         backgroundColor: '#F8B55F',
//         borderWidth: 2,
//         borderColor: '#fff'
//     },
//     userText: {
//         color: '#fff',
//         fontWeight: 'bold',
//         marginTop: 5
//     },
//     board: {
//         position: 'absolute',
//         top: '30%',
//         width: 350,
//         height: 350,
//         alignSelf: 'center'
//     },
//     grid: {
//         width: '100%',
//         height: '100%',
//         paddingTop: '25%',
//         paddingBottom: '10%',
//         paddingLeft: '18%',
//         paddingRight: '18%',
//         flexDirection: 'row',
//         flexWrap: 'wrap'
//     },
//     bingowin: {
//         flexDirection: 'row',
//         justifyContent: 'space-around', // evenly space letters
//         alignItems: 'center',
//         position: 'absolute',
//         bottom: "28%",
//         width: '70%', // centered and responsive
//         alignSelf: 'center'
//     },
//     bingoLetterContainer: {
//         alignItems: 'center'
//     },
//     bingoLetter: {
//         width: 50,
//         height: 50,
//         borderRadius: 25,
//         backgroundColor: '#F8B55F',
//         justifyContent: 'center',
//         alignItems: 'center'
//     },
//     daubedLetter: {
//         backgroundColor: '#FFD700', // highlight when daubed
//         borderWidth: 2,
//         borderColor: '#F00'
//     },
//     letterText: {
//         fontSize: 22,
//         fontWeight: 'bold',
//         color: '#000'
//     },
//     daubedText: {
//         color: '#F00'
//     },
//     daubIcon: {
//         width: 20,
//         height: 20,
//         marginTop: 5
//     },
//     box: {
//         width: '20%',
//         height: '20%',
//         justifyContent: 'center',
//         alignItems: 'center'
//     },
//     numberText: {
//         fontSize: 19,
//         fontWeight: 'bold',
//         color: '#000'
//     },
//     exitIcon: {
//         position: 'absolute',
//         top: 50,
//         left: 20,
//         color: '#F8B55F',
//         zIndex: 10
//     },
//     roomCode: {
//         color: '#fff',
//         fontSize: 20,
//         fontWeight: 'bold',
//         alignSelf: 'center',
//         marginTop: 20
//     }
// });
