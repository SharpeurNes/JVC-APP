import { useState, useEffect, useCallback } from 'react'
import TopicItem from '../components/TopicItem'

export default function HomePage({ cache, setCache, onSelectTopic, forumId }) {
  // On gère l'URL actuelle. Par défaut : page 1
  const [currentPage, setCurrentPage] = useState(1);
  const [maxPage, setMaxPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [forumName, setForumName] = useState("Forum");

  const currentUrl = `https://www.jeuxvideo.com/forums/0-${forumId}-0-1-0-${((currentPage - 1) * 25) + 1}-0-x.htm`;

  const loadData = useCallback(async (url) => {
    setLoading(true);
    try {
      console.log("🔥 Fetching URL:", currentUrl);
      const result = await window.api.fetchTopics(url);
      if (result && result.topics) {
        setForumName(result.forumName);
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
    let isCancelled = false;

    const fetchData = async () => {
      await new Promise(resolve => setTimeout(resolve, 50));

      if (isCancelled) return
      console.log("🔥 Appel unique pour :", currentUrl);
      loadData(currentUrl, loadData);
    }

    fetchData();

    return () => {
      isCancelled = true; // Si React remonte le composant, la première exécution s'arrêtera ici
    };
    
  }, [currentUrl]);


  useEffect(() => {
    setCurrentPage(1);
  }, [forumId]);

const goToPage = (pageNumber) => {
  if (pageNumber < 1 || pageNumber > maxPage) return;

  setCurrentPage(pageNumber);

  window.scrollTo({ top: 0, behavior: 'smooth' });
  
};


console.log(cache);

  return (
    <main className="container">

      <div className="forum-header">
        <div className="forum-title-block">
          <div className="forum-title">{forumName}</div>
          <div className="online-badge">
            <span className="dot-green"></span>
            142 connectés en ce moment
          </div>
        </div>
        <button onClick={() => loadData(currentUrl)} disabled={loading} className="btn-refresh">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10" /><path d="M20.5 15a9 9 0 1 1-2.6-7.4L23 10" /></svg>
          Actualiser
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
        <div>
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