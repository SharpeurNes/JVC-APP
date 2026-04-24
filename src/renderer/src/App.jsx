import { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import TopicPage from './pages/TopicPage';
import ProfilPage from './pages/ProfilPage';
// 1. Import du store
import { useNavigationStore } from './store/useNavigationStore';

function App() {
  // 2. On récupère view et setView depuis le store global
  const { view, setView } = useNavigationStore();

  const [topicsCache, setTopicsCache] = useState([]);
  const [user, setUser] = useState({ isConnected: false, username: '' });
  const [loading, setLoading] = useState(true);
  const [forumId, setForumId] = useState(34008);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const forums = [
    { id: 51, name: "18-25" },
    { id: 1000021, name: "Communaute" },
    { id: 19163, name: "League of Legends" },
    { id: 36, name: "Guerre des consoles" },
    { id: 98, name: "Animation" },
    { id: 34008, name: "Lost Ark (Testing)" }
  ];

  const handleLogout = async () => {
    await window.api.logout();
    setUser({ isConnected: false, username: '' });
  };

  useEffect(() => {
    const verifySession = async () => {
      const session = await window.api.checkSession();
      if (session.isConnected && session.username !== "CONNEXION") {
        setUser(session);
      }
      setLoading(false);
    };
    verifySession();

    window.api.onAuthSuccess((data) => {
      setUser(data);
      localStorage.setItem('jvc_pseudo', data.username);
    });
  }, []);

  const handleForumChange = (id) => {
    setForumId(id);
    setIsMenuOpen(false);
    setView({name: 'home', data: null})
  };

  if (loading) return <div style={{ color: 'white' }}>Chargement...</div>;

console.log("Vue actuelle :", view);

  return (
    <div>
      <header className="app-header">
        {/* Navigation vers Home via Store */}
        <div className="app-logo" onClick={() => setView({ name: 'home', data: null })} style={{ cursor: 'pointer' }}>
          <div className="logo-mark">
            <svg viewBox="0 0 16 16"><path d="M8 1L2 4v5c0 3.3 2.5 5.7 6 6.9 3.5-1.2 6-3.6 6-6.9V4L8 1z" /></svg>
          </div>
          <span className="app-name">JVC-APP</span>
        </div>

        <nav className="app-nav">
          <button className="nav-link" onClick={() => setView({ name: 'home', data: null })}>Accueil</button>
          <div className="nav-dropdown-container">
            <button className="nav-link" onClick={() => setIsMenuOpen(!isMenuOpen)}>Forums ▾</button>
            {isMenuOpen && (
              <ul className="nav-dropdown-menu">
                {forums.map(f => (
                  <li key={f.id}>
                    <button
                      className="dropdown-item"
                      onClick={() => handleForumChange(f.id)}
                      style={{ fontWeight: forumId === f.id ? 'bold' : 'normal' }}
                    >
                      {f.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button className="nav-link">Classement</button>
        </nav>

        <div className="user-zone">
          {user.isConnected ? (
            <div className="user-zone-content" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {/* Navigation vers Profil via Store */}
              <div className="user-pill" onClick={() => setView({ name: 'profil', data: user.username })} style={{ cursor: 'pointer' }}>
                <div className="avatar-xs">
                  <img className="avatar-xs" src={user.avatarUrl || 'https://image.jeuxvideo.com/avatar-md/default.jpg'} alt="Avatar" />
                </div>
                <span>{user.username}</span>
              </div>
              <button className="btn-logout" title="Déconnexion" onClick={handleLogout}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
              </button>
            </div>
          ) : (
            <button onClick={() => window.api.openLoginWindow()} className="btn-login">Connexion</button>
          )}
        </div>
      </header>

      {/* Pages */}
      <div style={{ display: view.name === 'home' ? 'block' : 'none' }}>
        <HomePage
          cache={topicsCache}
          setCache={setTopicsCache}
          onSelectTopic={(topic) => setView({ name: 'topic', data: topic })}
          forumId={forumId}
        />
      </div>

      {view.name === 'topic' && view.data && (
        <TopicPage
          key={view.data.url}
          topic={view.data}
          onBack={() => setView({ name: 'home', data: null })}
          myUsername={user.username}
        />
      )}

      {view.name === 'profil' && view.data && (
        <ProfilPage username={view.data} />
      )}
    </div>
  );
}

export default App;