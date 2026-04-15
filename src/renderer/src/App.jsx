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

  useEffect(() => {
    // On ne sauvegarde que si view est valide
    if (view && view.name) {
      localStorage.setItem('last_view', JSON.stringify(view));
    }
  }, [view]);

  return (
    <div>
      <header className="header">
        <div className="logo" onClick={() => setView({ name: 'home', data: null })} style={{cursor: 'pointer'}}>
          🚀 <b>JVC-APP</b>
        </div>
        {view.name === 'topic' && (
          <button onClick={() => setView({ name: 'home', data: null })}>⬅ Retour</button>
        )}
      </header>

      {/* On utilise un affichage conditionnel pour ne pas détruire HomePage */}
      <div style={{ display: view.name === 'home' ? 'block' : 'none' }}>
        <HomePage 
          cache={topicsCache} 
          setCache={setTopicsCache} 
          onSelectTopic={(topic) => setView({ name: 'topic', data: topic })} 
        />
      </div>

      {/* TopicPage peut être recréé à chaque fois, c'est mieux pour la mémoire */}
      {view.name === 'topic' && (
        <TopicPage topic={view.data} />
      )}
    </div>
  )
}

export default App