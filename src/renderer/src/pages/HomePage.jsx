import { useState, useEffect, useCallback } from 'react'
import TopicItem from '../components/TopicItem'

export default function HomePage({ cache, setCache, onSelectTopic }) {
  // On gère l'URL actuelle. Par défaut : page 1
  const [currentUrl, setCurrentUrl] = useState('https://www.jeuxvideo.com/forums/0-34008-0-1-0-1-0-lost-ark.htm');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);

const loadData = useCallback(async (url) => {
    setLoading(true);
    try {
      const result = await window.api.fetchTopics(url);
      
      // /!\ CRUCIAL : On ne met en cache QUE le tableau
      // Si tu mets 'result' entier, cache.map() ne marchera plus
      if (result && result.topics) {
      setCache(result.topics); // On stocke uniquement le tableau dans le cache
      setCurrentPage(result.currentPage || 1);
      }

    } catch (err) {
      console.error("Erreur chargement:", err);
    } finally {
      setLoading(false);
    }
  }, [setCache]);

  useEffect(() => {
    loadData(currentUrl);
  }, [currentUrl, loadData]);

  const goToPage = (pageNumber) => {
    if (pageNumber < 1) return;

    // Calcul de l'index JVC : (Page - 1) * 25 + 1
    // Page 1 -> 1 | Page 2 -> 26 | Page 3 -> 51
    const jvcIndex = (pageNumber - 1) * 25 + 1;

    const parts = currentUrl.split('-');
    parts[5] = jvcIndex; // L'index est le 6ème élément (index 5)
    
    const newUrl = parts.join('-');
    setCurrentUrl(newUrl);
    window.scrollTo(0, 0);
  };

  return (
    <main className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h3 style={{ margin: 0 }}>Derniers sujets - Page {currentPage}</h3>
        <button onClick={() => loadData(currentUrl)} disabled={loading}>
          {loading ? '...' : '🔄 Actualiser'}
        </button>
      </div>

      {/* Barre de navigation simple */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center' }}>
        <button onClick={() => goToPage(1)} disabled={loading || currentPage === 1}>
          Première
        </button>
        <button onClick={() => goToPage(currentPage - 1)} disabled={loading || currentPage === 1}>
          Précédente
        </button>
        <span style={{ alignSelf: 'center', fontWeight: 'bold' }}>{currentPage}</span>
        <button onClick={() => goToPage(currentPage + 1)} disabled={loading}>
          Suivante
        </button>
      </div>

      {loading && cache.length === 0 ? (
        <p>Chargement des sujets...</p>
      ) : (
        <div style={{ opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
          {cache.map(t => (
            <TopicItem 
              key={t.id} 
              topic={t} 
              onClick={() => {
                console.log("Clic sur :", t.title); // Ajoute ce log pour tester
                onSelectTopic(t); 
              }} 
            />
          ))}
        </div>
      )}
      
      {/* Rappel navigation en bas */}
      {!loading && (
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'center' }}>
          <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>Précédente</button>
          <button onClick={() => goToPage(currentPage + 1)}>Suivante</button>
        </div>
      )}
    </main>
  );
}