export function RightPanel({ character, onClose, onChange }) {
  if (!character) return null;

  const isNew = !character.id;

  return (
    <aside className="right-panel">
      <div className="panel-header">
        <h3>{isNew ? 'Nuevo Personaje' : 'Detalles'}</h3>
        <button className="close-btn" onClick={onClose}>✖</button>
      </div>

      <div className="panel-field">
        <label>Nombre</label>
        <input 
          type="text" 
          value={character.name} 
          onChange={(e) => onChange('name', e.target.value)}
          placeholder="Nombre del personaje"
        />
      </div>

      <div className="panel-field">
        <label>Rasgos (separados por coma)</label>
        <input 
          type="text" 
          value={character.traits ? character.traits.join(', ') : ''} 
          onChange={(e) => onChange('traits', e.target.value.split(',').map(t => t.trim()))}
          placeholder="Valiente, astuto..."
        />
      </div>

      <div className="panel-field">
        <label>Descripción</label>
        <textarea 
          value={character.description || ''} 
          onChange={(e) => onChange('description', e.target.value)}
          placeholder="Historia y detalles..."
        />
      </div>
    </aside>
  );
}
