import { useState, useEffect } from 'react';

export function ChaptersView({ chapters, activeChapterId, onSelectChapter, onCreateNew, onUpdateChapter }) {
  if (activeChapterId) {
    const chapter = chapters.find(c => c.id === activeChapterId);
    return <ChapterEditor chapter={chapter} onUpdate={onUpdateChapter} onClose={() => onSelectChapter(null)} />;
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
            onClick={() => onSelectChapter(chapter.id)}
            style={{ padding: '15px', backgroundColor: '#1e1e1e', borderRadius: '8px', cursor: 'pointer', border: '1px solid #333' }}
          >
            <h3 style={{ margin: '0 0 5px 0' }}>{chapter.title || 'Capítulo sin título'}</h3>
            <p style={{ margin: 0, color: '#888', fontSize: '0.85rem' }}>
              {chapter.content ? `${chapter.content.trim().split(/\s+/).filter(Boolean).length} palabras` : '0 palabras'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChapterEditor({ chapter, onUpdate, onClose }) {
  const [content, setContent] = useState(chapter.content || '');
  const [title, setTitle] = useState(chapter.title || '');

  // Debounced autosave
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content !== chapter.content || title !== chapter.title) {
        onUpdate(chapter.id, { title, content });
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [content, title, chapter.id, onUpdate, chapter.content, chapter.title]);

  return (
    <div className="content-wrapper" style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: '0' }}>
      <div style={{ display: 'flex', marginBottom: '15px', gap: '10px', alignItems: 'center' }}>
        <button onClick={onClose} style={{ padding: '8px 12px', background: '#333', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Volver
        </button>
        <input 
          type="text" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título del capítulo"
          style={{ flex: 1, background: 'transparent', border: 'none', borderBottom: '1px solid #333', color: '#fff', fontSize: '1.2rem', outline: 'none', padding: '5px' }}
        />
        <span style={{ color: '#888', fontSize: '0.9rem' }}>Autosave on</span>
      </div>
      <textarea 
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Escribe tu capítulo aquí..."
        style={{ flex: 1, width: '100%', background: '#1e1e1e', color: '#e0e0e0', padding: '20px', border: '1px solid #333', borderRadius: '8px', resize: 'none', fontSize: '1.1rem', lineHeight: '1.6', boxSizing: 'border-box', fontFamily: 'serif', outline: 'none' }}
      />
    </div>
  );
}
