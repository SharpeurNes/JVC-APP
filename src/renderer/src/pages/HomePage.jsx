import { useState, useEffect, useCallback } from 'react'
import TopicItem from '../components/TopicItem'

export default function HomePage({ cache, setCache, onSelectTopic }) {
  // On gère l'URL actuelle. Par défaut : page 1
  const [currentUrl, setCurrentUrl] = useState('https://www.jeuxvideo.com/forums/0-34008-0-1-0-1-0-lost-ark.htm');
  const [currentPage, setCurrentPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);
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
        setMaxPage(result.maxPage || 1);
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
    console.log("Navigation vers URL :", newUrl); // Log pour vérifier l'URL générée
    setCurrentUrl(newUrl);
    window.scrollTo(0, 0);
  };

  return (
    <main className="container">

      <div className="forum-header">
        <div className="forum-title-block">
          <div className="forum-title">Derniers sujets - Page {currentPage}</div>
          <div className="online-badge">
            <span className="dot-green"></span>
            142 connectés en ce moment
          </div>
        </div>
        <button onClick={() => loadData(currentUrl)} disabled={loading} className="btn-refresh">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.5 15a9 9 0 1 1-2.6-7.4L23 10" /></svg>
          {loading ? '...' : 'Actualiser'}
        </button>
      </div>

      <div className="pag-bar">
        <button className="pag-btn" onClick={() => goToPage(1)} disabled={loading || currentPage === 1}>« 1</button>
        <button className="pag-btn" onClick={() => goToPage(currentPage - 1)} disabled={loading || currentPage === 1}>‹</button>
        <span className="pag-sep"></span>
        <span className="pag-info">Page {currentPage} sur {maxPage}</span>
        <span className="pag-sep"></span>

        <button className="pag-btn" onClick={() => goToPage(currentPage + 1)} disabled={loading || currentPage >= maxPage}>›</button>
        <button className="pag-btn" onClick={() => goToPage(maxPage)} disabled={loading || currentPage >= maxPage}>»</button>

      </div>




      {loading && cache.length === 0 ? (
        <p>Chargement des sujets...</p>
      ) : (
        <div style={{ padding: '0 1rem' }}>
          <div className="col-headers">
            <div></div>
            <div className="col-h">Sujet</div>
            <div className="col-h center">Messages</div>
            <div className="col-h right">Dernier msg</div>
          </div>

          <div className="topic-list" id="topic-list" style={{ opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
            {cache.map((t, i) => (
              <TopicItem
                i={i}
                key={t.id}
                topic={t}
                onClick={() => {
                  console.log("Clic sur :", t.title); // Ajoute ce log pour tester
                  onSelectTopic(t);
                }}
              />
            ))}
          </div>


          <div className="pag-bar">
            <button className="pag-btn" onClick={() => goToPage(1)} disabled={loading || currentPage === 1}>« 1</button>
            <button className="pag-btn" onClick={() => goToPage(currentPage - 1)} disabled={loading || currentPage === 1}>‹</button>
            <span className="pag-sep"></span>
            <span className="pag-info">Page {currentPage} sur {maxPage}</span>
            <span className="pag-sep"></span>

            <button className="pag-btn" onClick={() => goToPage(currentPage + 1)} disabled={loading || currentPage >= maxPage}>›</button>
            <button className="pag-btn" onClick={() => goToPage(maxPage)} disabled={loading || currentPage >= maxPage}>»</button>

          </div>
        </div>
      )}

    </main>
  );
}