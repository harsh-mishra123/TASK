# 🎬 WatchParty — YouTube Watch Party

A real-time synchronized YouTube video watching platform. Create a room, share the code, and watch videos together with friends — perfectly in sync.

![WatchParty](https://img.shields.io/badge/WatchParty-Live-7c3aed?style=for-the-badge)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-010101?style=flat-square&logo=socketdotio&logoColor=white)

---

## ✨ Features

- **Synchronized Playback** — Play, pause, seek, and fast-forward in real time. Every participant stays at the exact same timestamp.
- **Room System** — Create private rooms with auto-generated 6-character codes. Share the code to invite friends.
- **Role-Based Access Control**
  - **Host** — Full control: play/pause/seek video, load new videos, assign moderators, remove participants, transfer host.
  - **Moderator** — Can control video playback (play/pause/seek/load videos).
  - **User** — View-only. Cannot interact with the video player.
- **YouTube URL Paste** — Paste any YouTube URL (`youtube.com/watch?v=...`, `youtu.be/...`, or raw video ID) to load a video.
- **Live Chat** — Real-time messaging with typing indicators.
- **Participant Management** — See who's in the room, their roles, and manage them (host-only).
- **Auto Seek Detection** — When the host seeks/fast-forwards, all participants automatically jump to the same position.
- **JWT Authentication** — Secure user registration and login.

---

## 🛠️ Tech Stack

| Layer      | Technology                                                                 |
| ---------- | -------------------------------------------------------------------------- |
| **Frontend** | React 19, TypeScript, Vite, React Router, react-youtube, Socket.IO Client |
| **Backend**  | Node.js, Express 5, Socket.IO, Mongoose, JWT, bcryptjs                   |
| **Database** | MongoDB Atlas                                                             |
| **Styling**  | Vanilla CSS with custom design system (dark theme, glassmorphism)         |

---

## 📁 Project Structure

```
yt-video-sync/
├── backend/
│   ├── src/
│   │   ├── config/         # DB connection, socket initialization
│   │   ├── controllers/    # Auth & room HTTP controllers
│   │   ├── middleware/      # JWT auth middleware
│   │   ├── models/          # Mongoose schemas (Room, User)
│   │   ├── routes/          # Express routes
│   │   ├── services/        # Business logic (auth, room, socket)
│   │   ├── utils/           # Room code generator
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # HTTP + Socket.IO server
│   ├── .env                 # Environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios instance with JWT interceptor
│   │   ├── components/      # VideoPlayer, Chat, Participants, ProtectedRoute
│   │   ├── context/         # AuthContext (token + username)
│   │   ├── pages/           # Login, Register, Dashboard, Room
│   │   ├── socket/          # Socket.IO client factory
│   │   ├── styles/          # CSS design tokens
│   │   ├── App.tsx          # Router setup
│   │   ├── main.tsx         # Entry point
│   │   └── index.css        # Global design system
│   ├── index.html
│   └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **npm** or **yarn**
- **MongoDB** (Atlas or local)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/yt-video-sync.git
cd yt-video-sync
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5555
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/watchparty
JWT_SECRET=your_jwt_secret_here
```

Start the backend:

```bash
npm run dev
```

### 3. Setup Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend will open at `http://localhost:5173` (or the next available port).

---

## 🎮 How to Use

1. **Register** — Create an account on the registration page.
2. **Login** — Sign in with your credentials.
3. **Create a Room** — Click "Create Room" on the dashboard. A unique 6-character code is generated.
4. **Share the Code** — Send the room code to your friends.
5. **Join a Room** — Friends enter the code on their dashboard and click "Join Room".
6. **Load a Video** — The host pastes a YouTube URL in the input bar and clicks "Load Video".
7. **Watch Together** — Play, pause, seek — everything syncs in real time!
8. **Chat** — Use the chat panel to talk while watching.

---

## 🔐 Role Permissions

| Action              | Host | Moderator | User |
| ------------------- | :--: | :-------: | :--: |
| Load video (URL)    |  ✅  |    ✅     |  ❌  |
| Play / Pause        |  ✅  |    ✅     |  ❌  |
| Seek / Fast-forward |  ✅  |    ✅     |  ❌  |
| Assign moderator    |  ✅  |    ❌     |  ❌  |
| Remove participant  |  ✅  |    ❌     |  ❌  |
| Transfer host       |  ✅  |    ❌     |  ❌  |
| Send chat messages  |  ✅  |    ✅     |  ✅  |

---

## 🔌 Socket Events

| Event                | Direction        | Description                           |
| -------------------- | ---------------- | ------------------------------------- |
| `join-room`          | Client → Server  | Join a room by code                   |
| `initial-state`      | Server → Client  | Full room state on join               |
| `change-video`       | Client → Server  | Load a new YouTube video              |
| `play` / `pause`     | Client → Server  | Playback control                      |
| `seek`               | Client → Server  | Seek to timestamp                     |
| `sync-update`        | Server → Clients | Broadcast playback changes            |
| `send-message`       | Client → Server  | Send a chat message                   |
| `receive-message`    | Server → Clients | Broadcast a chat message              |
| `typing`             | Client → Server  | Typing indicator start                |
| `participants-update`| Server → Clients | Updated participant list              |
| `assign-moderator`   | Client → Server  | Promote user to moderator (host only) |
| `remove-participant` | Client → Server  | Kick user from room (host only)       |
| `transfer-host`      | Client → Server  | Transfer host role (host only)        |

---

## 🎨 Design

- **Dark theme** with deep blacks and purple/indigo accent colors
- **Glassmorphism** cards with backdrop blur effects
- **Gradient accent** buttons with glow shadows
- **CSS animations** — slide-up, fade-in, floating orbs, typing dots
- **Responsive** — works on desktop and mobile

---

## 📜 API Endpoints

| Method | Endpoint             | Description         | Auth |
| ------ | -------------------- | ------------------- | :--: |
| POST   | `/api/auth/register` | Register a new user |  ❌  |
| POST   | `/api/auth/login`    | Login & get JWT     |  ❌  |
| POST   | `/api/rooms/create`  | Create a new room   |  ✅  |
| POST   | `/api/rooms/join`    | Join existing room  |  ✅  |

---

## 📝 License

ISC

---

<p align="center">
  Built with ❤️ by <strong>Harsh Mishra</strong>
</p>
