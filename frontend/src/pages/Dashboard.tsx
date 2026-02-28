import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const navigate = useNavigate();
  const { username, logout } = useAuth();
  const [roomCode, setRoomCode] = useState("");
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await api.post("/rooms/create");
      navigate(`/room/${res.data.roomCode}`);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create room");
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomCode.trim()) return;
    setJoining(true);
    try {
      await api.post("/rooms/join", { roomCode });
      navigate(`/room/${roomCode}`);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to join room");
    } finally {
      setJoining(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-grid-bg" />

      {/* Navigation */}
      <nav className="dashboard-nav">
        <div className="nav-brand">
          <div className="nav-brand-icon">▶</div>
          <span className="nav-brand-text">WatchParty</span>
        </div>
        <div className="nav-actions">
          <span className="nav-user">
            Hey, <strong>{username}</strong>
          </span>
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      {/* Content */}
      <div className="dashboard-content">
        <div className="dashboard-hero">
          <h1>Watch together.</h1>
          <p>
            Create a private room or join an existing one to watch YouTube
            videos in perfect sync with your friends.
          </p>
        </div>

        <div className="dashboard-cards">
          {/* Create Room */}
          <div className="dashboard-card">
            <div className="card-icon">🚀</div>
            <h2>Create Room</h2>
            <p>
              Start a new synchronized watch party instantly. Share the room
              code with friends to invite them.
            </p>
            <button
              className="btn btn-primary btn-full"
              onClick={handleCreate}
              disabled={creating}
            >
              {creating ? "Creating..." : "Create Room"}
            </button>
          </div>

          {/* Join Room */}
          <div className="dashboard-card">
            <div className="card-icon join">🔗</div>
            <h2>Join Room</h2>
            <p>
              Enter a 6-character room code to join an existing watch party
              session.
            </p>
            <form onSubmit={handleJoin}>
              <div className="input-group" style={{ marginBottom: "12px" }}>
                <input
                  type="text"
                  placeholder="Enter room code"
                  className="input-field"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  style={{ textAlign: "center", letterSpacing: "3px", fontWeight: 600 }}
                />
              </div>
              <button
                type="submit"
                className="btn btn-secondary btn-full"
                disabled={joining || !roomCode.trim()}
              >
                {joining ? "Joining..." : "Join Room"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}