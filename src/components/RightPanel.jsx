export function RightPanel({ activeEntity, entityType, characters, notes, chapters, onClose, onChange, onSave, onDelete, onLinkNote, onViewLinkedCharacter, onOpenLinkedNote, onOpenChapter }) {
  if (!activeEntity) return null;

  const isNew = !activeEntity.id;
  const safeChapters = chapters || [];

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

          {/* Linked Notes section */}
          {!isNew && (() => {
            const linkedNotes = notes ? notes.filter(n => n.linkedCharacterId === activeEntity.id) : [];
            return (
              <div className="panel-field">
                <label>Notas vinculadas ({linkedNotes.length})</label>
                {linkedNotes.length === 0
                  ? <p style={{ color: '#666', fontSize: '0.85rem', margin: '4px 0' }}>Sin notas vinculadas</p>
                  : linkedNotes.map(note => (
                    <div
                      key={note.id}
                      onClick={() => onOpenLinkedNote(note.id)}
                      style={{ padding: '6px 10px', marginBottom: '6px', background: '#2a2a2a', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', color: '#e0e0e0' }}
                    >
                      📝 {note.title || 'Nota sin título'}
                    </div>
                  ))
                }
              </div>
            );
          })()}
          {!isNew && (() => {
            const appearsIn = safeChapters.filter(ch => (ch.characterIds || []).includes(activeEntity.id));
            return (
              <div className="panel-field">
                <label>Aparece en capítulos ({appearsIn.length})</label>
                {appearsIn.length === 0
                  ? <p style={{ color: '#666', fontSize: '0.85rem', margin: '4px 0' }}>No asignado a ningún capítulo</p>
                  : appearsIn.map(ch => (
                    <div
                      key={ch.id}
                      onClick={() => onOpenChapter(ch.id)}
                      style={{ padding: '6px 10px', marginBottom: '6px', background: '#2a2a2a', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', color: '#e0e0e0' }}
                    >
                      📖 {ch.title || 'Capítulo sin título'}
                    </div>
                  ))
                }
              </div>
            );
          })()}
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

          {/* Link to character section */}
          {!isNew && (
            <div className="panel-field">
              <label>Vincular a personaje</label>
              {activeEntity.linkedCharacterId ? (() => {
                const linkedChar = characters ? characters.find(c => c.id === activeEntity.linkedCharacterId) : null;
                return (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 10px', background: '#2a2a2a', borderRadius: '4px', fontSize: '0.85rem' }}>
                    <span
                      onClick={() => onViewLinkedCharacter(activeEntity.linkedCharacterId)}
                      style={{ color: '#60A5FA', cursor: 'pointer' }}
                    >
                      👤 {linkedChar ? linkedChar.name : 'Personaje eliminado'}
                    </span>
                    <button
                      onClick={() => onLinkNote(activeEntity.id, null)}
                      title="Desvincular"
                      style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '0.8rem', padding: '0 4px' }}
                    >
                      ✕ Desvincular
                    </button>
                  </div>
                );
              })() : (
                <select
                  defaultValue=""
                  onChange={(e) => { if (e.target.value) onLinkNote(activeEntity.id, Number(e.target.value)); }}
                  style={{ width: '100%', background: '#1a1a1a', color: '#e0e0e0', border: '1px solid #333', padding: '8px', borderRadius: '4px', boxSizing: 'border-box' }}
                >
                  <option value="" disabled>— Seleccionar personaje —</option>
                  {characters && characters.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              )}
            </div>
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
