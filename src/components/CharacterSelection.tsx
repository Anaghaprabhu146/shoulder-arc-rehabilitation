interface CharacterSelectionProps {
  onSelect: (character: string) => void;
}

export default function CharacterSelection({
  onSelect,
}: CharacterSelectionProps) {
  return (
    <div className="character-selection">
      <h1>Sky Adventure</h1>
      <h2>Choose Your Hero!</h2>
      <div className="character-options">
  <button onClick={() => onSelect("super-girl")}>
    Super Girl
  </button>

  <button onClick={() => onSelect("super-hero")}>
    Super Hero
  </button>
</div>
    </div>
  );
}