import { useState } from 'react';

export function Sidebar({
  activeTab,
  onChangeTab,
  books = [],
  activeBookId,
  onSelectBook,
  onCreateBook,
  onEditBook,
  documents = [],
  onCreateDocument,
  onSelectDocument,
}) {
  const [bookMenuOpen, setBookMenuOpen] = useState(false);
  const tabs = ['Capítulos', 'Personajes', 'Notas'];
  const activeBook = books.find(book => book.id === activeBookId) || books[0] || { title: 'Libro', color: '#60A5FA' };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <button
          type="button"
          className="book-selector"
          onClick={() => setBookMenuOpen(prev => !prev)}
        >
          <span className="book-icon" style={{ background: activeBook.color || '#60A5FA' }}>
            {activeBook.title?.charAt(0)?.toUpperCase() || 'L'}
          </span>
          <div className="book-title-block">
            <p className="project-label">Libro de prueba</p>
            <h2>Primer Libro del Autor</h2>
            <p className="author-name">Juan Hernández</p>
          </div>
          <span className="book-arrow">▾</span>
        </button>

        {bookMenuOpen && (
          <div className="book-dropdown">
            {books.map(book => (
              <div
                key={book.id}
                className={`book-dropdown-item ${book.id === activeBookId ? 'active' : ''}`}
              >
                <button
                  type="button"
                  className="book-dropdown-select"
                  onClick={() => {
                    onSelectBook(book.id);
                    setBookMenuOpen(false);
                  }}
                >
                  <span className="book-dropdown-icon" style={{ background: book.color || '#60A5FA' }}>
                    {book.title?.charAt(0)?.toUpperCase() || 'L'}
                  </span>
                  <span>{book.title || 'Libro sin título'}</span>
                </button>
                <button
                  type="button"
                  className="book-dropdown-edit"
                  onClick={(e) => {
                    e.stopPropagation();
                    setBookMenuOpen(false);
                    onEditBook(book);
                  }}
                  title="Editar libro"
                >
                  ✏️
                </button>
              </div>
            ))}
          </div>
        )}

        <button className="button-primary create-book-btn" onClick={onCreateBook}>
          Crear libro +
        </button>
      </div>

      <div className="sidebar-section">
        <h3 className="sidebar-section-title">Navegación</h3>
        <ul className="sidebar-nav">
          {tabs.map(tab => (
            <li
              key={tab}
              className={`nav-item ${activeTab === tab ? 'active' : ''}`}
              onClick={() => onChangeTab(tab)}
            >
              {tab}
            </li>
          ))}
          <li className="nav-item disabled">Mundo</li>
        </ul>
      </div>

      <div className="sidebar-section">
        <h3 className="sidebar-section-title">Herramientas</h3>
        <div className="tools-grid">
          <button className="tool-item" type="button">
            <span style={{ fontSize: '1.4rem' }}>📈</span>
            <span>Progreso</span>
          </button>
          <button className="tool-item" type="button">
            <span style={{ fontSize: '1.4rem' }}>🧠</span>
            <span>Generador</span>
          </button>
          <button className="tool-item" type="button">
            <span style={{ fontSize: '1.4rem' }}>📝</span>
            <span>Nombres</span>
          </button>
          <button className="tool-item" type="button">
            <span style={{ fontSize: '1.4rem' }}>🔤</span>
            <span>Apellidos</span>
          </button>
          <button className="tool-item" type="button">
            <span style={{ fontSize: '1.4rem' }}>＋</span>
            <span>Agregar</span>
          </button>
        </div>
      </div>

      <div className="sidebar-section">
        <h3 className="sidebar-section-title">Recientes</h3>
        <ul className="recent-list">
          {documents.slice(0, 3).map(doc => (
            <li key={doc.id} className="recent-item" onClick={() => onSelectDocument(doc.id)}>
              <span>📄</span>
              <span>{doc.title || 'Sin título'}</span>
            </li>
          ))}
          {documents.length === 0 && <li className="recent-item">No hay recientes aún</li>}
        </ul>
      </div>

      <div className="sidebar-tags">
        <span className="tag">Otro</span>
        <span className="tag">Recursos</span>
        <span className="tag">Papelera</span>
      </div>
    </aside>
  );
}
