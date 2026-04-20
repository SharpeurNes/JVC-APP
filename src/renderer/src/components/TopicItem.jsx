// 1. On ajoute "onClick" dans les accolades pour récupérer la fonction
export default function TopicItem({ topic, onClick, i }) {
  const colors = [
    { bg: '#EEEDFE', c: '#534AB7' }, { bg: '#E1F5EE', c: '#0F6E56' },
    { bg: '#FAECE7', c: '#993C1D' }, { bg: '#FBEAF0', c: '#993556' },
    { bg: '#E6F1FB', c: '#185FA5' }, { bg: '#FAEEDA', c: '#854F0B' },
    { bg: '#EAF3DE', c: '#3B6D11' }, { bg: '#FCEBEB', c: '#A32D2D' },
  ];
  return (
    // 2. On branche le onClick sur la div principale
    <div
      className="topic-row"
      onClick={onClick}
      style={{ cursor: 'pointer' }} // On ajoute le curseur pour que l'utilisateur sache qu'il peut cliquer
      color= {colors[i % colors.length]}
    >

      <div className="avatar-md">
        <img
          src={topic.avatar}
          alt={topic.author}
          style={{ width: '32px', height: '32px', borderRadius: '4px', marginRight: '12px' }}
        />
      </div>

      <div className="topic-main">
        <div className="topic-title">{topic.title}</div>
        <div className="topic-meta"><span>{topic.author}</span></div>
      </div>
      <div className="topic-count">{topic.msgCount}</div>
      <div className="topic-time">{topic.time}</div>



      {/* On affiche l'avatar de l'auteur à gauche */}



    </div>
  );
}