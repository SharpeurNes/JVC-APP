import '../pages/TopicPage.css';

const icoCite = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>`;
const icoBlock = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`;
const icoFlag = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>`;



export default function MessageItem({ msg, isUser, onDelete }) {

  const handleDelete = () => {
    onDelete(msg.deleteUrl, msg.id);
  }

  const handleEdit = () => {
    if(window.confirm("Êtes-vous sûr de vouloir éditer ce message ?")) {
      return;
    }
  }

  return (

    <div className="msg" data-message-id={msg.id}>
      <img className="avatar-md"
        src={msg.avatar || 'https://www.jeuxvideo.com/img/default_avatar.png'}
        alt="avatar"
      />
      <div className="msg-right">
        <div className="msg-top">
          <div className="msg-author-block">
            <span className="msg-author" style = {{color: isUser ? '#e5705e' : '#a8a8a8'}}>{msg.author}</span>
            <span className="msg-date">{msg.date}</span>
            {/* <span className="msg-num">#${msg.num}</span> */}
          </div>
          <div className="msg-tools">
            <button className="tool-btn" title="Citer">C</button>
            {!isUser && <button className="tool-btn danger" title="Signaler">R</button>}
            {!isUser && <button className="tool-btn danger" title="Bloquer">B</button> }
            {isUser && <button className="tool-btn" title="Modifier" onClick={handleEdit}>E</button>}
            {isUser && <button className="tool-btn danger" title="Supprimer" onClick={handleDelete}>D</button>}
            
          </div>
        </div>
        <div className="msg-body" dangerouslySetInnerHTML={{ __html: msg.content }} style={{ lineHeight: '1.4' }} />

      </div>
    </div>

);
}