interface Participant {
  username: string;
  role: "host" | "moderator" | "user";
}

interface Props {
  participants: Participant[];
  currentUsername: string | null;
  isHost: boolean;
  role: "host" | "moderator" | "user";
  onTransferHost: (username: string) => void;
  onAssignModerator: (username: string) => void;
  onRemoveParticipant: (username: string) => void;
}

export default function Participants({
  participants,
  currentUsername,
  isHost,
  onTransferHost,
  onAssignModerator,
  onRemoveParticipant,
}: Props) {
  return (
    <div className="participants-section">
      <div className="participants-header">
        <h3>Participants</h3>
        <span className="participants-count">{participants.length}</span>
      </div>

      <div className="participant-list">
        {participants.map((p, idx) => {
          const isMe = p.username === currentUsername;
          const initials = p.username.slice(0, 2).toUpperCase();

          return (
            <div
              key={idx}
              className={`participant-item${isMe ? " is-me" : ""}`}
            >
              <div className="participant-info">
                <div className={`participant-avatar ${p.role}`}>
                  {initials}
                </div>
                <span className="participant-name">
                  {p.username}
                  {isMe && <span className="participant-you">(You)</span>}
                </span>
              </div>

              <div className="participant-actions">
                <span className={`role-badge ${p.role}`}>
                  {p.role}
                </span>

                {/* Host controls — only show for non-self, non-host participants */}
                {isHost && !isMe && p.role !== "host" && (
                  <div className="host-controls">
                    {p.role !== "moderator" && (
                      <button
                        className="control-btn mod-btn"
                        onClick={() => onAssignModerator(p.username)}
                        title="Make Moderator"
                      >
                        ⭐
                      </button>
                    )}
                    <button
                      className="control-btn transfer-btn"
                      onClick={() => onTransferHost(p.username)}
                      title="Transfer Host"
                    >
                      👑
                    </button>
                    <button
                      className="control-btn remove-btn"
                      onClick={() => onRemoveParticipant(p.username)}
                      title="Remove from Room"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}