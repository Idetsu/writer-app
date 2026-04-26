import { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { Topbar } from './components/Topbar'
import { CharacterGrid } from './components/CharacterGrid'
import { RightPanel } from './components/RightPanel'
import './index.css'

const INITIAL_CHARACTERS = [
  { id: 1, name: "Idetsu", color: "#60A5FA", traits: ["Valiente", "Testarudo"], description: "El héroe principal de la historia." },
  { id: 2, name: "Hlami", color: "#C084FC", traits: ["Inteligente", "Silenciosa"], description: "Maga misteriosa del bosque." },
  { id: 3, name: "Doromi", color: "#FBBF24", traits: ["Fuerte", "Leal"], description: "Guerrera protectora." },
  { id: 4, name: "Rokoshi", color: "#F87171", traits: ["Astuto", "Vengativo"], description: "El rival oscuro." }
];

export default function App() {
  const [characters] = useState(INITIAL_CHARACTERS);
  const [selectedCharacter, setSelectedCharacter] = useState(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleSelectCharacter = (char) => {
    setSelectedCharacter(char);
    setIsPanelOpen(true);
  };

  const handleCreateNew = () => {
    setSelectedCharacter({
      name: "",
      color: "#888888",
      traits: [],
      description: ""
    });
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setSelectedCharacter(null);
  };

  const handleCharacterChange = (field, value) => {
    setSelectedCharacter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="app-container">
      <Sidebar />
      
      <main className="main-area">
        <Topbar />
        
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <CharacterGrid 
            characters={characters} 
            onSelectCharacter={handleSelectCharacter}
            onCreateNew={handleCreateNew}
          />
          
          {isPanelOpen && (
            <RightPanel 
              character={selectedCharacter}
              onClose={handleClosePanel}
              onChange={handleCharacterChange}
            />
          )}
        </div>
      </main>
    </div>
  );
}
