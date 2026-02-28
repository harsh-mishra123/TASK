import YouTube from "react-youtube";
import { useRef, useEffect } from "react";

interface Props {
  videoId: string;
  socket: any;
  role: string;
}

export default function VideoPlayer({ videoId, socket, role }: Props) {
  const playerRef = useRef<any>(null);
  const isSyncingRef = useRef(false);
  const lastTimeRef = useRef(0);

  const canControl = role === "host" || role === "moderator";

  // Track time continuously so we can detect seeks
  useEffect(() => {
    if (!canControl) return;

    const interval = setInterval(() => {
      if (playerRef.current) {
        const currentTime = playerRef.current.getCurrentTime();
        if (currentTime !== undefined) {
          lastTimeRef.current = currentTime;
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, [canControl]);

  useEffect(() => {
    if (!socket) return;

    const handleSync = (updates: any) => {
      if (!playerRef.current) return;

      isSyncingRef.current = true;

      if (updates.isPlaying !== undefined) {
        if (updates.isPlaying) {
          playerRef.current.playVideo();
        } else {
          playerRef.current.pauseVideo();
        }
      }

      if (updates.currentTime !== undefined) {
        const current = playerRef.current.getCurrentTime();
        const diff = Math.abs(current - updates.currentTime);
        if (diff > 0.8) {
          playerRef.current.seekTo(updates.currentTime, true);
        }
      }

      setTimeout(() => {
        isSyncingRef.current = false;
      }, 500);
    };

    socket.on("sync-update", handleSync);

    return () => {
      socket.off("sync-update", handleSync);
    };
  }, [socket]);

  const handleReady = (event: any) => {
    playerRef.current = event.target;
  };

  const handlePlay = () => {
    if (!canControl || isSyncingRef.current) return;
    socket?.emit("play");
  };

  const handlePause = () => {
    if (!canControl || isSyncingRef.current) return;
    socket?.emit("pause");
  };

  // Detect seek via YouTube state changes
  // When user drags the progress bar, YouTube fires BUFFERING (state 3)
  // We compare current time to last tracked time to detect a jump
  const handleStateChange = (event: any) => {
    if (!canControl || isSyncingRef.current || !playerRef.current) return;

    const state = event.data;

    // YouTube states: BUFFERING = 3, PLAYING = 1
    // A seek triggers BUFFERING, then PLAYING
    if (state === 3 || state === 1) {
      const currentTime = playerRef.current.getCurrentTime();
      const timeDiff = Math.abs(currentTime - lastTimeRef.current);

      // If time jumped by more than 2 seconds, it's a seek
      if (timeDiff > 2) {
        socket?.emit("seek", { currentTime });
      }

      lastTimeRef.current = currentTime;
    }
  };

  return (
    <>
      <div className="video-container">
        {/* Block participant clicks with overlay */}
        {!canControl && videoId && <div className="video-overlay" />}

        {videoId ? (
          <YouTube
            videoId={videoId}
            onReady={handleReady}
            onPlay={handlePlay}
            onPause={handlePause}
            onStateChange={handleStateChange}
            className="youtube-player"
            iframeClassName="youtube-iframe"
            opts={{
              width: "100%",
              height: "100%",
              playerVars: {
                controls: canControl ? 1 : 0,
                disablekb: canControl ? 0 : 1,
                modestbranding: 1,
              },
            }}
          />
        ) : (
          <div className="video-empty">
            <span className="video-empty-icon">🎬</span>
            <p>No video selected yet</p>
            <p style={{ fontSize: "12px", opacity: 0.5 }}>
              {canControl
                ? "Paste a YouTube URL above to start watching"
                : "Waiting for the host to load a video..."}
            </p>
          </div>
        )}
      </div>

      {canControl && (
        <div className="video-controls">
          <button className="btn btn-primary" onClick={handlePlay}>
            ▶ Play
          </button>
          <button className="btn btn-secondary" onClick={handlePause}>
            ⏸ Pause
          </button>
          <button className="btn btn-secondary" onClick={() => {
            if (!playerRef.current) return;
            const currentTime = playerRef.current.getCurrentTime();
            socket?.emit("seek", { currentTime });
          }}>
            🔄 Sync Time
          </button>
        </div>
      )}
    </>
  );
}