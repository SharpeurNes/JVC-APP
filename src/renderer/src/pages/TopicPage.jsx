import { useState, useEffect, useCallback } from 'react'
import MessageItem from '../components/MessageItem'

export default function TopicPage({ topic }) {
  // On stocke l'URL actuelle du topic (qui changera quand on change de page)
  const [currentUrl, setCurrentUrl] = useState(`https://www.jeuxvideo.com${topic.url}`);
  const [data, setData] = useState({ messages: [], pagination: { current: 1, max: 1 } });
  const [loading, setLoading] = useState(true);

  const loadMessages = useCallback(async (urlToLoad) => {
    if (!urlToLoad) return;
    
    setLoading(true);
    try {
      // Le scraper doit maintenant renvoyer { messages, pagination }
      const result = await window.api.getMessages(urlToLoad);
      setData(result);
    } catch (err) {
      console.error("Erreur chargement messages:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // On recharge quand l'URL change
  useEffect(() => {
    loadMessages(currentUrl);
  }, [currentUrl, loadMessages]);

  const goToPage = (pageNumber) => {
    // Les URLs JVC : /forums/42-19163-70500488-PAGE-0-1-0-nom.htm
    // Le numéro de page est le 4ème segment (index 3 après le split '-')
    const parts = currentUrl.split('-');
    parts[3] = pageNumber;
    const newUrl = parts.join('-');
    
    setCurrentUrl(newUrl);
    window.scrollTo(0, 0); // On remonte en haut de page
  };

  const { messages, pagination } = data;

return (
  <main className="container">
    {/* Header */}
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
      <h2 style={{ margin: 0 }}>{topic.title}</h2>
      <button onClick={() => loadMessages(currentUrl)} disabled={loading}>🔄</button>
    </div>

    {/* PAGINATION HAUT */}
    <PaginationBar 
      pagination={pagination} 
      goToPage={goToPage} 
      loading={loading} 
      position="top" 
    />

    {/* LISTE DES MESSAGES */}
    {loading && messages.length === 0 ? (
      <p>Chargement des messages...</p>
    ) : (
      <div style={{ opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s' }}>
        {messages.map(m => (
          <MessageItem key={m.id} msg={m} />
        ))}
      </div>
    )}

    {/* PAGINATION BAS (Exactement la même !) */}
    {!loading && (
      <PaginationBar 
        pagination={pagination} 
        goToPage={goToPage} 
        loading={loading} 
        position="bottom" 
      />
    )}
  </main>
);
}




// Fonction utilitaire pour éviter la répétition
const PaginationBar = ({ pagination, goToPage, loading, position }) => {
  if (!pagination || pagination.max <= 1) return null;

  const isTop = position === 'top';

  return (
    <div style={{ 
      display: 'flex', 
      gap: '5px', 
      marginTop: isTop ? '0' : '20px', 
      marginBottom: isTop ? '20px' : '0', 
      alignItems: 'center',
      justifyContent: isTop ? 'flex-start' : 'center' // Aligné à gauche en haut, centré en bas
    }}>
      <button onClick={() => goToPage(1)} disabled={loading || pagination.current === 1}>« 1</button>
      <button onClick={() => goToPage(pagination.current - 1)} disabled={loading || pagination.current === 1}>‹</button>
      
      <span style={{ margin: '0 10px' }}>Page <b>{pagination.current}</b> / {pagination.max}</span>
      
      <button onClick={() => goToPage(pagination.current + 1)} disabled={loading || pagination.current >= pagination.max}>›</button>
      <button onClick={() => goToPage(pagination.max)} disabled={loading || pagination.current >= pagination.max}>{pagination.max} »</button>
    </div>
  );
};