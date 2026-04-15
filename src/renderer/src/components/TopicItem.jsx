// 1. On ajoute "onClick" dans les accolades pour récupérer la fonction
export default function TopicItem({ topic, onClick }) { 
  return (
    // 2. On branche le onClick sur la div principale
    <div 
      className="topic-row" 
      onClick={onClick} 
      style={{ cursor: 'pointer' }} // On ajoute le curseur pour que l'utilisateur sache qu'il peut cliquer
    >
      {/* On affiche l'avatar de l'auteur à gauche */}
      <img 
        src={topic.avatar} 
        alt={topic.author} 
        style={{ width: '32px', height: '32px', borderRadius: '4px', marginRight: '12px' }}
      />
      
      <div className="topic-info">
        <span className="topic-title">{topic.title}</span>
        <span className="topic-meta">par <b>{topic.author}</b></span>
      </div>

      <div className="topic-stats">
        <div style={{ fontWeight: 'bold', color: '#ff4500' }}>{topic.msgCount}</div>
        <div style={{ fontSize: '0.75em' }}>{topic.time}</div>
      </div>
    </div>
  );
}