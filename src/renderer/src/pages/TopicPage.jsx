import { useState, useEffect, useCallback, useRef } from 'react'
import MessageItem from '../components/MessageItem'
import ReplyBox from '../components/ReplyBox'
import './TopicPage.css';

export default function TopicPage({ topic, onBack }) {
  const [currentUrl, setCurrentUrl] = useState(`${topic.url}`);
  const [data, setData] = useState({
    messages: [],
    pagination: { current: 1, max: 1 },
    authPayload: {}
  });
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  const lastFetchedUrl = useRef(null);

  const loadMessages = useCallback(async (urlToLoad) => {
    if (!urlToLoad) return;

    if (lastFetchedUrl.current === urlToLoad && loading) return;

    setLoading(true);
    try {
      const result = await window.api.getMessages(urlToLoad);
      setData(result);
    } catch (err) {
      console.error("Erreur chargement messages:", err);
      lastFetchedUrl.current = null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const fetchData = async () => {
      // On attend un micro-délai pour laisser le "double montage" passer
      await new Promise(resolve => setTimeout(resolve, 50));

      if (isCancelled) return;

      console.log("🔥 Appel unique pour :", currentUrl);
      loadMessages(currentUrl);
    };

    fetchData();

    return () => {
      isCancelled = true; // Si React remonte le composant, la première exécution s'arrêtera ici
    };
  }, [currentUrl]);


  // --- FONCTION POUR POSTER (MÉTHODE PILOTAGE) ---
  const handlePostMessage = async (messageText) => {
    setIsSending(true);
    try {
      const res = await window.api.sendNativePost({ text: messageText });

      if (res.success) {
        loadMessages(currentUrl);
      } else {
        alert("Erreur : " + res.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  
  const goToPage = (pageNumber) => {
    const parts = currentUrl.split('-');
    parts[3] = pageNumber;
    const newUrl = parts.join('-');
    setCurrentUrl(newUrl);
    window.scrollTo(0, 0);
  };

  const { messages, pagination } = data;

  console.log(pagination);

  return (
    <main className="wrap" style={{ padding: '20px', paddingBottom: '100px' }}>
      
      
    <div className="topic-header">
      <div>
        <div className="topic-h-title">{topic.title}</div>
        <div className="topic-h-sub">par <span>alex.b</span> · Développement Web · 87 messages</div>
      </div>
      <div className="topic-actions">
        <button onClick={onBack} className="btn-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Retour
        </button>
        <button onClick={() => loadMessages(currentUrl)} disabled={loading} className="btn-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.5 15a9 9 0 1 1-2.6-7.4L23 10"/></svg>
          Actualiser
        </button>
      </div>
    </div>

    <PaginationBar
        pagination={pagination}
        goToPage={goToPage}
        loading={loading}
        position="top"
      />

    <div className="msg-list" id="msgList" style={{ opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
            {/* LISTE DES MESSAGES */}
      {loading && messages.length === 0 ? (
        <p></p>
      ) : (

        <div className="msg-list" id="msgList">
          {messages.map(m =>(
          <MessageItem key={m.id} msg={m} />
        ))}
        </div>
      )}
    </div>

    
      <PaginationBar
        pagination={pagination}
        goToPage={goToPage}
        loading={loading}
        position="top"
      />
      

      {/* ZONE DE RÉPONSE */}
      <hr />
      {!loading ? (
        <ReplyBox
          onSubmit={handlePostMessage}
          isSending={isSending}
        />
      ) : (
        <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
          Chargement...
        </div>
      )}
    </main>
  );
}

const PaginationBar = ({ pagination, goToPage, loading, position }) => {
  if (!pagination || pagination.max <= 1) return null;
  return (
    <div className="pag-bar">
      <button className="pag-btn" onClick={() => goToPage(1)} disabled={loading || pagination.current === 1}>« 1</button>
      <button className="pag-btn" onClick={() => goToPage(pagination.current - 1)} disabled={loading || pagination.current === 1}>‹</button>
      <span className="pag-sep"></span>
      <button className="pag-btn active">Page <b>{pagination.current}</b> / {pagination.max}</button>
      <span className="pag-sep"></span>
      <button className="pag-btn" onClick={() => goToPage(pagination.current + 1)} disabled={loading || pagination.current >= pagination.max}>›</button>
      <button className="pag-btn" onClick={() => goToPage(pagination.max)} disabled={loading || pagination.current >= pagination.max}>{pagination.max} »</button>
    </div>
  );
};