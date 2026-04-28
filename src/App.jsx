import { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { CharacterView } from './components/CharacterGrid';
import { RightPanel } from './components/RightPanel';
import { NotesView } from './components/NotesView';
import { ChaptersView } from './components/ChaptersView';
import { WorkspaceView } from './components/WorkspaceView';
import './index.css';

const INITIAL_CHARACTERS = [
  { id: 1, name: "Idetsu", color: "#60A5FA", traits: ["Valiente", "Testarudo"], description: "El héroe principal de la historia.", blocks: [{ id: 10001, type: 'text', content: '' }] },
  { id: 2, name: "Hlami", color: "#C084FC", traits: ["Inteligente", "Silenciosa"], description: "Maga misteriosa del bosque.", blocks: [{ id: 10002, type: 'text', content: '' }] },
  { id: 3, name: "Doromi", color: "#FBBF24", traits: ["Fuerte", "Leal"], description: "Guerrera protectora.", blocks: [{ id: 10003, type: 'text', content: '' }] },
  { id: 4, name: "Rokoshi", color: "#F87171", traits: ["Astuto", "Vengativo"], description: "El rival oscuro.", blocks: [{ id: 10004, type: 'text', content: '' }] }
];

export default function App() {
  const DEFAULT_BOOK_ID = Date.now();
  const DEFAULT_DOCUMENT_ID = DEFAULT_BOOK_ID + 1;

  const initialBooks = (() => {
    const savedBooks = JSON.parse(localStorage.getItem('books'));
    if (Array.isArray(savedBooks) && savedBooks.length) return savedBooks;

    const savedCharacters = JSON.parse(localStorage.getItem('characters')) || INITIAL_CHARACTERS;
    const savedFolders = JSON.parse(localStorage.getItem('folders')) || [];
    const savedNotes = JSON.parse(localStorage.getItem('notes')) || [];
    const savedChapters = JSON.parse(localStorage.getItem('chapters')) || [];
    const savedDocuments = JSON.parse(localStorage.getItem('documents')) || [{
      id: DEFAULT_DOCUMENT_ID,
      title: 'Sin título',
      blocks: [{ id: DEFAULT_DOCUMENT_ID + 1, content: '' }]
    }];
    const savedActiveDocumentId = JSON.parse(localStorage.getItem('activeDocumentId'));
    const activeDocId = savedActiveDocumentId || (savedDocuments.length ? savedDocuments[0].id : DEFAULT_DOCUMENT_ID);

    return [{
      id: DEFAULT_BOOK_ID,
      title: 'Primer Libro del Autor',
      color: '#60A5FA',
      documents: savedDocuments,
      notes: savedNotes.map((note, index) => {
        const order = note.order !== undefined ? note.order : (note.row || 0) * 3 + (note.column || index % 3);
        return { ...note, type: note.type || 'note', order };
      }),
      characters: savedCharacters.map(char => ({ ...char, folderId: char.folderId || null })),
      chapters: savedChapters,
      folders: savedFolders,
      activeDocumentId: activeDocId
    }];
  })();

  const [books, setBooks] = useState(initialBooks);
  const [activeBookId, setActiveBookId] = useState(() => {
    const storedId = JSON.parse(localStorage.getItem('activeBookId'));
    if (storedId && initialBooks.some(book => book.id === storedId)) return storedId;
    return initialBooks[0].id;
  });

  const activeBook = books.find(book => book.id === activeBookId) || books[0];

  const [activeTab, setActiveTab] = useState('Personajes');
  const [characters, setCharacters] = useState(activeBook.characters || []);
  const [folders, setFolders] = useState(activeBook.folders || []);
  const [notes, setNotes] = useState(activeBook.notes || []);
  const [chapters, setChapters] = useState(activeBook.chapters || []);
  const [documents, setDocuments] = useState(activeBook.documents.length ? activeBook.documents : [{
    id: DEFAULT_DOCUMENT_ID,
    title: 'Sin título',
    blocks: [{ id: DEFAULT_DOCUMENT_ID + 1, content: '' }]
  }]);
  const [activeDocumentId, setActiveDocumentId] = useState(activeBook.activeDocumentId || (activeBook.documents?.[0]?.id || null));

  const [activeEntity, setActiveEntity] = useState(null); 
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeChapterId, setActiveChapterId] = useState(null);
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [bookForm, setBookForm] = useState({ id: null, title: '', description: '', genre: '', color: '#60A5FA' });

  useEffect(() => {
    if (!activeBook) return;
    setCharacters(activeBook.characters || []);
    setFolders(activeBook.folders || []);
    setNotes(activeBook.notes || []);
    setChapters(activeBook.chapters || []);
    setDocuments(activeBook.documents.length ? activeBook.documents : [{
      id: Date.now(),
      title: 'Sin título',
      blocks: [{ id: Date.now() + 1, content: '' }]
    }]);
    setActiveDocumentId(activeBook.activeDocumentId || (activeBook.documents?.[0]?.id || null));
  }, [activeBookId]);

  useEffect(() => { localStorage.setItem('books', JSON.stringify(books)); }, [books]);
  useEffect(() => { if (activeBookId != null) localStorage.setItem('activeBookId', JSON.stringify(activeBookId)); }, [activeBookId]);

  useEffect(() => {
    if (!activeBook) return;
    setBooks(prev => prev.map(book => book.id === activeBookId ? { ...book, characters } : book));
  }, [characters, activeBookId]);

  useEffect(() => {
    if (!activeBook) return;
    setBooks(prev => prev.map(book => book.id === activeBookId ? { ...book, folders } : book));
  }, [folders, activeBookId]);

  useEffect(() => {
    if (!activeBook) return;
    setBooks(prev => prev.map(book => book.id === activeBookId ? { ...book, notes } : book));
  }, [notes, activeBookId]);

  useEffect(() => {
    if (!activeBook) return;
    setBooks(prev => prev.map(book => book.id === activeBookId ? { ...book, chapters } : book));
  }, [chapters, activeBookId]);

  useEffect(() => {
    if (!activeBook) return;
    setBooks(prev => prev.map(book => book.id === activeBookId ? { ...book, documents } : book));
  }, [documents, activeBookId]);

  useEffect(() => {
    if (!activeBook) return;
    setBooks(prev => prev.map(book => book.id === activeBookId ? { ...book, activeDocumentId } : book));
  }, [activeDocumentId, activeBookId]);

  useEffect(() => {
    if (documents.length === 0) {
      const newDocument = { id: Date.now(), title: 'Sin título', blocks: [{ id: Date.now() + 1, content: '' }] };
      setDocuments([newDocument]);
      setActiveDocumentId(newDocument.id);
    }
  }, [documents]);

  useEffect(() => {
    if (documents.length > 0 && activeDocumentId != null && !documents.some(doc => doc.id === activeDocumentId)) {
      setActiveDocumentId(documents[0].id);
    }
    if (documents.length > 0 && activeDocumentId == null) {
      setActiveDocumentId(documents[0].id);
    }
  }, [documents, activeDocumentId]);

  const handleUpdateNotes = useCallback((newNotes) => setNotes(newNotes), []);

  const handleUpdateDocumentBlocks = useCallback((newBlocks) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === activeDocumentId ? { ...doc, blocks: newBlocks } : doc
    ));
  }, [activeDocumentId]);

  const handleCreateNewNote = (type) => {
    const maxOrder = notes.length > 0 ? Math.max(...notes.map(n => n.order || 0)) : -1;
    const newOrder = maxOrder + 1;
    const newNote = {
      id: Date.now(),
      type,
      title: type === 'note' ? 'Nueva Nota' : '',
      content: '',
      order: newOrder
    };
    setNotes(prev => [...prev, newNote]);
  };

  // Routing Simulation
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsPanelOpen(false);
    setActiveEntity(null);
    if (tab !== 'Capítulos') setActiveChapterId(null);
  };

  const handleOpenCreateBookModal = () => {
    setBookForm({ id: null, title: '', description: '', genre: '', color: '#60A5FA' });
    setBookModalOpen(true);
  };

  const handleOpenEditBook = (book) => {
    setBookForm({
      id: book.id,
      title: book.title || '',
      description: book.description || '',
      genre: book.genre || '',
      color: book.color || '#60A5FA'
    });
    setBookModalOpen(true);
  };

  const handleCloseBookModal = () => setBookModalOpen(false);

  const handleBookFormChange = (field, value) => {
    setBookForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateBook = () => {
    if (bookForm.id) {
      setBooks(prev => prev.map(book => book.id === bookForm.id ? {
        ...book,
        title: bookForm.title.trim() || 'Nuevo Libro',
        description: bookForm.description,
        genre: bookForm.genre,
        color: bookForm.color || '#60A5FA'
      } : book));
      setBookModalOpen(false);
      return;
    }

    const newDocumentId = Date.now() + 1;
    const newBook = {
      id: Date.now(),
      title: bookForm.title.trim() || 'Nuevo Libro',
      color: bookForm.color || '#60A5FA',
      description: bookForm.description,
      genre: bookForm.genre,
      documents: [{ id: newDocumentId, title: 'Sin título', blocks: [{ id: newDocumentId + 1, content: '' }] }],
      notes: [],
      characters: [],
      chapters: [],
      folders: [],
      activeDocumentId: newDocumentId,
    };
    setBooks(prev => [...prev, newBook]);
    setActiveBookId(newBook.id);
    setActiveEntity(null);
    setIsPanelOpen(false);
    setActiveChapterId(null);
    setBookModalOpen(false);
  };

  const handleSelectBook = (bookId) => {
    if (bookId === activeBookId) return;
    setActiveBookId(bookId);
    setActiveEntity(null);
    setIsPanelOpen(false);
    setActiveChapterId(null);
  };

  // Right Panel interactions
  const handleSelectEntity = (entity) => {
    setActiveEntity({ ...entity }); // clone for local editing
    setIsPanelOpen(true);
  };

  const handleCreateNewEntity = () => {
    if (activeTab === 'Personajes') {
      setActiveEntity({ name: "", color: "#888888", traits: [], description: "" });
    } else if (activeTab === 'Notas') {
      setActiveEntity({ title: "", content: "" });
    }
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setActiveEntity(null);
  };

  const handleChangeEntity = (field, value) => {
    setActiveEntity(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveEntity = () => {
    if (activeTab === 'Personajes') {
      if (activeEntity.id) {
        setCharacters(characters.map(c => c.id === activeEntity.id ? activeEntity : c));
      } else {
        setCharacters([...characters, { ...activeEntity, id: Date.now() }]);
      }
    } else if (activeTab === 'Notas') {
      if (activeEntity.id) {
        setNotes(notes.map(n => n.id === activeEntity.id ? activeEntity : n));
      } else {
        setNotes([...notes, { ...activeEntity, id: Date.now() }]);
      }
    }
    handleClosePanel();
  };

  const handleDeleteEntity = () => {
    if (activeTab === 'Personajes') {
      setCharacters(characters.filter(c => c.id !== activeEntity.id));
    } else if (activeTab === 'Notas') {
      setNotes(notes.filter(n => n.id !== activeEntity.id));
    }
    handleClosePanel();
  };


  const handleViewLinkedCharacter = (charId) => {
    const char = characters.find(c => c.id === charId);
    if (!char) return;
    setActiveTab('Personajes');
    setActiveEntity({ ...char });
    setIsPanelOpen(true);
  };

  const handleLinkNote = (noteId, charId) => {
    setNotes(prev => prev.map(n =>
      n.id === noteId ? { ...n, linkedCharacterId: charId || null } : n
    ));
    // also update activeEntity so the panel reflects change immediately
    setActiveEntity(prev => ({ ...prev, linkedCharacterId: charId || null }));
  };

  const handleOpenLinkedNote = (noteId) => {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    setActiveTab('Notas');
    setActiveEntity({ ...note });
    setIsPanelOpen(true);
  };

  // Chapter interactions
  const handleCreateChapter = () => {
    const newChapter = { id: Date.now(), title: "Nuevo Capítulo", content: "" };
    setChapters(prev => [...prev, newChapter]);
    setActiveChapterId(newChapter.id);
  };

  const handleCreateDocument = () => {
    const newDocument = { id: Date.now(), title: 'Sin título', blocks: [{ id: Date.now() + 1, content: '' }] };
    setDocuments(prev => [...prev, newDocument]);
    setActiveDocumentId(newDocument.id);
    setActiveTab('Documento');
  };

  const handleRenameDocument = (id, title) => {
    setDocuments(prev => prev.map(doc => doc.id === id ? { ...doc, title } : doc));
  };

  const handleFinalizeDocumentTitle = (id, title) => {
    setDocuments(prev => prev.map(doc => doc.id === id ? { ...doc, title: title.trim() || 'Sin título' } : doc));
  };

  const handleSelectDocument = (id) => {
    setActiveDocumentId(id);
    setActiveTab('Documento');
  };

  const handleDeleteDocument = (id) => {
    setDocuments(prev => {
      const next = prev.filter(doc => doc.id !== id);
      if (next.length === 0) {
        const newDocument = { id: Date.now(), title: 'Sin título', blocks: [{ id: Date.now() + 1, content: '' }] };
        setActiveDocumentId(newDocument.id);
        return [newDocument];
      }
      if (id === activeDocumentId) {
        setActiveDocumentId(next[0].id);
      }
      return next;
    });
  };

  const handleUpdateChapter = (id, data) => {
    setChapters(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const handleDeleteChapter = (id) => {
    setChapters(prev => prev.filter(c => c.id !== id));
    if (activeChapterId === id) setActiveChapterId(null);
  };

  const handleToggleCharacterInChapter = (chapterId, charId, add) => {
    setChapters(prev => prev.map(ch => {
      if (ch.id !== chapterId) return ch;
      const ids = ch.characterIds || [];
      const next = add ? [...new Set([...ids, charId])] : ids.filter(id => id !== charId);
      return { ...ch, characterIds: next };
    }));
  };

  const handleOpenChapterFromCharacter = (chapterId) => {
    setActiveTab('Capítulos');
    setActiveChapterId(chapterId);
    setIsPanelOpen(false);
    setActiveEntity(null);
  };

  const currentDocument = documents.find(doc => doc.id === activeDocumentId) || documents[0];
  const activeBlocks = currentDocument?.blocks || [{ id: Date.now(), content: '' }];

  return (
    <div className="app">
      <Sidebar
        activeTab={activeTab}
        onChangeTab={handleTabChange}
        books={books}
        activeBookId={activeBookId}
        onSelectBook={handleSelectBook}
        onCreateBook={handleOpenCreateBookModal}
        onEditBook={handleOpenEditBook}
        documents={documents}
        activeDocumentId={activeDocumentId}
        onCreateDocument={handleCreateDocument}
        onRenameDocument={handleRenameDocument}
        onSelectDocument={handleSelectDocument}
        onDeleteDocument={handleDeleteDocument}
      />
      {bookModalOpen && (
        <div className="modal-overlay">
          <div className="book-modal">
            <h2>{bookForm.id ? 'Editar libro' : 'Crear libro'}</h2>
            <label>
              Título
              <input
                value={bookForm.title}
                onChange={(e) => handleBookFormChange('title', e.target.value)}
                placeholder="Nombre del libro"
              />
            </label>
            <label>
              Descripción
              <textarea
                value={bookForm.description}
                onChange={(e) => handleBookFormChange('description', e.target.value)}
                placeholder="Descripción del libro"
              />
            </label>
            <label>
              Género
              <input
                value={bookForm.genre}
                onChange={(e) => handleBookFormChange('genre', e.target.value)}
                placeholder="Género"
              />
            </label>
            <div className="modal-actions">
              <button type="button" className="secondary-btn" onClick={handleCloseBookModal}>Cancelar</button>
              <button type="button" className="primary-btn" onClick={handleCreateBook}>{bookForm.id ? 'Guardar' : 'Crear libro'}</button>
            </div>
          </div>
        </div>
      )}
      
      <main className="main-area">
        <Topbar />
        
        <div className="content-layout">
          <div className="center-panel">
            <div className="top-tabs">
              <button className="tab-pill active">Personajes</button>
              <button className="tab-pill">Título de pestaña</button>
              <button className="tab-pill add-pill">＋</button>
            </div>
            {activeTab === 'Documento' && (
              <WorkspaceView
              blocks={activeBlocks}
              documentTitle={currentDocument?.title}
              onUpdateDocumentTitle={(title) => handleRenameDocument(currentDocument.id, title)}
              onFinalizeDocumentTitle={(title) => handleFinalizeDocumentTitle(currentDocument.id, title)}
              onUpdateBlocks={handleUpdateDocumentBlocks}
              characters={characters}
              notes={notes}
              chapters={chapters}
              onOpenRef={(type, id) => {
                if (type === 'chapter') {
                  setActiveTab('Capítulos');
                  setActiveChapterId(id);
                  setIsPanelOpen(false);
                  setActiveEntity(null);
                  return;
                }
                const entity = type === 'character'
                  ? characters.find(c => c.id === id)
                  : notes.find(n => n.id === id);
                if (!entity) return;
                setActiveEntity({ ...entity, _refType: type });
                setIsPanelOpen(true);
              }}
              onCreateChapter={(insertFn) => {
                const newChapter = { id: Date.now(), title: 'Nuevo Capítulo', content: '', characterIds: [] };
                setChapters(prev => [...prev, newChapter]);
                insertFn(newChapter.id);
              }}
            />
          )}

          {activeTab === 'Personajes' && (
            <CharacterView 
              characters={characters}
              folders={folders}
              onSelectCharacter={handleSelectEntity}
              onCreateNew={handleCreateNewEntity}
              onUpdateCharacters={setCharacters}
              onUpdateFolders={setFolders}
            />
          )}

          {activeTab === 'Notas' && (
            <NotesView 
              notes={notes}
              characters={characters}
              onSelectNote={handleSelectEntity}
              onCreateNew={handleCreateNewNote}
              onViewLinkedCharacter={handleViewLinkedCharacter}
              onUpdateNotes={handleUpdateNotes}
            />
          )}

          {activeTab === 'Capítulos' && (
            <ChaptersView
              chapters={chapters}
              characters={characters}
              activeChapterId={activeChapterId}
              onSelectChapter={setActiveChapterId}
              onCreateNew={handleCreateChapter}
              onUpdateChapter={handleUpdateChapter}
              onDeleteChapter={handleDeleteChapter}
              onToggleCharacter={handleToggleCharacterInChapter}
            />
          )}
          
          {isPanelOpen && (activeTab === 'Personajes' || activeTab === 'Notas' || activeTab === 'Documento') && activeEntity && (
            <RightPanel 
              activeEntity={activeEntity}
              entityType={
                activeEntity._refType ||
                (activeTab === 'Personajes' ? 'character' : 'note')
              }
              characters={characters}
              notes={notes}
              chapters={chapters}
              onClose={handleClosePanel}
              onChange={handleChangeEntity}
              onSave={handleSaveEntity}
              onDelete={handleDeleteEntity}
              onLinkNote={handleLinkNote}
              onViewLinkedCharacter={handleViewLinkedCharacter}
              onOpenLinkedNote={handleOpenLinkedNote}
              onOpenChapter={handleOpenChapterFromCharacter}
            />
          )}
          </div>
        </div>
      </main>
    </div>
  );
}
