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

  const [user, setUser] = useState({ isConnected: false, username: ''});
  const [loading, setLoading] = useState(true); // Pour éviter un flash du bouton connexion

  const handleLogout = async () => {
    await window.api.logout(); // Vide les cookies côté Electron
    setUser({ isConnected: false, username: '' }); // Remet le bouton Connexion côté React
  };

  useEffect(() => {
    window.api.onAuthSuccess((data) => {
        setUser(data);
        console.log("Bienvenue", data.username);
    });

    const verifySession = async () => {
      const session = await window.api.checkSession();
      if (session.isConnected) {
        setUser(session);
      }
      setLoading(false);
    };

    // On ne sauvegarde que si view est valide
    if (view && view.name) {
      localStorage.setItem('last_view', JSON.stringify(view));
    }

    verifySession();
  }, [view]);

if (loading) return <div style={{color: 'white'}}>Chargement...</div>;

  return (
  <div>
<header className="header" style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 20px', backgroundColor: '#18191b', color: 'white', borderBottom: '1px solid #333'
  }}>
    <div className="logo" onClick={() => setView({ name: 'home', data: null })} style={{cursor: 'pointer'}}>
      🚀 <b>JVC-APP</b>
    </div>
    
    {/* Section Utilisateur à droite */}
    <div className="user-section">
    {user.isConnected ? (
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '12px', color: '#888' }}>Connecté :</span>
          <span style={{ color: '#ffca28', fontWeight: 'bold' }}>{user.username}</span>
        </div>
        
        {/* Bouton Déconnexion */}
        <button 
          onClick={handleLogout}
          style={{ 
            background: '#d32f2f', 
            color: 'white', 
            border: 'none', 
            padding: '4px 8px', 
            borderRadius: '4px', 
            fontSize: '11px',
            cursor: 'pointer',
            textTransform: 'uppercase'
          }}
        >
          Déconnexion
        </button>
      </div>
    ) : (
      <button 
        onClick={() => window.api.openLoginWindow()} 
        style={{ /* ton style actuel */ }}
      >
        Connexion
      </button>
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

    {view.name === 'topic' && (
      <TopicPage 
        topic={view.data} 
        onBack={() => setView({ name: 'home', data: null })} 
      />
    )}
  </div>
);
}

export default App