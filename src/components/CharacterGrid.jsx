export function CharacterGrid({ characters, onSelectCharacter, onCreateNew }) {
  return (
    <div className="content-wrapper">
      <div className="character-grid">
        {characters.map(char => (
          <div 
            key={char.id} 
            className="character-card" 
            style={{ backgroundColor: char.color }}
            onClick={() => onSelectCharacter(char)}
          >
            <div className="card-icon">👤</div>
            <div>{char.name}</div>
          </div>
        ))}
        
        <div className="character-card add-card" onClick={onCreateNew}>
          <div className="card-icon">➕</div>
          <div>Nuevo</div>
        </div>
      </div>
    </div>
  );
}
