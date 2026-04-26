export function Sidebar({ activeTab, onChangeTab }) {
  const tabs = ['Capítulos', 'Personajes', 'Notas'];

  return (
    <aside className="sidebar">
      <h2>Writer's App</h2>
      <ul className="sidebar-nav">
        {tabs.map(tab => (
          <li 
            key={tab}
            className={activeTab === tab ? 'active' : ''}
            onClick={() => onChangeTab(tab)}
          >
            {tab}
          </li>
        ))}
      </ul>
    </aside>
  );
}
