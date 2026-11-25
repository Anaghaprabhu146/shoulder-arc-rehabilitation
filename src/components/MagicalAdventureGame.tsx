import { useEffect, useRef, useState, type RefObject } from "react";
import type { UseCamera } from "../hooks/useCamera";
import AdventureHud from "./AdventureHud";
import CameraPip from "./CameraPip";
import CharacterSelection from "./CharacterSelection";
import MagicalWorldCanvas from "./MagicalWorldCanvas";
import type { ShoulderArcAnalytics, ShoulderSide } from "./types";
import "./magicalAdventure.css";

interface MagicalAdventureGameProps {
  analytics: ShoulderArcAnalytics | null;
  liveAngleRef: RefObject<number>;
  selectedCharacter: string;
  onSelectCharacter: (character: string) => void;
  selectedSide: ShoulderSide;
  onSelectSide: (side: ShoulderSide) => void;
  videoRef: RefObject<HTMLVideoElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  camera: UseCamera;
  isExerciseStarted: boolean;
  isPaused: boolean;
  onTogglePause: () => void;
  onResetExercise: () => void;
  onStartGame: () => void;
}

export default function MagicalAdventureGame({
  analytics,
  liveAngleRef,
  selectedCharacter,
  onSelectCharacter,
  selectedSide,
  onSelectSide,
  videoRef,
  canvasRef,
  camera,
  isExerciseStarted,
  isPaused,
  onTogglePause,
  onResetExercise,
  onStartGame,
}: MagicalAdventureGameProps) {
  const gameRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [rewardMessage, setRewardMessage] = useState("");
  const lastRewardedRepRef = useRef(0);

  const repCount = analytics?.repCount ?? 0;
  const repState = analytics?.repState ?? "resting";
  const targetReps = analytics?.targetReps ?? 10;
  const currentAngle = analytics?.currentAngle ?? 0;
  const holdStage = analytics?.holdStage ?? null;
  const completedHoldStages = analytics?.completedHoldStages ?? [];
  const currentHoldSeconds = analytics?.currentHoldSeconds ?? 0;
  const holdProgressPercent = analytics?.holdProgressPercent ?? 0;

  // Show a short star reward toast only when ShoulderArcTracker increments repCount
  useEffect(() => {
    if (repCount === 0) {
      lastRewardedRepRef.current = 0;
      return;
    }

    if (repCount > lastRewardedRepRef.current) {
      lastRewardedRepRef.current = repCount;
      setRewardMessage(
        repCount >= targetReps
          ? "🌟 Amazing! All Magical Stars Collected!"
          : `⭐ +1 Magical Star! (${repCount}/${targetReps})`,
      );
    }
  }, [repCount, targetReps]);

  useEffect(() => {
    if (!rewardMessage) return;
    const timer = window.setTimeout(() => setRewardMessage(""), 2200);
    return () => window.clearTimeout(timer);
  }, [rewardMessage]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(document.fullscreenElement === gameRef.current);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

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

  return (
    <div className="magical-adventure" ref={gameRef}>
      <MagicalWorldCanvas
        liveAngleRef={liveAngleRef}
        repCount={repCount}
        targetReps={targetReps}
        repState={repState}
        holdStage={holdStage}
        holdProgressPercent={holdProgressPercent}
        selectedCharacter={selectedCharacter}
        isPaused={isPaused}
        isPlaying={isExerciseStarted}
      />

      {isExerciseStarted && (
        <AdventureHud
          starsCollected={repCount}
          targetStars={targetReps}
          currentAngle={currentAngle}
          repState={repState}
          holdStage={holdStage}
          completedHoldStages={completedHoldStages}
          currentHoldSeconds={currentHoldSeconds}
          holdProgressPercent={holdProgressPercent}
          isPaused={isPaused}
          isFullscreen={isFullscreen}
          onTogglePause={onTogglePause}
          onReset={onResetExercise}
          onToggleFullscreen={toggleFullscreen}
        />
      )}

      {/* Keep video & canvas mounted so camera.start() always has a DOM target */}
      <CameraPip
        videoRef={videoRef}
        canvasRef={canvasRef}
        camera={camera}
        selectedSide={selectedSide}
        onSelectSide={onSelectSide}
        isPaused={isPaused}
        visible={isExerciseStarted}
      />

      {rewardMessage && isExerciseStarted && (
        <div className="adventure-reward-toast" role="status">
          {rewardMessage}
        </div>
      )}

      {!isExerciseStarted && (
        <CharacterSelection
          selectedCharacter={selectedCharacter}
          onSelectCharacter={onSelectCharacter}
          selectedSide={selectedSide}
          onSelectSide={onSelectSide}
          isFullscreen={isFullscreen}
          onToggleFullscreen={toggleFullscreen}
          onStartAdventure={onStartGame}
        />
      )}

      {isExerciseStarted && isPaused && (
        <div className="adventure-overlay">
          <div className="adventure-card">
            <span className="adventure-badge">Resting</span>
            <h2 className="adventure-title">
              Adventure <span>Paused</span>
            </h2>
            <p className="adventure-subtitle">
              Take a comfortable breather. Your collected stars ({repCount} /{" "}
              {targetReps}) are safe!
            </p>
            <button
              type="button"
              className="adventure-primary-btn"
              onClick={onTogglePause}
            >
              ▶ Resume Adventure
            </button>
          </div>
        </div>
      )}

      {isExerciseStarted && !isPaused && repCount >= targetReps && (
        <div className="adventure-overlay">
          <div className="adventure-card">
            <span className="adventure-badge">Quest Complete</span>
            <h2 className="adventure-title">
              All <span>{targetReps} Stars</span> Collected!
            </h2>
            <p className="adventure-subtitle">
              Fantastic shoulder mobility work! Every stage and hold was
              recorded cleanly.
            </p>
            <button
              type="button"
              className="adventure-primary-btn"
              onClick={onResetExercise}
            >
              ↻ Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
