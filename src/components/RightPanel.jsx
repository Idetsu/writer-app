export function RightPanel({ activeEntity, entityType, onClose, onChange, onSave, onDelete, onConvertToCharacter }) {
  if (!activeEntity) return null;

  const isNew = !activeEntity.id;

  return (
    <aside className="right-panel">
      <div className="panel-header">
        <h3>{isNew ? `Nuevo ${entityType === 'character' ? 'Personaje' : 'Nota'}` : 'Detalles'}</h3>
        <button className="close-btn" onClick={onClose}>✖</button>
      </div>

      {entityType === 'character' && (
        <>
          <div className="panel-field">
            <label>Nombre</label>
            <input 
              type="text" 
              value={activeEntity.name || ''} 
              onChange={(e) => onChange('name', e.target.value)}
              placeholder="Nombre del personaje"
            />
          </div>
          <div className="panel-field">
            <label>Color</label>
            <input 
              type="color" 
              value={activeEntity.color || '#60A5FA'} 
              onChange={(e) => onChange('color', e.target.value)}
              style={{ padding: 0, height: '40px', cursor: 'pointer' }}
            />
          </div>
          <div className="panel-field">
            <label>Rasgos (separados por coma)</label>
            <input 
              type="text" 
              value={activeEntity.traits ? activeEntity.traits.join(', ') : ''} 
              onChange={(e) => onChange('traits', e.target.value.split(',').map(t => t.trim()))}
              placeholder="Valiente, astuto..."
            />
          </div>
          <div className="panel-field">
            <label>Descripción</label>
            <textarea 
              value={activeEntity.description || ''} 
              onChange={(e) => onChange('description', e.target.value)}
              placeholder="Historia y detalles..."
            />
          </div>
        </>
      )}

      {entityType === 'note' && (
        <>
          <div className="panel-field">
            <label>Título</label>
            <input 
              type="text" 
              value={activeEntity.title || ''} 
              onChange={(e) => onChange('title', e.target.value)}
              placeholder="Título de la nota"
            />
          </div>
          <div className="panel-field">
            <label>Contenido</label>
            <textarea 
              value={activeEntity.content || ''} 
              onChange={(e) => onChange('content', e.target.value)}
              placeholder="Escribe tu nota aquí..."
              style={{ minHeight: '200px' }}
            />
          </div>
          {!isNew && (
             <button 
               onClick={onConvertToCharacter}
               className="primary-btn" 
               style={{ marginBottom: '15px' }}
             >
               Convertir a Personaje
             </button>
          )}
        </>
      )}
      
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <button className="primary-btn" onClick={onSave}>
          Guardar
        </button>
        {!isNew && (
          <button 
            onClick={onDelete}
            style={{ padding: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Eliminar
          </button>
        )}
      </div>
    </aside>
  );
}
