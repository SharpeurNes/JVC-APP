import { useState, useEffect, useCallback, useRef } from 'react'
import MessageItem from '../components/MessageItem'
import ReplyBox from '../components/ReplyBox'
import './TopicPage.css';
import { toast } from 'react-hot-toast';

export default function TopicPage({ topic, onBack, myUsername }) {
  const [currentUrl, setCurrentUrl] = useState(`${topic.url}`);
  const [data, setData] = useState({
    messages: [],
    pagination: { current: 1, max: 1 },
    authPayload: {}
  });
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
        toast.error("Erreur : " + res.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  //Fonction pour delete un post
  const handleDeleteMessage = async (deleteUrl, messageId) => {
    setLoading(true);
    try {
      const res = await window.api.deleteMessage(deleteUrl);
      if(res.success){
        if(data.messages.length-1 === 0){
          onBack()
          return;
        }
        
        setData(prevData => ({
          ...prevData,
          messages: prevData.messages.filter(msg => msg.id !== messageId)
        }));
        console.log(`✅ Message ${deleteUrl} supprimé.`);
      } else {
        toast.error("Erreur : " + res.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const [message, setMessage] = useState('');

  //Fonction pour citer msg
const handleQuote = (htmlContent, author, date) => {
  const cleanedBody = cleanHtmlForQuote(htmlContent);
  const header = `> Le ${date} ${author} a écrit :\n`;
  const finalQuote = `${header}${cleanedBody}\n\n`;

  setMessage(prev => prev + finalQuote);
  
  setTimeout(() => {
    const textarea = document.getElementById('reply-textarea');
    if (textarea) {
      textarea.focus();
      textarea.scrollTop = textarea.scrollHeight;
      const length = textarea.value.length;
      textarea.setSelectionRange(length, length);
      textarea.scrollTop = textarea.scrollHeight;
    }
  }, 10);
};


const cleanHtmlForQuote = (html) => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;

  tempDiv.querySelectorAll('img').forEach(img => {
    const url = img.getAttribute('src') || img.getAttribute('alt');
    img.replaceWith(` ${url} `);
  });

  const processQuotes = (container) => {
    const quotes = container.querySelectorAll('blockquote');
    quotes.forEach(quote => {
      processQuotes(quote);
      
      const content = quote.innerText.trim().split('\n').map(line => `>${line}`).join('\n');
      quote.replaceWith('\n' + content + '\n');
    });
  };

  processQuotes(tempDiv);
  return tempDiv.innerText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line !== "")
    .map(line => `> ${line}`)
    .join('\n');
};

  
  const goToPage = (pageNumber) => {
    const parts = currentUrl.split('-');
    parts[3] = pageNumber;
    const newUrl = parts.join('-');
    setCurrentUrl(newUrl);
    window.scrollTo(0, 0);
  };

  const { messages, pagination } = data;

  return (
    <main className="wrap" style={{ padding: '20px', paddingBottom: '100px' }}>
      
      
    <div className="topic-header">
      <div>
        <div className="topic-h-title">{topic.title}</div>
        <div className="topic-h-sub">par <span>X.X</span> · XXXX · XX messages</div>
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
          <MessageItem key={m.id} msg={m} isUser={m.author === myUsername} onDelete={handleDeleteMessage} onQuote={handleQuote} />
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
          message={message}
          setMessage={setMessage}
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