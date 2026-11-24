
import { useEffect, useRef, useState } from "react";

import CharacterSelection from "./CharacterSelection";
import SkyAdventureGame from "./SkyAdventureGame";

import { useCamera } from "../hooks/useCamera";
import { useTracker } from "../hooks/useTracker";

import {
  calculateShoulderAngle,
  ShoulderArcTracker,
} from "./analytics";

import type {
  ShoulderSide,
  ShoulderArcAnalytics,
} from "./types";

import "./shoulderArc.css";

function ShoulderClockArc({ angle = 0 }: { angle: number }) {
  const progress = Math.min(Math.max(angle, 0), 180);

  const radius = 100;
  const circumference = Math.PI * radius;

  const progressOffset =
    circumference - (progress / 180) * circumference;

  const checkpointPosition = (value: number) => {
    const radians = (180 - value) * (Math.PI / 180);

    return {
      x: 150 + radius * Math.cos(radians),
      y: 150 - radius * Math.sin(radians),
    };
  };

  return (
    <div className="shoulder-arc-visual">
      <svg
        className="shoulder-arc-svg"
        viewBox="0 0 300 180"
        role="img"
        aria-label={`Shoulder angle ${angle} degrees`}
      >
        <path
          className="shoulder-arc-track"
          d="M 50 150 A 100 100 0 0 1 250 150"
        />

        <path
          className="shoulder-arc-progress"
          d="M 50 150 A 100 100 0 0 1 250 150"
          strokeDasharray={circumference}
          strokeDashoffset={progressOffset}
        />

        {[60, 90, 120].map((checkpoint) => {
          const position = checkpointPosition(checkpoint);

          return (
            <g key={checkpoint}>
              <circle
                className={`shoulder-arc-checkpoint ${
                  angle >= checkpoint ? "reached" : ""
                }`}
                cx={position.x}
                cy={position.y}
                r="7"
              />

              <text
                className="shoulder-arc-label"
                x={position.x}
                y={position.y - 14}
              >
                {checkpoint}°
              </text>
            </g>
          );
        })}

        <text
          x="150"
          y="125"
          className="shoulder-arc-angle"
        >
          {Math.round(angle)}°
        </text>
      </svg>
    </div>
  );
}

