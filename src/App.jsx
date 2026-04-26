import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { CharacterGrid } from './components/CharacterGrid';
import { RightPanel } from './components/RightPanel';
import { NotesView } from './components/NotesView';
import { ChaptersView } from './components/ChaptersView';
import './index.css';

const INITIAL_CHARACTERS = [
  { id: 1, name: "Idetsu", color: "#60A5FA", traits: ["Valiente", "Testarudo"], description: "El héroe principal de la historia." },
  { id: 2, name: "Hlami", color: "#C084FC", traits: ["Inteligente", "Silenciosa"], description: "Maga misteriosa del bosque." },
  { id: 3, name: "Doromi", color: "#FBBF24", traits: ["Fuerte", "Leal"], description: "Guerrera protectora." },
  { id: 4, name: "Rokoshi", color: "#F87171", traits: ["Astuto", "Vengativo"], description: "El rival oscuro." }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('Personajes');
  
  const [characters, setCharacters] = useState(() => JSON.parse(localStorage.getItem('characters')) || INITIAL_CHARACTERS);
  const [notes, setNotes] = useState(() => JSON.parse(localStorage.getItem('notes')) || []);
  const [chapters, setChapters] = useState(() => JSON.parse(localStorage.getItem('chapters')) || []);

  const [activeEntity, setActiveEntity] = useState(null); 
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeChapterId, setActiveChapterId] = useState(null);

  // Persistence
  useEffect(() => { localStorage.setItem('characters', JSON.stringify(characters)); }, [characters]);
  useEffect(() => { localStorage.setItem('notes', JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem('chapters', JSON.stringify(chapters)); }, [chapters]);

  // Routing Simulation
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setIsPanelOpen(false);
    setActiveEntity(null);
    if (tab !== 'Capítulos') setActiveChapterId(null);
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

  const handleConvertToCharacter = () => {
    const charData = {
      name: activeEntity.title || "Nuevo Personaje",
      color: "#60A5FA",
      traits: [],
      description: activeEntity.content || ""
    };
    setActiveTab('Personajes');
    setActiveEntity(charData);
    setIsPanelOpen(true);
  };

  // Chapter interactions
  const handleCreateChapter = () => {
    const newChapter = { id: Date.now(), title: "Nuevo Capítulo", content: "" };
    setChapters([...chapters, newChapter]);
    setActiveChapterId(newChapter.id);
  };

  const handleUpdateChapter = (id, data) => {
    setChapters(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} onChangeTab={handleTabChange} />
      
      <main className="main-area">
        <Topbar />
        
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {activeTab === 'Personajes' && (
            <CharacterGrid 
              characters={characters} 
              onSelectCharacter={handleSelectEntity}
              onCreateNew={handleCreateNewEntity}
            />
          )}

          {activeTab === 'Notas' && (
            <NotesView 
              notes={notes}
              onSelectNote={handleSelectEntity}
              onCreateNew={handleCreateNewEntity}
            />
          )}

          {activeTab === 'Capítulos' && (
            <ChaptersView
              chapters={chapters}
              activeChapterId={activeChapterId}
              onSelectChapter={setActiveChapterId}
              onCreateNew={handleCreateChapter}
              onUpdateChapter={handleUpdateChapter}
            />
          )}
          
          {isPanelOpen && (activeTab === 'Personajes' || activeTab === 'Notas') && (
            <RightPanel 
              activeEntity={activeEntity}
              entityType={activeTab === 'Personajes' ? 'character' : 'note'}
              onClose={handleClosePanel}
              onChange={handleChangeEntity}
              onSave={handleSaveEntity}
              onDelete={handleDeleteEntity}
              onConvertToCharacter={handleConvertToCharacter}
            />
          )}
        </div>
      </main>
    </div>
  );
}
