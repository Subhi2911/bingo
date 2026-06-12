<div align="center">

# 🎯 Bingo Bing

**A real-time multiplayer Bingo game for Android**

[![React Native](https://img.shields.io/badge/React%20Native-0.73-61DAFB?style=flat-square&logo=react)](https://reactnative.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-Realtime-010101?style=flat-square&logo=socket.io)](https://socket.io/)
[![Firebase](https://img.shields.io/badge/Firebase-FCM-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com/)

*Play classic Bingo with friends or strangers — anywhere, anytime.*

</div>

---

## 📖 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Game Modes](#-game-modes)
- [Power System](#-power-system)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Socket Events](#-socket-events)
- [Screenshots](#-screenshots)
- [Roadmap](#-roadmap)
- [License](#-license)

---

## 🎮 About

**Bingo Bing** is a feature-rich real-time multiplayer Bingo game built with React Native and Node.js. Players can compete in classic 5×5 Bingo matches across multiple game modes, use unique animal-themed powers to shake up the board, chat with opponents mid-game, climb the global leaderboard, and connect with friends — all with instant push notifications keeping them in the loop.

---

## ✨ Features

### Gameplay
- 🎲 **Real-time multiplayer** — live turn-based Bingo on a 5×5 board via Socket.IO
- ⏱️ **Turn timer** — auto-picks a random number if a player goes AFK
- 🔄 **Rejoin** — reconnect to an ongoing game if you close the app mid-match
- 🏁 **Auto win detection** — rows, columns, and diagonals checked server-side

### Social
- 👥 **Friends system** — send, accept, and manage friend requests
- 💬 **In-game chat** — floating messages visible to all players during a match
- 📩 **Direct messaging** — encrypted 1-on-1 chat between friends
- 🔔 **Push notifications** — friend requests, messages, and game events via FCM

### Progression
- ⭐ **XP & levelling** — earn XP for every game; level up with a visual XP bar
- 🌟 **Stars** — collect up to 5 stars per level before levelling up
- 🏆 **Leaderboard** — global rankings by wins, XP, and level
- 🎯 **Missions** — daily and weekly challenges with coin rewards
- 🎰 **Daily spin** — spin the wheel once a day for bonus coins

### Account
- 🔐 **JWT authentication** with secure bcrypt password hashing
- 🐾 **Animal avatars** — 12 emoji avatars; changing avatar resets stats
- ✏️ **Editable profile** — username, bio, and avatar
- 🔑 **Password management** — change password in-app or reset via OTP email
- 🗑️ **Account deletion** — full data wipe on request

---

## 🕹️ Game Modes

| Mode | Players | Turn Time | Special Rules |
|------|---------|-----------|---------------|
| **Classic** | 2–5 | 15 seconds | Full BINGO required |
| **Fast** | 2–5 | 5 seconds | 3 letters wins |
| **Power** | 2–5 | 15 seconds | Powers enabled |
| **Private** | 2–5 | Custom | Password-protected room |

---

## ⚡ Power System

Power mode gives each player one animal-themed ability per game. Powers are grouped by effect:

| Group | Powers | Effect |
|-------|--------|--------|
| **Extra Turn** | Swift Dash, Pack Howl, Dominance, Blood Frenzy, Panic Flap | Immediately take another turn |
| **Free Mark** | Shadow Step, Mega Jump | Mark any number for free |
| **Random Mark** | Tree Leap, Tracker Sense, Charge Run | Mark a random unpicked number |
| **Freeze** | Fear Aura, Hoof Strike, Venom Bite | Freeze target for 5 seconds |
| **Immunity** | Loyal Guard, Iron Hide, Steadfast | Immune to all attacks for 15 seconds |
| **Remove Mark** | Silent Claws, Ambush Pounce, Sneak Bite, Sticky Tongue, Egg Bomb, Ground Slam | Remove target's last marked number |
| **Reflect** | Nine Lives, Poison Skin, Feather Shield, Tiny Target | Reflect the next attack back |
| **Special** | Mischief Steal, King's Roar, Predator Focus, Illusion Clone, Trick Swap, Mind Games, Quick Escape, Coil Trap, Heat Sense, Endurance | Unique one-off abilities |

---

## 🛠️ Tech Stack

### Frontend
- **React Native** (Android) — core UI framework
- **React Navigation** — stack-based screen navigation
- **Socket.IO Client** — real-time bidirectional communication
- **@react-native-firebase/messaging** — FCM push notifications
- **Notifee** — local notification display
- **AsyncStorage** — local token and preference storage
- **React Native Vector Icons** — FontAwesome5 icon set

### Backend
- **Node.js + Express** — REST API server
- **Socket.IO** — WebSocket server for real-time game events
- **MongoDB + Mongoose** — persistent data storage
- **Firebase Admin SDK** — server-side push notification delivery
- **bcryptjs** — password hashing
- **jsonwebtoken** — stateless authentication
- **Nodemailer** — OTP email delivery

---

## 📁 Project Structure

```
bingo-bing/
├── src/
│   ├── components/          # All screens and UI components
│   │   ├── Dashboard.jsx
│   │   ├── GameScreen.jsx
│   │   ├── Profile.jsx
│   │   ├── ChangePassword.jsx
│   │   ├── ForgotPassword.jsx
│   │   ├── TermsOfService.jsx
│   │   ├── PrivacyPolicy.jsx
│   │   ├── Friends.jsx
│   │   ├── Ranking.jsx
│   │   ├── Missions.jsx
│   │   ├── Chat.jsx
│   │   ├── Messaging.jsx
│   │   └── ...
│   ├── context/
│   │   ├── SocketContext.js  # Global socket instance
│   │   ├── AuthContext.js    # User auth state
│   │   └── NotificationContext.js
│   ├── config/
│   │   └── backend.js        # BACKEND_URL constant
│   └── images/               # Local assets
│
├── server/
│   ├── models/
│   │   ├── User.js
│   │   ├── Room.js
│   │   ├── Chat.js
│   │   └── Notification.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── gameRoutes.js
│   │   ├── chat.js
│   │   ├── messages.js
│   │   ├── rooms.js
│   │   ├── notification.js
│   │   └── spin.js
│   ├── utils/
│   │   └── encryption.js
│   ├── middleware/
│   │   └── fetchuser.js
│   ├── db.js
│   └── index.js              # Main server + Socket.IO
│
├── App.js
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- React Native CLI
- Android Studio + Android SDK
- MongoDB Atlas account (or local MongoDB)
- Firebase project with FCM enabled
- Gmail account (or SMTP) for OTP emails

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/bingo-bing.git
cd bingo-bing
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Install backend dependencies

```bash
cd server
npm install
```

### 4. Configure environment variables

Create `server/.env.local` (see [Environment Variables](#-environment-variables) below).

### 5. Add Firebase config

- Download `google-services.json` from your Firebase project and place it in `android/app/`
- Download `serviceAccountKey.json` from Firebase Admin SDK and place it in `server/`

### 6. Run the backend

```bash
cd server
node index.js
```

### 7. Run the app

```bash
# In the project root
npx react-native run-android
```

---

## 🔑 Environment Variables

Create a file at `server/.env.local`:

```env
# MongoDB
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/bingoping

# JWT
JWT_SECRET=your_jwt_secret_here

# Email (Nodemailer)
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password

# Server
PORT=5000
```

And update `src/config/backend.js` in the frontend:

```js
export const BACKEND_URL = "http://YOUR_LOCAL_IP:5000";
// e.g. "http://192.168.1.10:5000"
```

> Use your machine's local IP (not `localhost`) so your Android device/emulator can reach the server.

---

## 📡 API Reference

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/signup` | ❌ | Register a new user |
| `POST` | `/api/auth/login` | ❌ | Login, returns JWT |
| `POST` | `/api/auth/getuser` | ✅ | Get logged-in user data |
| `POST` | `/api/auth/update-profile` | ✅ | Update username or bio |
| `POST` | `/api/auth/change-avatar` | ✅ | Change avatar, resets stats |
| `PUT`  | `/api/auth/change-password` | ✅ | Change password (requires current) |
| `POST` | `/api/auth/forgot-password` | ❌ | Send OTP to email |
| `POST` | `/api/auth/verify-otp` | ❌ | Verify OTP code |
| `PUT`  | `/api/auth/reset-password` | ❌ | Set new password after OTP |
| `DELETE` | `/api/auth/delete-account` | ✅ | Permanently delete account |
| `POST` | `/api/auth/save-fcm-token` | ✅ | Save push notification token |

### Games

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/games/update-progress` | ✅ | Update XP, level, stars after a game |
| `GET`  | `/api/games/gamehistory` | ✅ | Fetch completed game history |

### Other

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET/POST` | `/api/chat/*` | Chat management |
| `GET/POST` | `/api/messages/*` | Message CRUD |
| `GET/POST` | `/api/rooms/*` | Room management |
| `GET/POST` | `/api/notifications/*` | Notification management |
| `POST` | `/api/spin` | Daily spin reward |

---

## 🔌 Socket Events

### Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `join_room` | `{ roomCode, userId, username, avatar, gameType }` | Join a game room |
| `check_rejoin` | `{ userId }` | Check for an ongoing game to rejoin |
| `select_number` | `{ roomCode, number }` | Pick a number on your turn |
| `use_power` | `{ roomCode, userId, power, targetId?, number? }` | Activate a power |
| `game_end` | `{ roomCode, winnerId, gameType }` | Declare a winner |
| `find_match` | `{ userId, username, avatar, size, gameType, selectedPower }` | Enter matchmaking queue |
| `cancel_match` | `{ userId }` | Leave matchmaking queue |
| `create_private_room` | `{ size, userId, username, avatar, gameType, password? }` | Create a private room |
| `player_ready` | `{ roomCode, userId }` | Ready up for rematch |
| `send_message` | `{ roomCode, username, text }` | Send in-game chat message |
| `sendFriendRequest` | `{ receiverId, senderId, senderName, senderAvatar }` | Send a friend request notification |

### Server → Client

| Event | Description |
|-------|-------------|
| `turn_order` | Shuffled player order for the game |
| `current_turn` | Whose turn it is right now |
| `number_picked` | Updated list of all picked numbers |
| `show_results` | Game over — winner and losers |
| `rejoin_available` | Active game found for this user |
| `power_used` | A power was activated |
| `player_frozen` | A player was frozen |
| `mark_removed` | A player's mark was removed |
| `coil_trap_triggered` | Coil trap fired on a number pick |
| `match_found` | Matchmaking succeeded |
| `newNotification` | Real-time in-app notification |

---

## 📱 Screenshots

> *Add screenshots here once the app is production-ready.*

```
screens/
├── login.png
├── dashboard.png
├── game_classic.png
├── game_power.png
├── profile.png
├── leaderboard.png
└── chat.png
```

---

## 🗺️ Roadmap

- [ ] iOS support
- [ ] Spectator mode
- [ ] Voice chat during games
- [ ] Season pass and battle pass system
- [ ] Animated power effects
- [ ] In-app purchase for coin bundles
- [ ] Localization (Hindi, Spanish, Portuguese)
- [ ] Game replay viewer

---

## 🤝 Contributing

Contributions are welcome! Please open an issue first to discuss what you'd like to change.

1. Fork the repository
2. Create a feature branch — `git checkout -b feature/your-feature`
3. Commit your changes — `git commit -m "feat: add your feature"`
4. Push to the branch — `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

Built with ❤️ by the Bingo Bing team

</div>