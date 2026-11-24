
import "./skyAdventure.css";
import { useEffect, useState, useRef } from "react";
import type { ReactNode } from "react";

interface SkyAdventureGameProps {
  currentAngle: number;
  repCount: number;
  targetReps: number;
  targetAngle: number;
  isPaused: boolean;
  onTogglePause: () => void;
  currentHoldSeconds: number;
  holdProgressPercent: number;
  resetKey: number;
  onResetExercise: () => void;
  onStartGame?: () => void;
  children?: ReactNode;
}

export default function SkyAdventureGame({
  currentAngle,
  repCount,
  targetReps,
  targetAngle,
  isPaused,
  onTogglePause,
  currentHoldSeconds,
  holdProgressPercent,
  resetKey,
  onResetExercise,
  onStartGame,
  children,
}: SkyAdventureGameProps) {
  const [hasStarted, setHasStarted] = useState(false);

  // Diamond rewards are based on completed repetitions
  const [lastRewardedRep, setLastRewardedRep] = useState(0);

  const collectedDiamonds = Math.min(
    Math.max(repCount, 0),
    Math.max(targetReps, 0)
  );

  const selectedCharacter =
    localStorage.getItem("selectedCharacter");

  const [savedPosition, setSavedPosition] = useState({
    left: "10%",
    bottom: "10%",
  });

  const [message, setMessage] = useState("");
  const [showCompletionMessage, setShowCompletionMessage] =
    useState(false);

  // FULLSCREEN
  const gameRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await gameRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        document.fullscreenElement === gameRef.current
      );
    };

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );

    return () => {
      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  // START GAME
  const handleStartGame = () => {
    setHasStarted(true);
    onStartGame?.();
  };

  // AUTOMATIC REWARD MESSAGE REMOVAL
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage("");
    }, 2000);

    return () => clearTimeout(timer);
  }, [message]);

  // AWARD ONE DIAMOND FOR EVERY COMPLETED REP
  useEffect(() => {
    const completedReps = Math.min(
      Math.max(repCount, 0),
      Math.max(targetReps, 0)
    );

    if (completedReps > lastRewardedRep) {
      setLastRewardedRep(completedReps);

      setMessage(
        completedReps >= targetReps
          ? "🎉 Amazing! All Diamonds Collected!"
          : `Great Work! +1 💎 Diamond ${completedReps}/${targetReps}`
      );
    }
  }, [repCount, targetReps, lastRewardedRep]);

  // ALL DIAMONDS COLLECTED
  useEffect(() => {
    if (repCount >= targetReps && targetReps > 0) {
      setShowCompletionMessage(true);

      const timer = setTimeout(() => {
        setShowCompletionMessage(false);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [repCount, targetReps]);

  // CHARACTER MOVEMENT
  const progress = isPaused
    ? 0
    : Math.min(
        Math.max(currentAngle / targetAngle, 0),
        1
      );

  const characterPosition = isPaused
    ? savedPosition
    : {
        left: `${10 + progress * 70}%`,
        bottom: `${10 + progress * 55}%`,
      };

  useEffect(() => {
    if (!isPaused && hasStarted) {
      setSavedPosition(characterPosition);
    }
  }, [isPaused, currentAngle, hasStarted]);

  const safeHoldProgress = Math.min(
    Math.max(holdProgressPercent, 0),
    100
  );

  // RESET GAME
  const resetGameVisuals = () => {
    setLastRewardedRep(0);
    setMessage("");
    setShowCompletionMessage(false);
    setHasStarted(false);

    setSavedPosition({
      left: "10%",
      bottom: "10%",
    });
  };

  useEffect(() => {
    resetGameVisuals();
  }, [resetKey]);

  return (
    <div className="sky-game" ref={gameRef}>

      {/* =================================
          WELCOME SCREEN
      ================================= */}

      {!hasStarted && (
        <div className="game-welcome-screen">

          <div className="welcome-top">
            <span className="welcome-logo">
              ☁️ SKY ADVENTURE
            </span>

            <span className="welcome-level">
              LEVEL 01
            </span>
          </div>

          <div className="welcome-content">

            <span className="welcome-subtitle">
              YOUR FITNESS ADVENTURE STARTS HERE
            </span>

            <h1 className="welcome-title">
              Welcome to
              <span> Sky Adventure!</span>
            </h1>

            <p className="welcome-description">
              Move your arms, collect magical diamonds, and
              complete your shoulder exercises through an
              exciting sky adventure!
            </p>

            <div className="welcome-instructions">

              <div className="welcome-instruction-card">
                <span>💎</span>
                <p>Collect Diamonds</p>
              </div>

              <div className="welcome-instruction-card">
                <span>💪</span>
                <p>Move Your Arms</p>
              </div>

              <div className="welcome-instruction-card">
                <span>🏆</span>
                <p>Complete Targets</p>
              </div>
{/* HOW TO EARN DIAMONDS */}
<div className="game-instruction-strip">
  <strong>💎 How to Earn a Diamond</strong>

  <div className="instruction-steps">
    <span>💪 Raise to 90° or above and hold for 3 sec</span>
    <span>⬆️ Raise to 120° and hold for 3 sec</span>
    <span>↩️ Lower your arm below 90°</span>
    <span>💎 Earn 1 Diamond!</span>
  </div>
</div>
            </div>

            <button
              className="welcome-start-button"
              onClick={handleStartGame}
            >
              START GAME <span>▶</span>
            </button>

            <p className="welcome-footer">
              Get ready, Explorer! Your adventure awaits ✨
            </p>

          </div>

          <button
            className="welcome-fullscreen-button"
            onClick={toggleFullscreen}
          >
            ⛶ {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>

        </div>
      )}

      {/* =================================
          ACTUAL GAME SCREEN
      ================================= */}

      {hasStarted && (
        <div className="game-main-layout">

          {/* LEFT SIDEBAR */}
          <aside className="game-sidebar">

            <div className="sidebar-heading">
              <span>☁️</span>
              <div>
                <strong>SKY ADVENTURE</strong>
                <small>Exercise Dashboard</small>
              </div>
            </div>

            {/* CAMERA, RESULTS AND HISTORY */}
            <div className="game-sidebar-content">
              {children}
            </div>

            {/* GAME PROGRESS */}
            <div className="sidebar-game-progress">

              <h4>💎 Diamond Collection</h4>

              <div className="sidebar-diamonds">
                {Array.from(
                  { length: Math.max(0, targetReps) },
                  (_, index) => index + 1
                ).map((diamond) => (
                  <div
                    key={diamond}
                    className={
                      diamond <= collectedDiamonds
                        ? "sidebar-diamond collected-diamond"
                        : "sidebar-diamond pending-diamond"
                    }
                  >
                    💎
                    <small>{diamond}</small>
                  </div>
                ))}
              </div>

              <p>
                {collectedDiamonds} / {targetReps} Diamonds
              </p>

            </div>

            {/* SIDEBAR CONTROLS */}
            <div className="sidebar-controls">

              <button
                onClick={onTogglePause}
                className="sidebar-pause-button"
              >
                {isPaused ? "▶ Resume Game" : "⏸ Pause Game"}
              </button>

              <button
                onClick={onResetExercise}
                className="sidebar-reset-button"
              >
                ↻ Reset Game
              </button>

              <button
                onClick={toggleFullscreen}
                className="sidebar-fullscreen-button"
              >
                {isFullscreen
                  ? "✕ Exit Fullscreen"
                  : "⛶ Fullscreen"}
              </button>

            </div>

          </aside>

          {/* RIGHT MAIN GAME AREA */}
          <main className="game-play-area">

            {/* GAME HEADER */}
            <div className="game-topbar">

              <div>
                <h2>Sky Adventure</h2>
                <span>
                  Collect diamonds and reach your goal!
                </span>
              </div>

              <div className="game-level-badge">
                ⭐ LEVEL 01
              </div>

            </div>

            {/* GAME INFORMATION */}
            <div className="game-information">
      <div className="game-info-card repetition-card">

                <div className="info-item">
                  <span>Repetitions</span>
                  <strong>
                    {repCount} / {targetReps}
                  </strong>
                </div>

                <div className="info-divider"></div>

                <div className="info-item">
                  <span>Shoulder Angle</span>
                  <strong>
                    {Math.round(currentAngle)}°
                  </strong>
                </div>

              </div>

              <div className="game-info-card hold-progress-card">

                <div className="info-heading">
                  <span>Hold Progress</span>
                  <strong>
                    {currentHoldSeconds.toFixed(1)} / 3.0 sec
                  </strong>
                </div>

                <div className="hold-progress-track">
                  <div
                    className="hold-progress-fill"
                    style={{
                      width: `${safeHoldProgress}%`,
                    }}
                  />
                </div>

                <span className="hold-progress-label">
                  Keep your arm steady!
                </span>

              </div>

        
            </div>

            {/* GAME WORLD */}
            <div className="sky-game-world">

              <div className="floating-island island-one"></div>
              <div className="floating-island island-two"></div>
              <div className="floating-island island-three"></div>

              {/* DIAMONDS - ONE FOR EACH REP */}
              {Array.from(
                { length: Math.max(0, targetReps) },
                (_, index) => index + 1
              ).map((diamond) => (
                <div
                  key={diamond}
                  className={`diamond diamond-${diamond}`}
                  style={{
                    left: `${7 + (diamond - 1) * 8.5}%`,
                    top: `${20 + (diamond % 2) * 12}%`,
                    animation:
                      diamond <= collectedDiamonds
                        ? "diamond-collect 0.5s ease forwards"
                        : "diamond-float 2s ease-in-out infinite alternate",
                  }}
                >
                  <span className="checkpoint-label">
                    {diamond}
                  </span>
                  💎
                </div>
              ))}

              {/* COMPLETION MESSAGE */}
              {showCompletionMessage && (
                <div className="diamond-complete-message">
                  🎉 Amazing! All {targetReps} Diamonds Collected!
                  <p>Excellent Work, Explorer! 🏆</p>
                </div>
              )}

              {/* REWARD MESSAGE */}
              {message && (
                <div className="reward-message">
                  {message}
                </div>
              )}

              {/* PAUSE MESSAGE */}
              {isPaused && (
                <div className="game-paused-message">
                  <h2>⏸ Game Paused</h2>
                  <p>Take a short break!</p>
                </div>
              )}

              {/* CHARACTER */}
              <div
                className="sky-game-character"
                style={characterPosition}
              >
                {selectedCharacter === "super-girl"
                  ? "🦸‍♀️"
                  : "🦸"}
              </div>

            </div>

            {/* GAME FOOTER */}
            <div className="game-bottom-bar">

              <span>
                💎 {collectedDiamonds} / {targetReps} Collected
              </span>

              <span>
                🏆 {repCount} / {targetReps} Repetitions
              </span>

              <span>
                {isPaused ? "Paused" : "Game Active"}
              </span>

            </div>

          </main>

        </div>
      )}

    </div>
  );
}
