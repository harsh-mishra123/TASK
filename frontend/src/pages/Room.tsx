import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createSocket } from "../socket/socket";
import VideoPlayer from "../components/VideoPlayer";
import Chat from "../components/Chat";
import Participants from "../components/Participants";
import { useAuth } from "../context/AuthContext";

function extractVideoId(input: string): string | null {
  // Already a raw video ID (11 chars)
  if (/^[a-zA-Z0-9_-]{11}$/.test(input.trim())) {
    return input.trim();
  }

  try {
    const url = new URL(input);

    // youtube.com/watch?v=ID
    if (url.hostname.includes("youtube.com")) {
      return url.searchParams.get("v");
    }

    // youtu.be/ID
    if (url.hostname === "youtu.be") {
      return url.pathname.slice(1) || null;
    }
  } catch {
    // Not a valid URL
  }

  return null;
}

export default function Room() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const { token, username, logout } = useAuth();

  const socketRef = useRef<any>(null);

  const [videoId, setVideoId] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [participants, setParticipants] = useState<any[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [typingUser, setTypingUser] = useState("");
  const [role, setRole] = useState<"host" | "moderator" | "user">("user");

  useEffect(() => {
    if (!roomCode || !token) return;

    const socket = createSocket(token);
    socketRef.current = socket;

    socket.emit("join-room", { roomCode });

    socket.on("initial-state", (data: any) => {
      setVideoId(data.currentVideoId || "");
      setMessages(data.messages || []);
      setParticipants(data.participants || []);

      const me = data.participants?.find(
        (p: any) => p.username === username
      );
      if (me) setRole(me.role);
    });

    socket.on("participants-update", (updated: any[]) => {
      setParticipants(updated);
      const me = updated.find((p) => p.username === username);
      if (me) setRole(me.role);
    });

    socket.on("sync-update", (updates: any) => {
      if (updates.currentVideoId !== undefined) {
        setVideoId(updates.currentVideoId);
      }
    });

    socket.on("receive-message", (newMessage: any) => {
      setMessages((prev) => [...prev, newMessage]);
    });

    socket.on("user-typing", ({ username }: any) => {
      setTypingUser(username);
    });

    socket.on("user-stop-typing", () => {
      setTypingUser("");
    });

    socket.on("user-removed", ({ username: removedUser }: any) => {
      if (removedUser === username) {
        alert("You have been removed from the room by the host.");
        navigate("/dashboard");
      }
    });

    return () => {
      socket.removeAllListeners();
      socket.disconnect();
    };
  }, [roomCode, token, username, navigate]);

  const handleChangeVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socketRef.current || !videoUrl.trim()) return;

    const id = extractVideoId(videoUrl.trim());
    if (!id) {
      alert("Invalid YouTube URL. Try pasting a full YouTube link or video ID.");
      return;
    }

    socketRef.current.emit("change-video", { videoId: id });
    setVideoUrl("");
  };

  const handleTransferHost = (targetUsername: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit("transfer-host", {
      roomCode,
      username: targetUsername,
    });
  };

  const handleAssignModerator = (targetUsername: string) => {
    if (!socketRef.current) return;
    socketRef.current.emit("assign-moderator", {
      roomCode,
      targetUsername,
    });
  };

  const handleRemoveParticipant = (targetUsername: string) => {
    if (!socketRef.current) return;
    if (!confirm(`Remove ${targetUsername} from the room?`)) return;
    socketRef.current.emit("remove-participant", {
      roomCode,
      targetUsername,
    });
  };

  const isHost = role === "host";

  if (!token) return null;

  return (
    <div className="room-page">
      {/* Top Bar */}
      <div className="room-topbar">
        <div className="room-topbar-left">
          <h1>Room</h1>
          <span className="room-code-badge">
            <span style={{ opacity: 0.6, fontSize: "11px" }}>CODE</span>
            {roomCode}
          </span>
        </div>

        <div className="room-topbar-actions">
          <button
            className="btn btn-ghost"
            onClick={() => navigate("/dashboard")}
          >
            ← Leave
          </button>
          <button
            className="btn btn-danger"
            onClick={() => { logout(); navigate("/"); }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Layout */}
      <div className="room-layout">
        <div className="video-section">
          {/* Video URL Input — Host/Moderator only */}
          {(role === "host" || role === "moderator") && (
            <form className="video-url-bar" onSubmit={handleChangeVideo}>
              <input
                type="text"
                placeholder="Paste a YouTube URL to play..."
                className="input-field"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">
                ▶ Load Video
              </button>
            </form>
          )}

          <VideoPlayer
            videoId={videoId}
            socket={socketRef.current}
            role={role}
          />
        </div>

        <div className="room-sidebar">
          <Participants
            participants={participants}
            currentUsername={username}
            isHost={isHost}
            role={role}
            onTransferHost={handleTransferHost}
            onAssignModerator={handleAssignModerator}
            onRemoveParticipant={handleRemoveParticipant}
          />

          <Chat
            messages={messages}
            messageInput={messageInput}
            setMessageInput={setMessageInput}
            socket={socketRef.current}
            typingUser={typingUser}
          />
        </div>
      </div>
    </div>
  );
}