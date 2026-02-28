import { useRef, useEffect } from "react";

interface Props {
  messages: any[];
  messageInput: string;
  setMessageInput: (val: string) => void;
  socket: any;
  typingUser: string;
}

export default function Chat({
  messages,
  messageInput,
  setMessageInput,
  socket,
  typingUser,
}: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !socket) return;

    socket.emit("send-message", { text: messageInput.trim() });
    setMessageInput("");
    socket.emit("stop-typing");
  };

  const handleInputChange = (val: string) => {
    setMessageInput(val);

    if (!socket) return;

    socket.emit("typing");

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop-typing");
    }, 1000);
  };

  return (
    <div className="chat-section">
      <div className="chat-header">
        <h3>Chat</h3>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <p style={{ fontSize: "13px", color: "var(--text-muted)", textAlign: "center", marginTop: "32px" }}>
            No messages yet. Say hello! 👋
          </p>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className="chat-message">
            <div className="chat-message-sender">{msg.username}</div>
            <div className="chat-message-text">{msg.text}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-typing">
        {typingUser && (
          <>
            <span>{typingUser} is typing</span>
            <span className="typing-dots">
              <span />
              <span />
              <span />
            </span>
          </>
        )}
      </div>

      <form className="chat-input-bar" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Type a message..."
          value={messageInput}
          onChange={(e) => handleInputChange(e.target.value)}
        />
        <button type="submit" className="chat-send-btn">
          Send
        </button>
      </form>
    </div>
  );
}