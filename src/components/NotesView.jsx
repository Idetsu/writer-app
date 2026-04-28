import { useState, useRef, useCallback, useEffect } from 'react';
import { BlockRenderer } from './BlockRenderer';

export function NotesView({ notes, characters, onSelectNote, onCreateNew, onViewLinkedCharacter, onUpdateNotes }) {
  const [localNotes, setLocalNotes] = useState(notes);
  const [draggedNote, setDraggedNote] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const refs = useRef({});
  const containerRef = useRef(null);

  useEffect(() => {
    setLocalNotes(notes);
  }, [notes]);

  useEffect(() => {
    const timer = setTimeout(() => onUpdateNotes(localNotes), 500);
    return () => clearTimeout(timer);
  }, [localNotes, onUpdateNotes]);

  const updateBlock = (id, content) => {
    setLocalNotes(prev => prev.map(n => n.id === id ? { ...n, content } : n));
  };

  const changeBlockType = (id, newType) => {
    setLocalNotes(prev => prev.map(n => n.id === id ? { ...n, type: newType } : n));
  };

  const insertBlockAfter = useCallback((afterId, type = 'text') => {
    setLocalNotes(prev => {
      const idx = prev.findIndex(n => n.id === afterId);
      const newBlock = {
        id: Date.now(),
        type,
        content: '',
        order: (idx + 1) * 10 + Math.floor(Math.random() * 10)
      };
      const next = [...prev];
      next.splice(idx + 1, 0, newBlock);
      return next;
    });
    setTypeMenuPos(null);
    setTimeout(() => {
      const newId = Math.max(...localNotes.map(n => n.id)) + 1;
      if (refs.current[newId]?.focus) refs.current[newId].focus();
    }, 30);
  }, [localNotes]);

  const deleteBlock = useCallback((id) => {
    setLocalNotes(prev => {
      if (prev.length === 1) return prev;
      return prev.filter(n => n.id !== id);
    });
  }, []);

  const handleDragStart = (e, note) => {
    e.preventDefault();
    setDraggedNote(note);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!draggedNote || isDragging) return;
    const deltaX = Math.abs(e.clientX - dragStart.x);
    const deltaY = Math.abs(e.clientY - dragStart.y);
    if (deltaX > 10 || deltaY > 10) {
      setIsDragging(true);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
    }
  };

  const handleMouseUp = (e) => {
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
    
    if (!draggedNote) {
      setDraggedNote(null);
      setIsDragging(false);
      return;
    }

    if (!isDragging) {
      if (draggedNote.type === 'note') {
        onSelectNote(draggedNote);
      }
      setDraggedNote(null);
      setIsDragging(false);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const blockHeight = 60;
    const targetIndex = Math.max(0, Math.floor(y / blockHeight));

    const draggedIdx = localNotes.findIndex(n => n.id === draggedNote.id);
    if (draggedIdx === -1) return;

    setLocalNotes(prev => {
      const newNotes = [...prev];
      const [moved] = newNotes.splice(draggedIdx, 1);
      newNotes.splice(Math.min(targetIndex, newNotes.length), 0, moved);
      return newNotes;
    });

    setDraggedNote(null);
    setIsDragging(false);
  };

  const handleKeyDown = (e, block) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      insertBlockAfter(block.id);
    }
    if (e.key === 'Backspace' && block.content === '') {
      e.preventDefault();
      deleteBlock(block.id);
    }
  };

  return (
    <div className="content-wrapper" style={{ margin: '0', paddingTop: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem', fontWeight: 700 }}>Notas</h1>
          <div style={{ color: '#6b7280', fontSize: '0.95rem' }}>Sistema unificado de bloques</div>
        </div>
        <button
          type="button"
          onClick={onCreateNew}
          style={{
            background: '#28A2FF',
            color: '#ffffff',
            border: 'none',
            borderRadius: '7px',
            padding: '12px 18px',
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(40,162,255,0.18)',
            fontWeight: 600,
          }}
        >
          Crear nota
        </button>
      </div>

      <div 
        ref={containerRef}
        style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        {localNotes.map((block, idx) => (
          <div key={block.id} style={{ display: 'flex', gap: '8px', position: 'relative', alignItems: 'flex-start' }}>
            {/* Block Renderer */}
            <BlockRenderer
              block={block}
              isDragging={draggedNote?.id === block.id && isDragging}
              onDragStart={handleDragStart}
              onInput={(e) => updateBlock(block.id, e.currentTarget.textContent)}
              onKeyDown={(e) => handleKeyDown(e, block)}
              onDelete={() => deleteBlock(block.id)}
              inputRef={(el) => { if (el) refs.current[block.id] = el; }}
            />
          </div>
        ))}
      </div>

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #444;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
