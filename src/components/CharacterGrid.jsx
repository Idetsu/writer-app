import { useState, useEffect } from 'react';

export function CharacterView({ characters, folders, onSelectCharacter, onCreateNew, onUpdateCharacters, onUpdateFolders }) {
  const [currentFolderId, setCurrentFolderId] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [editingChar, setEditingChar] = useState(null);
  const [draftName, setDraftName] = useState('');
  const [draggedChar, setDraggedChar] = useState(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setContextMenu(null);
    };
    const handleClick = () => setContextMenu(null);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClick);
    };
  }, []);

  const filteredCharacters = currentFolderId
    ? characters.filter(char => char.folderId === currentFolderId)
    : characters.filter(char => !char.folderId);

  const handleRightClick = (e, char) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, char });
  };

  const closeContextMenu = () => setContextMenu(null);

  const handleRename = () => {
    setEditingChar(contextMenu.char);
    setDraftName(contextMenu.char.name);
    closeContextMenu();
  };

  const saveRename = () => {
    onUpdateCharacters(prev => prev.map(c => c.id === editingChar.id ? { ...c, name: draftName } : c));
    setEditingChar(null);
  };

  const handleMoveToFolder = (folderId) => {
    onUpdateCharacters(prev => prev.map(c => c.id === contextMenu.char.id ? { ...c, folderId } : c));
    closeContextMenu();
  };

  const handleDelete = () => {
    onUpdateCharacters(prev => prev.filter(c => c.id !== contextMenu.char.id));
    closeContextMenu();
  };

  const handleCreateFolder = () => {
    const newFolder = { id: Date.now(), name: 'Nueva Carpeta' };
    onUpdateFolders(prev => [...prev, newFolder]);
  };

  const handleRenameFolder = (folder) => {
    const newName = prompt('Nuevo nombre:', folder.name);
    if (newName) {
      onUpdateFolders(prev => prev.map(f => f.id === folder.id ? { ...f, name: newName } : f));
    }
  };

  const handleDeleteFolder = (folderId) => {
    onUpdateFolders(prev => prev.filter(f => f.id !== folderId));
    onUpdateCharacters(prev => prev.map(c => c.folderId === folderId ? { ...c, folderId: null } : c));
  };

  const handleDragStart = (e, char) => {
    setDraggedChar(char);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, folderId) => {
    e.preventDefault();
    if (draggedChar) {
      onUpdateCharacters(prev => prev.map(c => c.id === draggedChar.id ? { ...c, folderId } : c));
      setDraggedChar(null);
    }
  };

  return (
    <div className="content-wrapper">
      <div className="list-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          {currentFolderId && (
            <button onClick={() => setCurrentFolderId(null)} style={{ marginRight: '10px' }}>← Atrás</button>
          )}
          <h2>Personajes {currentFolderId ? `- ${folders.find(f => f.id === currentFolderId)?.name}` : ''}</h2>
        </div>
        <div>
          <button className="primary-btn" onClick={handleCreateFolder} style={{ marginRight: '10px' }}>+ Carpeta</button>
          <button className="primary-btn" onClick={onCreateNew}>+ Nuevo Personaje</button>
        </div>
      </div>

      {!currentFolderId && (
        <div className="folders-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' }}>
          {folders.map(folder => (
            <div
              key={folder.id}
              className="folder-card"
              onClick={() => setCurrentFolderId(folder.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, folder.id)}
              style={{ padding: '15px', cursor: 'pointer', backgroundColor: '#f8fafc', border: '1px solid #d1d5db' }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📁</div>
              <div>{folder.name}</div>
              <div style={{ fontSize: '0.8rem', color: '#888' }}>{characters.filter(c => c.folderId === folder.id).length} personajes</div>
            </div>
          ))}
        </div>
      )}

      <div className="character-grid">
        {filteredCharacters.map(char => (
          <div
            key={char.id}
            className="character-card"
            style={{ backgroundColor: char.color }}
            onClick={() => onSelectCharacter(char)}
            onContextMenu={(e) => handleRightClick(e, char)}
            draggable
            onDragStart={(e) => handleDragStart(e, char)}
          >
            {editingChar?.id === char.id ? (
              <input
                value={draftName}
                onChange={e => setDraftName(e.target.value)}
                onBlur={saveRename}
                onKeyDown={e => e.key === 'Enter' && saveRename()}
                autoFocus
                style={{ width: '100%', background: 'transparent', border: 'none', color: 'white', textAlign: 'center' }}
              />
            ) : (
              <>
                <div className="card-icon">👤</div>
                <div>{char.name}</div>
              </>
            )}
          </div>
        ))}

        <div className="character-card add-card" onClick={onCreateNew}>
          <div className="card-icon">➕</div>
          <div>Nuevo</div>
        </div>
      </div>

      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            background: '#1f1f1f',
            border: '1px solid #333',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            zIndex: 1000,
            minWidth: '150px',
          }}
        >
          <button onClick={handleRename} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', color: '#e0e0e0', cursor: 'pointer' }}>Renombrar</button>
          <div style={{ borderTop: '1px solid #444' }}>
            {folders.map(folder => (
              <button key={folder.id} onClick={() => handleMoveToFolder(folder.id)} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', color: '#e0e0e0', cursor: 'pointer' }}>
                Mover a {folder.name}
              </button>
            ))}
          </div>
          <button onClick={handleDelete} style={{ width: '100%', textAlign: 'left', padding: '8px 12px', background: 'none', border: 'none', color: '#e0e0e0', cursor: 'pointer' }}>Eliminar</button>
        </div>
      )}
    </div>
  );
}
