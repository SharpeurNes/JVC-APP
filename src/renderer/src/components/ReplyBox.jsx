import React, { useState } from 'react';
import '../pages/TopicPage.css';

const ReplyBox = ({ onSubmit, isSending }) => {
  const [message, setMessage] = useState('');

  const handleSend = () => {
    if (message.trim().length < 3) {
      alert("Message trop court !");
      return;
    }
    onSubmit(message);
    setMessage(''); // Vide le champ après l'envoi
  };

  return (

    <div className="reply-zone">
      <div className="reply-top">
        <span className="reply-label">Répondre à ce sujet</span>
      </div>
      <div className="reply-body">
        <textarea id="replyTa"  maxLength="4000" placeholder="Écrire votre réponse..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={isSending}></textarea>
      </div>
      <div className="reply-footer">
        <span className="char-count" id="charCount">0 / 4000 caractères</span>
        <button className="btn-post" style={{
            opacity: isSending ? 0.5 : 1,
            cursor: isSending ? 'not-allowed' : 'pointer'
          }}
          onClick={handleSend}
          disabled={isSending}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
          Poster
        </button>
      </div>
    </div>

  );
};

export default ReplyBox;