export default function ShoulderArcModule() {
  // CHARACTER SELECTION
  const [selectedCharacter, setSelectedCharacter] =
    useState<string | null>(() =>
      localStorage.getItem("selectedCharacter")
    );

  // EXERCISE START
  const [isExerciseStarted, setIsExerciseStarted] =
    useState(false);

  const handleCharacterSelect = (character: string) => {
    setSelectedCharacter(character);
    localStorage.setItem("selectedCharacter", character);
  };

  // CAMERA REFERENCES
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // EXERCISE STATE
  const [selectedSide, setSelectedSide] =
    useState<ShoulderSide>("left");

  const [analytics, setAnalytics] =
    useState<ShoulderArcAnalytics | null>(null);

  const [showHistory, setShowHistory] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gameResetKey, setGameResetKey] = useState(0);

  const trackerRef = useRef<ShoulderArcTracker>(
    new ShoulderArcTracker()
  );

  // CAMERA
  const camera = useCamera(videoRef);

  // INITIAL ANALYTICS
  useEffect(() => {
    setAnalytics(
      trackerRef.current.getAnalytics(selectedSide, 10)
    );
  }, [selectedSide]);

  // START EXERCISE
  const handleStartExercise = () => {
    setIsExerciseStarted(true);
    setIsPaused(false);

    camera.start();
  };

  // RESET EXERCISE AND GAME
  const handleResetExercise = () => {
    trackerRef.current.reset();

    setAnalytics(
      trackerRef.current.getAnalytics(selectedSide, 10)
    );

    setGameResetKey((previous) => previous + 1);

    setIsPaused(false);
    setIsExerciseStarted(false);
    setShowHistory(false);

    camera.stop();
  };

  // TRACKING
  const tracking = useTracker({
    videoRef,
    canvasRef,

    enabled:
      isExerciseStarted &&
      camera.status === "active" &&
      !isPaused,

    onFrame: (frame) => {
      if (!frame.pose || frame.pose.length < 33) return;

      const landmarks = frame.pose;

      // LEFT SHOULDER
      const leftHip = landmarks[23];
      const leftShoulder = landmarks[11];
      const leftWrist = landmarks[15];

      // RIGHT SHOULDER
      const rightHip = landmarks[24];
      const rightShoulder = landmarks[12];
      const rightWrist = landmarks[16];

      // CALCULATE ANGLES
      const leftAngle = calculateShoulderAngle(
        leftHip,
        leftShoulder,
        leftWrist
      );

      const rightAngle = calculateShoulderAngle(
        rightHip,
        rightShoulder,
        rightWrist
      );

      // SELECT ACTIVE SHOULDER
      const currentAngle =
        selectedSide.toLowerCase() === "left"
          ? leftAngle
          : rightAngle;

      // UPDATE TRACKER
      trackerRef.current.update(
        currentAngle,
        selectedSide,
        90
      );

      setAnalytics(
        trackerRef.current.getAnalytics(selectedSide, 10)
      );
    },
  });

  // TRACKING DEBUG
  useEffect(() => {
    console.log("Tracking Status:", tracking.status);
    console.log("Tracking Error:", tracking.error);
    console.log(
      "Detected Pose:",
      tracking.frame?.pose?.length
    );
  }, [
    tracking.status,
    tracking.error,
    tracking.frame,
  ]);

  // PAUSE AND RESUME
  const handleTogglePause = () => {
    if (!isPaused) {
      trackerRef.current.pause();
    }

    setIsPaused((previous) => !previous);
  };

  return (
    <div className="shoulder-arc-container">

      {!selectedCharacter ? (
        <CharacterSelection
          onSelect={handleCharacterSelect}
        />
      ) : (
        <SkyAdventureGame
          currentAngle={analytics?.currentAngle ?? 0}
          repCount={analytics?.repCount ?? 0}
          targetReps={analytics?.targetReps ?? 10}
          targetAngle={90}
          isPaused={isPaused}
          onTogglePause={handleTogglePause}
          currentHoldSeconds={
            analytics?.currentHoldSeconds ?? 0
          }
          holdProgressPercent={
            analytics?.holdProgressPercent ?? 0
          }
          resetKey={gameResetKey}
          onResetExercise={handleResetExercise}
          onStartGame={handleStartExercise}
        >

          {isExerciseStarted && (
            <>

              {/* =================================
                  1. EXERCISE RESULTS - TOP
              ================================= */}

              <div className="game-results-panel">

                <h3>📊 Exercise Results</h3>

                <ShoulderClockArc
                  angle={analytics?.currentAngle ?? 0}
                />

                <div className="game-result-details">

                  <p>
                    Peak Angle:
                    <strong>
                      {analytics?.peakAngle ?? 0}°
                    </strong>
                  </p>

                  <p>
                    Hold Time:
                    <strong>
                      {(analytics?.currentHoldSeconds ?? 0).toFixed(1)} sec
                    </strong>
                  </p>

                  <p>
                    Repetitions:
                    <strong>
                      {analytics?.repCount ?? 0} /{" "}
                      {analytics?.targetReps ?? 10}
                    </strong>
                  </p>

                  <p>
                    Exercise:
                    <strong>
                      {analytics?.repState ?? "resting"}
                    </strong>
                  </p>

                </div>

                <p>
                  {analytics?.feedbackMessage ??
                    "Start the exercise and get ready"}
                </p>

                {analytics &&
                  analytics.repCount >= analytics.targetReps && (
                    <div className="target-completed">
                      🎉 Target completed!
                    </div>
                  )}

              </div>

              {/* =================================
                  2. LIVE CAMERA PANEL
              ================================= */}

              <div className="game-camera-panel">

                <div className="shoulder-arc-camera">
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                  />

                  <canvas ref={canvasRef} />
                </div>

                <span className="camera-status">
                  📷 Camera: {camera.status}
                </span>

                {camera.status !== "active" && (
                  <button
                    onClick={() => camera.start()}
                    disabled={camera.status === "starting"}
                  >
                    {camera.status === "starting"
                      ? "Starting..."
                      : "Retry Camera"}
                  </button>
                )}

                {camera.error && (
                  <p>{camera.error.message}</p>
                )}

                <div className="game-camera-controls">
                  <button
                    onClick={() => setSelectedSide("left")}
                    disabled={isPaused}
                  >
                    Left
                  </button>

                  <button
                    onClick={() => setSelectedSide("right")}
                    disabled={isPaused}
                  >
                    Right
                  </button>
                </div>

                <span>
                  Selected: {selectedSide} shoulder
                </span>

              </div>

              {/* =================================
                  3. EXERCISE HISTORY PANEL
              ================================= */}

              <div className="game-history-panel">

                <button
                  className="history-toggle"
                  onClick={() =>
                    setShowHistory((previous) => !previous)
                  }
                >
                  📋 Exercise History

                  <span>
                    {showHistory ? "▲" : "▼"}
                  </span>
                </button>

                {showHistory && (
                  <div className="history-content">

                    {analytics?.history.length ? (
                      [...analytics.history]
                        .sort(
                          (a, b) => b.timestamp - a.timestamp
                        )
                        .map((rep) => (
                          <div
                            key={rep.id}
                            className="repetition-history-item"
                          >
                            <p>{rep.side} Shoulder</p>

                            <p>
                              Peak Angle: {rep.peakAngle}°
                            </p>

                            <p>
                              Hold: {rep.holdTimeSeconds.toFixed(1)} sec
                            </p>

                            <p>
                              Date:{" "}
                              {new Date(
                                rep.timestamp
                              ).toLocaleDateString("en-IN")}
                            </p>
                          </div>
                        ))
                    ) : (
                      <p>No repetitions completed yet.</p>
                    )}

                  </div>
                )}

              </div>

            </>
          )}

        </SkyAdventureGame>
      )}

    </div>
  );
}
