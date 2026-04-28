import { useEffect, useRef, useState } from 'react';

/**
 * Inline reference regex patterns
 * @character → character link
 * [[Block Title]] → chapter/document link
 */
const CHARACTER_REF_REGEX = /@([\w\s]+)/g;
const CHAPTER_REF_REGEX = /\[\[([\w\s]+)\]\]/g;

function escapeHTML(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function parseInlineReferencesHTML(content) {
  if (!content) return '';

  const matches = [];
  let match;
  const charRegex = new RegExp(CHARACTER_REF_REGEX);
  while ((match = charRegex.exec(content)) !== null) {
    matches.push({ type: 'character', start: match.index, end: match.index + match[0].length, text: match[1].trim(), raw: match[0] });
  }
  const chapRegex = new RegExp(CHAPTER_REF_REGEX);
  while ((match = chapRegex.exec(content)) !== null) {
    matches.push({ type: 'chapter', start: match.index, end: match.index + match[0].length, text: match[1].trim(), raw: match[0] });
  }

  if (matches.length === 0) {
    return escapeHTML(content).replace(/\n/g, '<br/>');
  }

  matches.sort((a, b) => a.start - b.start);
  let html = '';
  let lastIndex = 0;

  matches.forEach((ref) => {
    html += escapeHTML(content.slice(lastIndex, ref.start));
    const spanStyle = ref.type === 'character'
      ? 'color:#7dd3fc;background:rgba(29,78,216,0.12);border-radius:3px;padding:0 2px;user-select:text;'
      : 'color:#d8b4fe;background:rgba(124,58,237,0.12);border-radius:3px;padding:0 2px;user-select:text;';
    html += `<span style="${spanStyle}" class="inline-ref inline-ref-${ref.type}" data-ref-type="${ref.type}" data-ref-text="${escapeHTML(ref.text)}">${escapeHTML(ref.raw)}</span>`;
    lastIndex = ref.end;
  });

  html += escapeHTML(content.slice(lastIndex));
  return html.replace(/\n/g, '<br/>');
}

function findReferenceTarget(type, text, characters, chapters) {
  if (type === 'character') {
    return characters?.find(c => c.name === text)?.id;
  }
  if (type === 'chapter') {
    return chapters?.find(ch => ch.title === text)?.id;
  }
  return null;
}

/**
 * Unified block renderer for both Workspace and Notes
 * Supports: text, h1, h2, h3, h4, note
 */
export function BlockRenderer({
  block,
  isDragging,
  onDragStart,
  onInput,
  onInputTitle,
  onInputContent,
  onKeyDown,
  onDelete,
  characters,
  chapters,
  onOpenRef,
  inputRef,
}) {
  const { type, content, id, title } = block;
  const blockType = type || 'text';
  const [isEditing, setIsEditing] = useState(false);
  const editingTextRef = useRef(content || '');

  useEffect(() => {
    if (!isEditing) {
      editingTextRef.current = content || '';
    }
  }, [content, isEditing]);

  const handleInput = (e) => {
    editingTextRef.current = e.currentTarget.innerText;
  };

  const handleBlur = (field) => {
    return () => {
      setIsEditing(false);
      const text = editingTextRef.current;
      if (field === 'title') {
        if (text === (title || '')) return;
        if (onInputTitle) onInputTitle(text);
        return;
      }
      if (text === (content || '')) return;
      if (onInputContent) {
        onInputContent(text);
      } else if (onInput) {
        onInput({ currentTarget: { textContent: text } });
      }
    };
  };

  const handleTitleFocus = () => {
    setIsEditing(true);
    editingTextRef.current = title || '';
  };

  const handleContentFocus = () => {
    setIsEditing(true);
    editingTextRef.current = content || '';
  };

  // Heading styles
  const headingStyles = {
    h1: { fontSize: '2rem', fontWeight: 700, marginBottom: '0.5rem' },
    h2: { fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.4rem' },
    h3: { fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.3rem' },
    h4: { fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.2rem' },
  };

  const isHeading = ['h1', 'h2', 'h3', 'h4'].includes(blockType);
  const isNote = blockType === 'note';

  const handlePreviewClick = (e) => {
    const target = e.target.closest('.inline-ref');
    if (!target) return;
    const refType = target.dataset.refType;
    const refText = target.dataset.refText;
    const refId = findReferenceTarget(refType, refText, characters, chapters);
    if (refId && onOpenRef) {
      onOpenRef(refType, refId);
    }
  };

  if (isNote) {
    const titleHTML = escapeHTML(title || '').replace(/\n/g, '<br/>');
    const contentHTML = escapeHTML(content || '').replace(/\n/g, '<br/>');
    const displayContentHTML = parseInlineReferencesHTML(content || '');

    return (
      <div
        style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'flex-start',
          position: 'relative',
          opacity: isDragging ? 0.5 : 1,
          transition: isDragging ? 'none' : 'opacity 0.2s'
        }}
      >
        {/* Drag Handle */}
        <div
          onMouseDown={(e) => onDragStart(e, block)}
          style={{
            flexShrink: 0,
            width: '16px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'grab',
            color: isDragging ? '#60A5FA' : '#444',
            fontSize: '0.75rem',
            userSelect: 'none',
            transition: 'color 0.2s'
          }}
          title="Arrastra para mover"
        >
          ⋮⋮
        </div>

        {/* Note Card */}
        <div
          style={{
            flex: 1,
            minWidth: '200px',
            maxWidth: '300px',
            padding: '15px',
            backgroundColor: '#f8fafc',
            borderRadius: '14px',
            border: '1px solid #d1d5db',
            transform: isDragging ? 'scale(0.98)' : 'scale(1)',
            transition: isDragging ? 'none' : 'transform 0.2s'
          }}
        >
          <h3
            ref={inputRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onFocus={handleTitleFocus}
            onBlur={handleBlur('title')}
            data-placeholder="Título de la nota..."
            style={{
              margin: '0 0 8px 0',
              minHeight: '1.5em',
              color: '#111827',
              fontSize: '1.05rem',
              fontWeight: 700,
              outline: 'none',
              borderRadius: '4px',
              wordBreak: 'break-word',
              caretColor: '#60A5FA',
            }}
            dangerouslySetInnerHTML={{ __html: titleHTML }}
          />
          <p
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyDown={onKeyDown}
            onFocus={handleContentFocus}
            onBlur={handleBlur('content')}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={!isEditing ? handlePreviewClick : undefined}
            data-placeholder="Escribe la nota..."
            style={{
              margin: 0,
              minHeight: '56px',
              color: '#334155',
              fontSize: '0.95rem',
              lineHeight: '1.6',
              outline: 'none',
              borderRadius: '4px',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              caretColor: '#60A5FA',
            }}
            dangerouslySetInnerHTML={{ __html: isEditing ? contentHTML : displayContentHTML }}
          />
        </div>
      </div>
    );
  }

  const editableHTML = escapeHTML(content || '').replace(/\n/g, '<br/>');
  const displayHTML = parseInlineReferencesHTML(content || '');

  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'flex-start',
        position: 'relative',
        opacity: isDragging ? 0.5 : 1,
        transition: isDragging ? 'none' : 'opacity 0.2s'
      }}
    >
      {/* Drag Handle */}
      <div
        onMouseDown={(e) => onDragStart(e, block)}
        style={{
          flexShrink: 0,
          width: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'grab',
          color: isDragging ? '#60A5FA' : '#444',
          fontSize: '0.75rem',
          userSelect: 'none',
          paddingTop: isHeading ? '8px' : '5px',
          transition: 'color 0.2s'
        }}
        title="Arrastra para mover"
      >
        ⋮⋮
      </div>

      {/* Content */}
      <div
        ref={inputRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={onKeyDown}
        onMouseDown={(e) => e.stopPropagation()}
        onFocus={() => {
          setIsEditing(true);
          editingTextRef.current = content || '';
        }}
        onBlur={handleBlur('content')}
        onClick={!isEditing ? handlePreviewClick : undefined}
        data-placeholder={isHeading ? 'Encabezado...' : 'Escribe algo...'}
        style={{
          flex: 1,
          minHeight: isHeading ? 'auto' : '32px',
          padding: isHeading ? '2px 4px' : '5px 4px',
          color: '#212529',
          fontSize: '1rem',
          lineHeight: '1.6',
          outline: 'none',
          borderRadius: '4px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          caretColor: '#60A5FA',
          ...(headingStyles[blockType] || {})
        }}
        dangerouslySetInnerHTML={{ __html: isEditing ? editableHTML : displayHTML }}
      />
    </div>
  );
}

export function BlockTypeMenu({ position, onSelectType, onDelete, onClose }) {
  if (!position) return null;

  const blockTypes = [
    { type: 'text', label: '📝 Texto' },
    { type: 'h1', label: '📌 Encabezado 1' },
    { type: 'h2', label: '📌 Encabezado 2' },
    { type: 'h3', label: '📌 Encabezado 3' },
    { type: 'h4', label: '📌 Encabezado 4' },
  ];

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        background: '#2a2a2a',
        border: '1px solid #444',
        borderRadius: '6px',
        padding: '4px',
        zIndex: 1000,
        minWidth: '200px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
      }}
    >
      <div style={{ borderBottom: '1px solid #444', marginBottom: '4px', paddingBottom: '4px' }}>
        {blockTypes.map(bt => (
          <div
            key={bt.type}
            onClick={() => {
              onSelectType(bt.type);
              onClose();
            }}
            style={{
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '0.95rem',
              color: '#e0e0e0',
              transition: 'background 0.15s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#3a3a3a'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            {bt.label}
          </div>
        ))}
      </div>
      <div
        onClick={() => {
          if (typeof onDelete === 'function') {
            onDelete();
          }
          onClose();
        }}
        style={{
          padding: '8px 12px',
          cursor: 'pointer',
          fontSize: '0.95rem',
          color: '#ef4444',
          transition: 'background 0.15s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#3a3a3a'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        🗑️ Eliminar
      </div>
    </div>
  );
}
