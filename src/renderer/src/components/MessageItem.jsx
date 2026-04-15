export default function MessageItem({ msg }) {
  return (
    <div className="message-item" style={{ borderBottom: '1px solid #333', padding: '15px 0' }}>
      <div style={{ display: 'flex', gap: '15px' }}>
        {/* L'avatar de l'auteur */}
        <img 
          src={msg.avatar || 'https://www.jeuxvideo.com/img/default_avatar.png'} 
          style={{ width: '50px', height: '50px', borderRadius: '4px' }}
          alt="avatar"
        />
        
        <div style={{ flex: 1 }}>
          <div style={{ marginBottom: '5px' }}>
            <b style={{ color: '#ff4500' }}>{msg.author}</b> 
            <span style={{ fontSize: '0.8rem', color: '#888', marginLeft: '10px' }}>{msg.date}</span>
          </div>

          {/* ICI : Le contenu HTML avec les stickers */}
          <div 
            className="content-enrichi"
            dangerouslySetInnerHTML={{ __html: msg.content }} 
            style={{ lineHeight: '1.4' }}
          />
        </div>
      </div>
    </div>
  );
}