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

  const [isCreatingTopic, setIsCreatingTopic] = useState(false);
  const [topicTitle, setTopicTitle] = useState('');
  const [topicMessage, setTopicMessage] = useState('');

  const handlePostTopic = async (messageText) => {
    if (topicMessage.trim().length < 3) {
      alert("Message trop court !");
      return;
    }
    setIsCreatingTopic(true);
    try {
      const res = await window.api.postTopic({ topicTitle: topicTitle, topicMsg: topicMessage });

      if (res.success) {
        setIsCreatingTopic(false);
        onSelectTopic(
          {
            id: "",
            title: topicTitle,
            author: "",
            avatar: "",
            msgCount: "",
            time: "",
            url: "https://www.jeuxvideo.com" + res.json.redirectUrl,
          }
        )
      } else {
        alert("Erreur : " + res.error);
      }
    } catch (err) {
      console.error(err);
      setIsCreatingTopic(false);
    } finally {
      setIsCreatingTopic(false);
    }

    setTopicMessage(''); // Vide le champ après l'envoi
    setTopicTitle('');
  };

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
            {console.log(cache)}
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

          <div className="newtopic-zone">
            <div className="newtopic-top">
              <span className="newtopic-label">Nouveau topic</span>
            </div>
            <div className="newtopic-body">
              <textarea id="newtopic-textarea" maxLength="100" placeholder="Titre du topic..."
                value={topicTitle}
                onChange={(e) => setTopicTitle(e.target.value)}
                disabled={isCreatingTopic}></textarea>
            </div>
            <div className="newtopic-body">
              <textarea id="reply-textarea" maxLength="16000" placeholder="Écrire le contenu du topic..."
                value={topicMessage}
                onChange={(e) => setTopicMessage(e.target.value)}
                disabled={isCreatingTopic}></textarea>
            </div>
            <div className="reply-footer">
              <span className="char-count" id="charCount">0 / 4000 caractères</span>
              <button className="btn-post" style={{
                opacity: isCreatingTopic ? 0.5 : 1,
                cursor: isCreatingTopic ? 'not-allowed' : 'pointer'
              }}
                onClick={handlePostTopic}
                disabled={isCreatingTopic}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
                Poster
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}