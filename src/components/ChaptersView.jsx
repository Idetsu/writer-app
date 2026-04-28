import { useState, useEffect } from 'react';

export function ChaptersView({ chapters, characters, activeChapterId, onSelectChapter, onCreateNew, onUpdateChapter, onDeleteChapter, onToggleCharacter }) {
  if (activeChapterId) {
    const chapter = chapters.find(c => c.id === activeChapterId);
    if (!chapter) { onSelectChapter(null); return null; }
    return <ChapterEditor key={chapter.id} chapter={chapter} characters={characters} onUpdate={onUpdateChapter} onDelete={onDeleteChapter} onClose={() => onSelectChapter(null)} onToggleCharacter={onToggleCharacter} />;
  }

  return (
    <div className="content-wrapper">
      <div className="list-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Capítulos</h2>
        <button className="primary-btn" onClick={onCreateNew}>+ Nuevo Capítulo</button>
      </div>
      <div className="list-grid" style={{ display: 'grid', gap: '15px' }}>
        {chapters.length === 0 && <p style={{ color: '#888' }}>No hay capítulos. Crea uno nuevo.</p>}
        {chapters.map(chapter => (
          <div 
            key={chapter.id} 
            className="list-card"
            style={{ padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #d1d5db', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <div style={{ flex: 1, cursor: 'pointer' }} onClick={() => onSelectChapter(chapter.id)}>
              <h3 style={{ margin: '0 0 5px 0', color: '#111827' }}>{chapter.title || 'Capítulo sin título'}</h3>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.85rem' }}>
                {chapter.content ? `${chapter.content.trim().split(/\s+/).filter(Boolean).length} palabras` : '0 palabras'}
              </p>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); onDeleteChapter(chapter.id); }}
              title="Eliminar capítulo"
              style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '1rem', padding: '4px 8px', borderRadius: '4px' }}
              onMouseEnter={e => e.target.style.color='#ef4444'}
              onMouseLeave={e => e.target.style.color='#666'}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChapterEditor({ chapter, characters, onUpdate, onDelete, onClose, onToggleCharacter }) {
  const [content, setContent] = useState(chapter.content || '');
  const [title, setTitle] = useState(chapter.title || '');

  // Debounced autosave for text
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content !== chapter.content || title !== chapter.title) {
        onUpdate(chapter.id, { title, content });
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [content, title, chapter.id, onUpdate, chapter.content, chapter.title]);

  const linkedCharIds = chapter.characterIds || [];
  const linkedChars = characters ? characters.filter(c => linkedCharIds.includes(c.id)) : [];
  const availableChars = characters ? characters.filter(c => !linkedCharIds.includes(c.id)) : [];

  return (
    <div className="content-wrapper" style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '0' }}>
      <div style={{ display: 'flex', marginBottom: '15px', gap: '10px', alignItems: 'center' }}>
        <button onClick={onClose} style={{ padding: '8px 12px', background: '#f3f4f6', color: '#334155', border: '1px solid #d1d5db', borderRadius: '4px', cursor: 'pointer' }}>
          ← Volver
        </button>
        <input 
          type="text" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título del capítulo"
          style={{ flex: 1, background: 'transparent', border: 'none', borderBottom: '1px solid #d1d5db', color: '#111827', fontSize: '1.2rem', outline: 'none', padding: '5px' }}
        />
        <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>Autosave on</span>
        <button 
          onClick={() => { if (window.confirm('¿Eliminar este capítulo?')) onDelete(chapter.id); }}
          style={{ padding: '8px 12px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Eliminar
        </button>
      </div>

      {/* Characters in this chapter */}
      <div style={{ marginBottom: '15px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #d1d5db' }}>
        <p style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#6b7280', fontWeight: 'bold' }}>Personajes en este capítulo</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: linkedChars.length ? '10px' : '0' }}>
          {linkedChars.map(char => (
            <span key={char.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', color: '#111827', background: '#e2e8f0', border: '1px solid #cbd5e1' }}>
              {char.name}
              <button
                onClick={() => onToggleCharacter(chapter.id, char.id, false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 0, lineHeight: 1, fontSize: '0.9rem' }}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        {availableChars.length > 0 && (
          <select
            defaultValue=""
            onChange={(e) => { if (e.target.value) onToggleCharacter(chapter.id, Number(e.target.value), true); e.target.value = ''; }}
            style={{ background: '#ffffff', color: '#374151', border: '1px solid #d1d5db', padding: '6px 10px', borderRadius: '4px', fontSize: '0.9rem', cursor: 'pointer' }}
          >
            <option value="" disabled>+ Añadir personaje...</option>
            {availableChars.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}
        {availableChars.length === 0 && linkedChars.length === 0 && (
          <p style={{ margin: 0, color: '#6b7280', fontSize: '0.8rem' }}>Sin personajes disponibles</p>
        )}
      </div>

      <textarea 
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Escribe tu capítulo aquí..."
        style={{ flex: 1, width: '100%', background: '#f8fafc', color: '#111827', padding: '20px', border: '1px solid #d1d5db', borderRadius: '8px', resize: 'none', fontSize: '1.1rem', lineHeight: '1.6', boxSizing: 'border-box', fontFamily: 'serif', outline: 'none' }}
      />
    </div>
  );
}
