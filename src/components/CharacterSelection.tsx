import type { ShoulderSide } from "./types";

interface CharacterSelectionProps {
  selectedCharacter: string;
  onSelectCharacter: (character: string) => void;
  selectedSide: ShoulderSide;
  onSelectSide: (side: ShoulderSide) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  onStartAdventure: () => void;
}

function HeroPortrait({ isGirl }: { isGirl: boolean }) {
  const palette = isGirl
    ? {
        tunic: "#a855f7",
        cape: "#f43f5e",
        hat: "#ec4899",
        glow: "#f9a8d4",
      }
    : {
        tunic: "#3b82f6",
        cape: "#f97316",
        hat: "#2563eb",
        glow: "#93c5fd",
      };

  return (
    <svg
      className="hero-portrait-svg"
      viewBox="0 0 110 110"
      aria-hidden="true"
    >
      <circle cx="55" cy="58" r="44" fill={palette.glow} fillOpacity="0.22" />

      {/* Cape */}
      <path
        d="M 42 58 Q 20 66 18 86 Q 38 82 48 74 Z"
        fill={palette.cape}
        stroke="#1e1b4b"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      {/* Cloud cushion */}
      <g fill="#ffffff" stroke="#60a5fa" strokeWidth="2.5">
        <circle cx="40" cy="90" r="8" />
        <circle cx="55" cy="88" r="11" />
        <circle cx="70" cy="90" r="8" />
      </g>

      {/* Tunic body */}
      <rect
        x="38"
        y="56"
        width="34"
        height="26"
        rx="12"
        fill={palette.tunic}
        stroke="#1e1b4b"
        strokeWidth="3"
      />

      {/* Golden collar */}
      <rect
        x="41"
        y="56"
        width="28"
        height="7"
        rx="3.5"
        fill="#fde047"
        stroke="#1e1b4b"
        strokeWidth="2.5"
      />

      {/* Head */}
      <circle
        cx="57"
        cy="44"
        r="17"
        fill="#fef3c7"
        stroke="#1e1b4b"
        strokeWidth="3"
      />

      {/* Cheeks */}
      <ellipse cx="48" cy="48" rx="3.5" ry="2.2" fill="#f472b6" fillOpacity="0.5" />
      <ellipse cx="67" cy="48" rx="3.5" ry="2.2" fill="#f472b6" fillOpacity="0.5" />

      {/* Eyes */}
      <ellipse cx="53" cy="42.5" rx="3.2" ry="4.2" fill="#1e1b4b" />
      <ellipse cx="64" cy="42.5" rx="3.2" ry="4.2" fill="#1e1b4b" />
      <circle cx="54" cy="40.8" r="1.3" fill="#ffffff" />
      <circle cx="65" cy="40.8" r="1.3" fill="#ffffff" />

      {/* Smile */}
      <path
        d="M 53 49 Q 58.5 54 64 49"
        fill="none"
        stroke="#1e1b4b"
        strokeWidth="2.3"
        strokeLinecap="round"
      />

      {/* Hat brim & cone */}
      <ellipse
        cx="56"
        cy="30"
        rx="20"
        ry="5.5"
        transform="rotate(-4 56 30)"
        fill={palette.hat}
        stroke="#1e1b4b"
        strokeWidth="2.8"
      />
      <path
        d="M 42 29 Q 46 8 34 15 Q 58 4 69 29 Z"
        fill={palette.hat}
        stroke="#1e1b4b"
        strokeWidth="2.8"
        strokeLinejoin="round"
      />

      {/* Star emblem */}
      <polygon
        points="57,16 59,20 63,20.5 60,23.5 60.8,27.5 57,25.5 53.2,27.5 54,23.5 51,20.5 55,20"
        fill="#fde047"
        stroke="#1e1b4b"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const HERO_OPTIONS = [
  {
    id: "super-girl",
    name: "Starlight Sprite",
    tagline: "Rose & Violet Mage",
    isGirl: true,
  },
  {
    id: "super-hero",
    name: "Sky Explorer",
    tagline: "Azure & Ember Adventurer",
    isGirl: false,
  },
] as const;

export default function CharacterSelection({
  selectedCharacter,
  onSelectCharacter,
  selectedSide,
  onSelectSide,
  isFullscreen,
  onToggleFullscreen,
  onStartAdventure,
}: CharacterSelectionProps) {
  return (
    <div className="adventure-overlay">
      <section className="adventure-card welcome-card" aria-label="Magical Adventure Welcome">
        <div className="welcome-header-row">
          <span className="adventure-badge">Shoulder Mobility Quest</span>
          <button
            type="button"
            className="hud-btn welcome-fs-btn"
            onClick={onToggleFullscreen}
          >
            {isFullscreen ? "✕ Exit Fullscreen" : "⛶ Fullscreen"}
          </button>
        </div>

        <h1 className="adventure-title">
          Magical <span>Adventure</span>
        </h1>

        <p className="adventure-subtitle">
          Raise your arm to guide your magical hero, collect stars and complete
          your adventure.
        </p>

        {/* Hero Selection */}
        <div className="welcome-section">
          <span className="welcome-section-label">1. Choose Your Hero</span>
          <div className="hero-grid" role="radiogroup" aria-label="Choose your hero">
            {HERO_OPTIONS.map((hero) => {
              const isSelected = selectedCharacter === hero.id;
              return (
                <button
                  key={hero.id}
                  type="button"
                  role="radio"
                  aria-checked={isSelected}
                  className={`hero-card ${isSelected ? "is-selected" : ""}`}
                  onClick={() => onSelectCharacter(hero.id)}
                >
                  {isSelected && <span className="hero-selected-tag">Selected</span>}
                  <HeroPortrait isGirl={hero.isGirl} />
                  <strong className="hero-card-name">{hero.name}</strong>
                  <span className="hero-card-tagline">{hero.tagline}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Left / Right Shoulder Selection */}
        <div className="welcome-section">
          <span className="welcome-section-label">2. Select Shoulder Side</span>
          <div className="shoulder-selector" role="radiogroup" aria-label="Select shoulder side">
            <button
              type="button"
              role="radio"
              aria-checked={selectedSide === "left"}
              className={`shoulder-choice-btn ${selectedSide === "left" ? "is-selected" : ""}`}
              onClick={() => onSelectSide("left")}
            >
              <span className="shoulder-choice-indicator" aria-hidden="true">
                {selectedSide === "left" ? "✓" : "○"}
              </span>
              Left Shoulder
            </button>

            <button
              type="button"
              role="radio"
              aria-checked={selectedSide === "right"}
              className={`shoulder-choice-btn ${selectedSide === "right" ? "is-selected" : ""}`}
              onClick={() => onSelectSide("right")}
            >
              <span className="shoulder-choice-indicator" aria-hidden="true">
                {selectedSide === "right" ? "✓" : "○"}
              </span>
              Right Shoulder
            </button>
          </div>
        </div>

        {/* How Movement Controls the Hero */}
        <div className="adventure-steps">
          <div className="adventure-step">
            <strong>Raise to 90°</strong>
            <span>Lifts your hero to the Cloud Gate (hold 3s)</span>
          </div>
          <div className="adventure-step">
            <strong>Soar to 120°</strong>
            <span>Reaches the Star Canopy (hold 3s)</span>
          </div>
          <div className="adventure-step">
            <strong>Lower Arm</strong>
            <span>Swoops down to collect +1 Magical Star</span>
          </div>
        </div>

        <button
          type="button"
          className="adventure-primary-btn welcome-start-btn"
          onClick={onStartAdventure}
        >
          ▶ Start Adventure
        </button>
      </section>
    </div>
  );
}
