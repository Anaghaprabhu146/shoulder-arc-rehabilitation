
import { useEffect, useRef, useState } from "react";

import MagicalAdventureGame from "./MagicalAdventureGame";

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

export function ShoulderClockArc({ angle = 0 }: { angle: number }) {
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
    useState<string>(
      () => localStorage.getItem("selectedCharacter") || "super-hero"
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

  const [isPaused, setIsPaused] = useState(false);

  const trackerRef = useRef<ShoulderArcTracker>(
    new ShoulderArcTracker()
  );

  // Controls how often the UI updates
  const lastAnalyticsUpdateRef = useRef(0);
  const liveAngleRef = useRef(0);

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
    liveAngleRef.current = 0;

    setAnalytics(
      trackerRef.current.getAnalytics(selectedSide, 10)
    );

    setIsPaused(false);
    setIsExerciseStarted(false);

    camera.stop();
  };

  // TRACKING
  useTracker({
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

      liveAngleRef.current = currentAngle;

      // UPDATE TRACKER ON EVERY CAMERA FRAME
trackerRef.current.update(
  currentAngle,
  selectedSide,
  90
);


// UPDATE REACT UI ONLY EVERY 125ms
const now = performance.now();

if (now - lastAnalyticsUpdateRef.current >= 150) {
  lastAnalyticsUpdateRef.current = now;

  setAnalytics(
    trackerRef.current.getAnalytics(selectedSide, 10)
  );
}
    },
  });

  
  // PAUSE AND RESUME
  const handleTogglePause = () => {
    if (!isPaused) {
      trackerRef.current.pause();
    }

    setIsPaused((previous) => !previous);
  };

  return (
    <div className="shoulder-arc-container">
      <MagicalAdventureGame
        analytics={analytics}
        liveAngleRef={liveAngleRef}
        selectedCharacter={selectedCharacter}
        onSelectCharacter={handleCharacterSelect}
        selectedSide={selectedSide}
        onSelectSide={setSelectedSide}
        videoRef={videoRef}
        canvasRef={canvasRef}
        camera={camera}
        isExerciseStarted={isExerciseStarted}
        isPaused={isPaused}
        onTogglePause={handleTogglePause}
        onResetExercise={handleResetExercise}
        onStartGame={handleStartExercise}
      />
    </div>
  );
}
