
import type { Landmark } from "../services/tracking/types";

import type {
  ShoulderSide,
  ShoulderRepState,
  ShoulderRepLog,
  ShoulderArcAnalytics,
} from "./types";

export function calculateShoulderAngle(
  hip: Landmark,
  shoulder: Landmark,
  wrist: Landmark,
): number {
  const v1 = {
    x: hip.x - shoulder.x,
    y: hip.y - shoulder.y,
  };

  const v2 = {
    x: wrist.x - shoulder.x,
    y: wrist.y - shoulder.y,
  };

  const dot = v1.x * v2.x + v1.y * v2.y;

  const mag1 = Math.sqrt(v1.x * v1.x + v1.y * v1.y);
  const mag2 = Math.sqrt(v2.x * v2.x + v2.y * v2.y);

  if (mag1 === 0 || mag2 === 0) return 0;

  const cos = Math.max(-1, Math.min(1, dot / (mag1 * mag2)));

  return Math.round((Math.acos(cos) * 180) / Math.PI);
}

export function getReachedCheckpoints(angle: number): number[] {
  return [60, 90, 120].filter((checkpoint) => angle >= checkpoint);
}

export function calculateHoldProgress(holdTimeSeconds: number): number {
  const requiredHoldSeconds = 3;
  const progress = (holdTimeSeconds / requiredHoldSeconds) * 100;

  return Math.min(progress, 100);
}

export class ShoulderArcTracker {
  private requiredHoldSec = 3;
  private state: ShoulderRepState = "resting";

  private holdStartTime: number | null = null;
  private currentHoldSec = 0;
  private holdStage: 90 | 120 | null = null;

  private completedHoldStages: number[] = [];

  private currentAngle = 0;
  private peakAngle = 0;
  private repCounter = 0;

  private previousAngle: number | null = null;

  private pendingRepLog: ShoulderRepLog | null = null;
  private repsHistory: ShoulderRepLog[] = [];

  private readonly historyStorageKey =
    "shoulderArcRepetitionHistory";

  constructor() {
    const savedHistory = localStorage.getItem(this.historyStorageKey);

    if (savedHistory) {
      try {
        this.repsHistory = JSON.parse(savedHistory) as ShoulderRepLog[];
      } catch {
        this.repsHistory = [];
      }
    }
  }

  update(
    angle: number,
    side: ShoulderSide,
    targetAngle: number = 90,
  ): void {
    this.currentAngle = angle;

    const isRaising =
      this.previousAngle !== null && angle > this.previousAngle;

    const isLowering =
      this.previousAngle !== null && angle < this.previousAngle;

    this.previousAngle = angle;

    // RETURN TO RESTING POSITION
    if (angle < targetAngle) {
      this.holdStartTime = null;
      this.currentHoldSec = 0;
      this.holdStage = null;

      // Count repetition only after both holds are completed
      if (
        this.completedHoldStages.includes(90) &&
        this.completedHoldStages.includes(120) &&
        this.pendingRepLog
      ) {
        this.repCounter += 1;

        this.repsHistory.push(this.pendingRepLog);

        localStorage.setItem(
          this.historyStorageKey,
          JSON.stringify(this.repsHistory),
        );

        this.pendingRepLog = null;
        this.state = "completed";
      } else {
        this.state = angle <= 10 ? "resting" : "lowering";
      }

      this.completedHoldStages = [];
      this.peakAngle = 0;

      return;
    }

    this.peakAngle = Math.max(this.peakAngle, angle);

    // STAGE 1: HOLD AT 90° FOR 3 SECONDS
    if (!this.completedHoldStages.includes(90)) {
      if (angle >= 90) {
        this.holdStage = 90;
        this.state = "holding";

        if (this.holdStartTime === null) {
          this.holdStartTime = Date.now();
        }

        this.currentHoldSec =
          (Date.now() - this.holdStartTime) / 1000;

        if (this.currentHoldSec >= this.requiredHoldSec) {
          this.completedHoldStages.push(90);

          this.holdStartTime = null;
          this.currentHoldSec = 0;
          this.holdStage = null;

          this.state = "raising";
        }
      } else {
        this.holdStartTime = null;
        this.currentHoldSec = 0;
        this.holdStage = null;

        this.state = isRaising ? "raising" : "holding";
      }

      return;
    }

    // STAGE 2: HOLD AT 120° FOR 3 SECONDS
    if (!this.completedHoldStages.includes(120)) {
      if (angle >= 120) {
        this.holdStage = 120;
        this.state = "holding";

        if (this.holdStartTime === null) {
          this.holdStartTime = Date.now();
        }

        this.currentHoldSec =
          (Date.now() - this.holdStartTime) / 1000;

        if (this.currentHoldSec >= this.requiredHoldSec) {
          this.completedHoldStages.push(120);

          // Save completed repetition details.
          // Actual count increases after returning to resting position.
          this.pendingRepLog = {
            id: `${Date.now()}`,
            side,
            peakAngle: this.peakAngle,
            holdTimeSeconds: 6,
            checkpointsReached: [60, 90, 120],
            timestamp: Date.now(),
          };

          this.holdStartTime = null;
          this.currentHoldSec = 0;
          this.holdStage = null;

          this.state = "lowering";
        }
      } else {
        this.holdStartTime = null;
        this.currentHoldSec = 0;
        this.holdStage = null;

        this.state = isLowering ? "lowering" : "raising";
      }
    }
  }

  pause(): void {
    this.state = "resting";
    this.holdStartTime = null;
    this.currentHoldSec = 0;
    this.previousAngle = null;
  }

  getAnalytics(
    side: ShoulderSide,
    targetReps: number = 10,
  ): ShoulderArcAnalytics {
    return {
      activeSide: side,
      currentAngle: this.currentAngle,
      peakAngle: this.peakAngle,
      currentHoldSeconds: this.currentHoldSec,

      holdProgressPercent: calculateHoldProgress(
        this.currentHoldSec,
      ),

      repCount: this.repCounter,
      targetReps,
      repState: this.state,

      holdStage: this.holdStage,

      completedHoldStages: [...this.completedHoldStages],

      checkpoints: [60, 90, 120].map((angle) => ({
        angle,
        collected: getReachedCheckpoints(this.peakAngle).includes(angle),
      })),

      history: [...this.repsHistory],

      feedbackMessage:
        this.state === "holding"
          ? `Hold your arm at ${this.holdStage}°`
          : this.state === "completed"
            ? "Great! Repetition completed. 💎"
            : this.state === "lowering"
              ? "Slowly lower your arm"
              : this.state === "raising"
                ? "Keep raising your arm"
                : "Rest and get ready",
    };
  }

  reset(): void {
    this.state = "resting";

    this.holdStartTime = null;
    this.currentHoldSec = 0;
    this.holdStage = null;

    this.completedHoldStages = [];

    this.currentAngle = 0;
    this.peakAngle = 0;
    this.repCounter = 0;

    this.previousAngle = null;
    this.pendingRepLog = null;
  }
}
