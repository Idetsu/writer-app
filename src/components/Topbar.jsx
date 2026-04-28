import { useState, useEffect, useRef } from 'react';

export function Topbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const menuRef = useRef(null);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        setNotifOpen(false);
        setProfileOpen(false);
      }
    };

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-content">
        <div className="search-wrapper" ref={menuRef}>
          <input
            type="text"
            className="search-input"
            placeholder="Búsqueda rápida..."
          />
          <button
            type="button"
            onClick={() => setMenuOpen(prev => !prev)}
            className="search-icon-button"
            title="Buscar"
          >
            🔍
          </button>
          {menuOpen && (
            <div className="popover-panel" style={{ right: 0, top: '100%' }}>
              <button
                onClick={() => setMenuOpen(false)}
                className="popover-item"
              >
                Opción de prueba
              </button>
            </div>
          )}
        </div>

        <div className="user-actions">
          <div ref={notifRef} className="popover-wrapper">
            <button
              className="icon-button"
              onClick={() => setNotifOpen(prev => !prev)}
              title="Notificaciones"
            >
              🔔
            </button>
            {notifOpen && (
              <div className="popover-panel" style={{ right: 0, top: '44px' }}>
                <div className="popover-header">
                  <span>🔔</span>
                  <span>Notificaciones</span>
                </div>
                <button
                  onClick={() => setNotifOpen(false)}
                  className="popover-item"
                >
                  Notificación de prueba
                </button>
              </div>
            )}
          </div>

          <div ref={profileRef} className="popover-wrapper">
            <button
              className="icon-button profile-button"
              onClick={() => setProfileOpen(prev => !prev)}
              title="Perfil"
            >
              <span className="profile-avatar">U</span>
              <span>Usuario</span>
            </button>
            {profileOpen && (
              <div className="popover-panel" style={{ right: 0, top: '50px' }}>
                <div className="popover-header">
                  <span className="profile-avatar">U</span>
                  <div>
                    <div>Usuario</div>
                    <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>Cuenta</div>
                  </div>
                </div>
                <div className="popover-list">
                  {['Perfil', 'Configuraciones', 'Cerrar sesión'].map(option => (
                    <button
                      key={option}
                      onClick={() => setProfileOpen(false)}
                      className="popover-item"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
