import type { ShoulderHoldStage, ShoulderRepState } from "./types";

interface AdventureHudProps {
  starsCollected: number;
  targetStars: number;
  currentAngle: number;
  repState: ShoulderRepState;
  holdStage: ShoulderHoldStage;
  completedHoldStages: number[];
  currentHoldSeconds: number;
  holdProgressPercent: number;
  isPaused: boolean;
  isFullscreen: boolean;
  onTogglePause: () => void;
  onReset: () => void;
  onToggleFullscreen: () => void;
}

type StageStatus = "done" | "active" | "upcoming";

function getAdventurePrompt(
  repState: ShoulderRepState,
  holdStage: ShoulderHoldStage,
  completedHoldStages: number[],
  isPaused: boolean,
): string {
  if (isPaused) {
    return "Adventure paused — take a breather!";
  }

  if (repState === "completed") {
    return "Star collected! Ready for the next flight! ⭐";
  }

  const has90 = completedHoldStages.includes(90);
  const has120 = completedHoldStages.includes(120);

  if (holdStage === 90) {
    return "Hold steady at the Cloud Gate!";
  }

  if (holdStage === 120) {
    return "Hold steady to pull the Magical Star!";
  }

  if (has90 && has120) {
    return "Swoop down below 90° to collect your Star!";
  }

  if (has90) {
    return "Gate unlocked! Soar to the 120° Star!";
  }

  if (repState === "resting") {
    return "Raise your arm to start flying!";
  }

  return "Fly up to the 90° Cloud Gate!";
}

function getStageStatuses(
  repState: ShoulderRepState,
  holdStage: ShoulderHoldStage,
  completedHoldStages: number[],
): { gate90: StageStatus; canopy120: StageStatus; collect: StageStatus } {
  if (repState === "completed") {
    return { gate90: "done", canopy120: "done", collect: "done" };
  }

  const has90 = completedHoldStages.includes(90);
  const has120 = completedHoldStages.includes(120);

  const gate90: StageStatus = has90
    ? "done"
    : holdStage === 90 ||
        repState === "raising" ||
        (repState === "holding" && holdStage === null)
      ? "active"
      : "upcoming";

  const canopy120: StageStatus = has120
    ? "done"
    : holdStage === 120 || has90
      ? "active"
      : "upcoming";

  const collect: StageStatus = has90 && has120 ? "active" : "upcoming";

  return { gate90, canopy120, collect };
}

export default function AdventureHud({
  starsCollected,
  targetStars,
  currentAngle,
  repState,
  holdStage,
  completedHoldStages,
  currentHoldSeconds,
  holdProgressPercent,
  isPaused,
  isFullscreen,
  onTogglePause,
  onReset,
  onToggleFullscreen,
}: AdventureHudProps) {
  const safeProgress = Math.min(Math.max(holdProgressPercent, 0), 100);
  const clampedStars = Math.min(
    Math.max(starsCollected, 0),
    Math.max(targetStars, 0),
  );
  const promptText = getAdventurePrompt(
    repState,
    holdStage,
    completedHoldStages,
    isPaused,
  );
  const stages = getStageStatuses(repState, holdStage, completedHoldStages);

  const stageItems: ReadonlyArray<{ label: string; status: StageStatus }> = [
    { label: "90° Cloud Gate", status: stages.gate90 },
    { label: "120° Star Canopy", status: stages.canopy120 },
    { label: "Collect Star", status: stages.collect },
  ];

  return (
    <header className="adventure-hud">
      <div className="adventure-hud-group">
        <div className="hud-pill hud-stars-pill">
          <span className="hud-star-icon" aria-hidden="true">
            ⭐
          </span>
          <div className="hud-metric">
            <span className="hud-metric-label">Magical Stars</span>
            <span className="hud-metric-value">
              {clampedStars} / {targetStars}
            </span>
          </div>
          <div className="hud-stars-row" aria-hidden="true">
            {Array.from({ length: Math.max(0, targetStars) }, (_, idx) => (
              <span
                key={idx}
                className={`hud-mini-star ${idx < clampedStars ? "collected" : ""}`}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <div className="hud-pill">
          <div className="hud-metric">
            <span className="hud-metric-label">Arm Angle</span>
            <span className="hud-metric-value">{Math.round(currentAngle)}°</span>
          </div>
        </div>
      </div>

      <div className="hud-pill hud-mission-pill">
        <div className="hud-mission-header">
          <span className="hud-mission-text">{promptText}</span>
          <span className="hud-hold-timer">
            {holdStage ? `${holdStage}° Hold: ` : "Hold: "}
            {currentHoldSeconds.toFixed(1)} / 3.0s
          </span>
        </div>

        <div className="hud-hold-track">
          <div
            className="hud-hold-fill"
            style={{ width: `${safeProgress}%` }}
          />
        </div>

        <div className="hud-stage-steps" aria-label="Adventure stage progress">
          {stageItems.map((item) => (
            <span
              key={item.label}
              className={`hud-stage-chip is-${item.status}`}
            >
              <span aria-hidden="true">
                {item.status === "done"
                  ? "✓"
                  : item.status === "active"
                    ? "●"
                    : "○"}
              </span>
              {item.label}
            </span>
          ))}
        </div>
      </div>

      <div className="adventure-hud-group">
        <button
          type="button"
          className="hud-btn hud-btn-pause"
          onClick={onTogglePause}
        >
          {isPaused ? "▶ Resume" : "⏸ Pause"}
        </button>

        <button
          type="button"
          className="hud-btn hud-btn-reset"
          onClick={onReset}
        >
          ↻ Reset
        </button>

        <button
          type="button"
          className="hud-btn"
          onClick={onToggleFullscreen}
        >
          {isFullscreen ? "✕ Exit" : "⛶ Fullscreen"}
        </button>
      </div>
    </header>
  );
}
