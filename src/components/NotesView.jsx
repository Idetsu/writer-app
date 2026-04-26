export function NotesView({ notes, onSelectNote, onCreateNew }) {
  return (
    <div className="content-wrapper">
      <div className="list-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Notas</h2>
        <button className="primary-btn" onClick={onCreateNew}>+ Nueva Nota</button>
      </div>
      <div className="list-grid" style={{ display: 'grid', gap: '15px' }}>
        {notes.length === 0 && <p style={{ color: '#888' }}>No hay notas. Crea una nueva.</p>}
        {notes.map(note => (
          <div 
            key={note.id} 
            className="list-card"
            onClick={() => onSelectNote(note)}
            style={{ padding: '15px', backgroundColor: '#1e1e1e', borderRadius: '8px', cursor: 'pointer', border: '1px solid #333' }}
          >
            <h3 style={{ margin: '0 0 5px 0' }}>{note.title || 'Nota sin título'}</h3>
            <p style={{ margin: 0, color: '#aaa', fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {note.content || 'Sin contenido'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
