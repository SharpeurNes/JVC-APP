import { useState, useEffect } from 'react'
import HomePage from './pages/HomePage'
import TopicPage from './pages/TopicPage'

function App() {
  // On essaie de récupérer la dernière vue sauvegardée au démarrage
  const [view, setView] = useState(() => {
    try {
      const saved = localStorage.getItem('last_view');
      if (saved && saved !== "undefined") {
        const parsed = JSON.parse(saved);
        // Sécurité CRITIQUE : on vérifie que l'objet a bien la propriété 'name'
        if (parsed && parsed.name) {
          return parsed;
        }
      }
    } catch (e) {
      console.error("Erreur de lecture du cache", e);
    }
    // Retour à la normale si le cache est vide ou corrompu
    return { name: 'home', data: null };
  });

  const [topicsCache, setTopicsCache] = useState([]);

  const [user, setUser] = useState({ isConnected: false, username: '' });
  const [loading, setLoading] = useState(true); // Pour éviter un flash du bouton connexion

  const handleLogout = async () => {
    await window.api.logout(); // Vide les cookies côté Electron
    setUser({ isConnected: false, username: '' }); // Remet le bouton Connexion côté React
  };

  // 1. Uniquement pour le lancement (Init de l'app)
  useEffect(() => {
    const verifySession = async () => {
      const session = await window.api.checkSession();
      if (session.isConnected && session.username != "CONNEXION") {
        setUser(session);
      }
      setLoading(false);
    };
    verifySession();

    window.api.onAuthSuccess((data) => {
      setUser(data);
      localStorage.setItem('jvc_pseudo', data.username);
    });
  }, []); // [] = s'exécute UNE SEULE FOIS au démarrage

  // 2. Uniquement pour la sauvegarde de la vue
  useEffect(() => {
    if (view && view.name) {
      localStorage.setItem('last_view', JSON.stringify(view));
    }
  }, [view]); // S'exécute quand la vue change

  if (loading) return <div style={{ color: 'white' }}>Chargement...</div>;

  return (
    <div>
      {/* HEADER FIXE */}
      <header className="app-header">
        <div className="app-logo" onClick={() => setView({ name: 'home', data: null })} style={{ cursor: 'pointer' }}>
          <div className="logo-mark">
            <svg viewBox="0 0 16 16"><path d="M8 1L2 4v5c0 3.3 2.5 5.7 6 6.9 3.5-1.2 6-3.6 6-6.9V4L8 1z" /></svg>
          </div>
          <span className="app-name">JVC-APP</span>
        </div>
        <nav className="app-nav">
          <button className="nav-link active">Accueil</button>
          <button className="nav-link">Catégories</button>
          <button className="nav-link">Membres</button>
        </nav>
        <div className="user-zone">

          {user.isConnected ? (
            <div className="user-zone">
              <div className="user-pill">
                <div className="avatar-sm">MR</div>
                <span>{user.username}</span>
              </div>
              <button className="btn-logout" title="Déconnexion" onClick={handleLogout}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
              </button>
            </div>
          ) : (
            <div className="user-zone">
              <button
                onClick={() => window.api.openLoginWindow()}
                className="btn-logout"
              >
                Connexion
              </button>
            </div>
          )}


        </div>
      </header>

      {/* CONTENU DES PAGES */}
      <div style={{ display: view.name === 'home' ? 'block' : 'none' }}>
        <HomePage
          cache={topicsCache}
          setCache={setTopicsCache}
          onSelectTopic={(topic) => setView({ name: 'topic', data: topic })}
        />
      </div>

      {/* AJOUT DE LA KEY ICI : c'est le fix magique */}
      {view.name === 'topic' && view.data && (
        <TopicPage
          key={view.data.url} 
          topic={view.data}
          onBack={() => setView({ name: 'home', data: null })}
        />
      )}
    </div>
  );
}

export default App