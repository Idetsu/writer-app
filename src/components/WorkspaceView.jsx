import { useState, useEffect, useRef, useCallback } from 'react';
import { BlockRenderer } from './BlockRenderer';

export function WorkspaceView({ blocks, documentTitle, onUpdateDocumentTitle, onFinalizeDocumentTitle, onUpdateBlocks, characters, notes, chapters, onOpenRef, onCreateChapter }) {
  const [localBlocks, setLocalBlocks] = useState(blocks);
  const [draggedBlock, setDraggedBlock] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [contextMenuPos, setContextMenuPos] = useState(null);
  const [contextBlockId, setContextBlockId] = useState(null);
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const refs = useRef({});

  useEffect(() => {
    setLocalBlocks(blocks);
  }, [blocks]);

  useEffect(() => {
    const timer = setTimeout(() => onUpdateBlocks(localBlocks), 800);
    return () => clearTimeout(timer);
  }, [localBlocks, onUpdateBlocks]);

  const updateBlockField = (id, field, value) => {
    setLocalBlocks(prev => prev.map(b => b.id === id ? { ...b, [field]: value } : b));
  };

  const handleDragStart = (e, block) => {
    e.preventDefault();
    setDraggedBlock(block);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    if (!draggedBlock || isDragging) return;
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

    if (!draggedBlock) {
      setDraggedBlock(null);
      setIsDragging(false);
      return;
    }

    if (!isDragging) {
      setDraggedBlock(null);
      setIsDragging(false);
      return;
    }

    const draggedIdx = localBlocks.findIndex(b => b.id === draggedBlock.id);
    if (draggedIdx === -1) {
      setDraggedBlock(null);
      setIsDragging(false);
      return;
    }

    setLocalBlocks(prev => {
      const newBlocks = [...prev];
      const [moved] = newBlocks.splice(draggedIdx, 1);
      newBlocks.splice(draggedIdx, 0, moved);
      return newBlocks;
    });

    setDraggedBlock(null);
    setIsDragging(false);
  };

  const insertBlockAfter = useCallback((afterId, type = 'text') => {
    const newBlock = {
      id: Date.now(),
      type,
      content: '',
      ...(type === 'note' ? { title: '' } : {}),
    };
    setLocalBlocks(prev => {
      if (afterId == null) {
        return [...prev, newBlock];
      }
      const idx = prev.findIndex(b => b.id === afterId);
      const next = [...prev];
      next.splice(idx + 1, 0, newBlock);
      return next;
    });
    setTimeout(() => refs.current[newBlock.id]?.focus(), 30);
  }, []);

  const deleteBlock = useCallback((id) => {
    setLocalBlocks(prev => {
      const idx = prev.findIndex(b => b.id === id);
      const next = prev.filter(b => b.id !== id);
      const focusIdx = Math.max(0, idx - 1);
      setTimeout(() => {
        const prevBlock = next[focusIdx];
        if (prevBlock && prevBlock.type === 'text') {
          const el = refs.current[prevBlock.id];
          if (el) { el.focus(); moveCursorToEnd(el); }
        }
      }, 30);
      return next;
    });
  }, []);

  const handleKeyDown = (e, block) => {
    if (block.type === 'note') return;
    if (e.key === 'Enter') {
      e.preventDefault();
      insertBlockAfter(block.id);
    }
    if (e.key === 'Backspace' && block.content === '') {
      e.preventDefault();
      deleteBlock(block.id);
    }
  };

  const handleBlockMenuOpen = (e, blockId) => {
    e.preventDefault();
    e.stopPropagation();
    setContextBlockId(blockId);
    setContextMenuPos({ top: e.clientY, left: e.clientX });
    setSubmenuOpen(false);
  };

  const handleChangeBlockType = (type) => {
    if (contextBlockId) {
      setLocalBlocks(prev => prev.map(b => b.id === contextBlockId ? { ...b, type } : b));
    }
    closeContextMenu();
  };

  const handleDeleteFromMenu = () => {
    if (contextBlockId) {
      deleteBlock(contextBlockId);
    }
    closeContextMenu();
  };

  const closeContextMenu = () => {
    setContextMenuPos(null);
    setContextBlockId(null);
    setSubmenuOpen(false);
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        closeContextMenu();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div className="content-wrapper" style={{ margin: '0', paddingTop: '40px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <input
            value={documentTitle || 'Sin título'}
            onChange={(e) => onUpdateDocumentTitle(e.target.value)}
            onBlur={(e) => onFinalizeDocumentTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                if (localBlocks.length === 0) {
                  const newBlock = { id: Date.now(), type: 'text', content: '' };
                  setLocalBlocks([newBlock]);
                  setTimeout(() => refs.current[newBlock.id]?.focus(), 30);
                }
              }
            }}
            style={{
              width: '100%',
              fontSize: '32px',
              fontWeight: 600,
              background: 'transparent',
              border: 'none',
              color: '#212529',
              outline: 'none',
              padding: 0,
              marginBottom: '10px',
            }}
          />
          <div style={{ color: '#868e96', fontSize: '14px' }}>Documento</div>
        </div>
        <button
          onClick={() => insertBlockAfter(localBlocks.length ? localBlocks[localBlocks.length - 1].id : null, 'note')}
          style={{
            background: '#2563eb',
            border: 'none',
            color: '#fff',
            borderRadius: '999px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontSize: '0.95rem',
            fontWeight: 500,
            boxShadow: '0 4px 10px rgba(37,99,235,0.3)',
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#1d4ed8'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#2563eb'}
        >
          + Nota
        </button>
      </div>

      <div 
        className="workspace-content"
        style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={closeContextMenu}
      >
        {localBlocks.map((block) => (
          <div
            key={block.id}
            className="block"
            data-type={block.type}
            style={{ display: 'flex', alignItems: 'flex-start', gap: '4px', position: 'relative' }}
          >
            {/* Block Handle - Opens Context Menu */}
            <div
              className="block-handle"
              onMouseDown={(e) => {
                if (!isDragging && draggedBlock?.id !== block.id) {
                  handleDragStart(e, block);
                }
              }}
              onContextMenu={(e) => handleBlockMenuOpen(e, block.id)}
              style={{
                flexShrink: 0,
                width: '16px',
                minHeight: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isDragging && draggedBlock?.id === block.id ? 'grabbing' : 'grab',
                color: isDragging && draggedBlock?.id === block.id ? '#60A5FA' : '#444',
                fontSize: '0.75rem',
                userSelect: 'none',
                transition: 'opacity 0.2s ease, color 0.2s ease',
                padding: '0 4px',
                opacity: 0,
              }}
              title="Arrastra para mover, click derecho para opciones"
            >
              ⋮⋮
            </div>

            <BlockRenderer
              block={block}
              isDragging={draggedBlock?.id === block.id && isDragging}
              onDragStart={() => {}}
              onInput={block.type === 'note' ? undefined : (e) => updateBlockField(block.id, 'content', e.currentTarget.textContent)}
              onInputTitle={block.type === 'note' ? (value) => updateBlockField(block.id, 'title', value) : undefined}
              onInputContent={block.type === 'note' ? (value) => updateBlockField(block.id, 'content', value) : undefined}
              onKeyDown={block.type === 'note' ? undefined : (e) => handleKeyDown(e, block)}
              onDelete={() => deleteBlock(block.id)}
              inputRef={(el) => { if (el) refs.current[block.id] = el; }}
              characters={characters}
              chapters={chapters}
              onOpenRef={onOpenRef}
            />
          </div>
        ))}
        
        {/* Context Menu with Submenu */}
        {contextMenuPos && contextBlockId && (
          <BlockContextMenu
            position={contextMenuPos}
            onSelectType={handleChangeBlockType}
            onDelete={handleDeleteFromMenu}
            onClose={closeContextMenu}
            submenuOpen={submenuOpen}
            onSubmenuToggle={setSubmenuOpen}
          />
        )}
      </div>

      <style>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: #adb5bd;
          opacity: 1;
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}

function MenuOption({ label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        textAlign: 'left',
        background: 'none',
        border: 'none',
        color: '#d0d0d0',
        padding: '6px 10px',
        cursor: 'pointer',
        fontSize: '0.85rem',
        borderRadius: '4px',
      }}
      onMouseEnter={e => e.currentTarget.style.background = '#3a3a3a'}
      onMouseLeave={e => e.currentTarget.style.background = 'none'}
    >
      {label}
    </button>
  );
}

/**
 * Context menu with submenu for block type selection
 */
function BlockContextMenu({ position, onSelectType, onDelete, onClose, submenuOpen, onSubmenuToggle }) {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const headingOptions = [
    { type: 'h1', label: 'H1' },
    { type: 'h2', label: 'H2' },
    { type: 'h3', label: 'H3' },
    { type: 'h4', label: 'H4' },
  ];

  return (
    <div
      ref={menuRef}
      className="block-menu"
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        background: '#2a2a2a',
        border: '1px solid #444',
        borderRadius: '6px',
        padding: '4px',
        zIndex: 1001,
        minWidth: '180px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
      }}
    >
      {/* Texto */}
      <div
        className="block-menu-item"
        onClick={() => onSelectType('text')}
        style={{
          padding: '8px 12px',
          cursor: 'pointer',
          fontSize: '0.95rem',
          color: '#e0e0e0',
          transition: 'background 0.15s',
          borderRadius: '4px',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#3a3a3a'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        📝 Texto
      </div>

      {/* Nota */}
      <div
        className="block-menu-item"
        onClick={() => onSelectType('note')}
        style={{
          padding: '8px 12px',
          cursor: 'pointer',
          fontSize: '0.95rem',
          color: '#e0e0e0',
          transition: 'background 0.15s',
          borderRadius: '4px',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#3a3a3a'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        📓 Nota
      </div>

      {/* Encabezados with Submenu */}
      <div
        className="block-menu-item block-menu-item--submenu"
        onMouseEnter={() => onSubmenuToggle(true)}
        onMouseLeave={() => onSubmenuToggle(false)}
        style={{
          padding: '8px 12px',
          cursor: 'pointer',
          fontSize: '0.95rem',
          color: '#e0e0e0',
          transition: 'background 0.15s',
          borderRadius: '4px',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: submenuOpen ? '#3a3a3a' : 'transparent',
        }}
      >
        <span>📌 Encabezados</span>
        <span style={{ fontSize: '0.8rem', marginLeft: '8px' }}>▶</span>

        {/* Submenu */}
        {submenuOpen && (
          <div
            className="block-submenu"
            style={{
              position: 'absolute',
              top: 0,
              left: '100%',
              marginLeft: '4px',
              background: '#2a2a2a',
              border: '1px solid #444',
              borderRadius: '6px',
              padding: '4px',
              minWidth: '100px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
            }}
          >
            {headingOptions.map(opt => (
              <div
                key={opt.type}
                className="block-submenu-item"
                onClick={() => onSelectType(opt.type)}
                style={{
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  color: '#e0e0e0',
                  transition: 'background 0.15s',
                  borderRadius: '4px',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#3a3a3a'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {opt.label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ borderBottom: '1px solid #444', margin: '4px 0' }} />

      {/* Eliminar */}
      <div
        className="block-menu-item block-menu-item--delete"
        onClick={onDelete}
        style={{
          padding: '8px 12px',
          cursor: 'pointer',
          fontSize: '0.95rem',
          color: '#ef4444',
          transition: 'background 0.15s',
          borderRadius: '4px',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#3a3a3a'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        🗑️ Eliminar
      </div>
    </div>
  );
}


function RefBlock({ block, characters, notes, chapters, onOpen, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const isChar = block.type === 'character_ref';
  const isChapter = block.type === 'chapter_ref';

  const entity = isChar
    ? (characters || []).find(c => c.id === block.refId)
    : isChapter
      ? (chapters || []).find(c => c.id === block.refId)
      : (notes || []).find(n => n.id === block.refId);

  // Label logic
  let prefix, rawLabel;
  if (isChar)    { prefix = '@'; rawLabel = entity?.name; }
  else if (isChapter) { prefix = '📖 '; rawLabel = entity?.title; }
  else           { prefix = '#'; rawLabel = entity?.content?.replace(/\n/g, ' ').trim().slice(0, 40) || entity?.title; }

  const label = rawLabel
    ? (rawLabel.length > 40 ? rawLabel.slice(0, 40) + '…' : rawLabel)
    : entity ? '(empty)' : '(deleted)';

  const color = entity
    ? (isChar ? '#7dd3fc' : isChapter ? '#c4b5fd' : '#86efac')
    : '#555';

  const openType = isChar ? 'character' : isChapter ? 'chapter' : 'note';

  return (
    <div
      style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', padding: '4px 0', minHeight: '32px' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span
        onClick={() => entity && onOpen(openType, block.refId)}
        title={entity ? 'Abrir' : undefined}
        style={{
          color,
          fontSize: '1rem',
          lineHeight: '1.7',
          cursor: entity ? 'pointer' : 'default',
          textDecoration: hovered && entity ? 'underline' : 'none',
          background: hovered && entity ? 'rgba(255,255,255,0.05)' : 'transparent',
          borderRadius: '3px',
          padding: '0 2px',
          transition: 'background 0.1s',
          userSelect: 'none',
        }}
      >
        {prefix}{label}
      </span>
      {hovered && (
        <button
          onClick={onDelete}
          title="Eliminar referencia"
          style={{ background: 'none', border: 'none', color: '#555', cursor: 'pointer', fontSize: '0.8rem', padding: '0 2px', lineHeight: 1 }}
          onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
          onMouseLeave={e => e.currentTarget.style.color = '#555'}
        >
          ✕
        </button>
      )}
    </div>
  );
}

function moveCursorToEnd(el) {
  const range = document.createRange();
  const sel = window.getSelection();
  range.selectNodeContents(el);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
}
