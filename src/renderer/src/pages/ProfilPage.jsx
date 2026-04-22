import { useState, useEffect, useCallback, useRef, Fragment } from 'react'
import './ProfilPage.css';

export default function Profilpage({ username }) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        username: "",
        level: 0,
        genesisPass: false,
        infos: [],
        description: "",
        avatar: "https://image.jeuxvideo.com/avatar-md/default.jpg"
    });

    const loadProfil = useCallback(async (username) => {
        setLoading(true);

        try {
            const result = await window.api.getProfilData(username.toLowerCase());
            console.log(result);
            setData(result);
        } catch (error) {
            console.error("Erreur chargement profil: ", error);
        } finally {
            setLoading(false);
        }
    })


    const renderDescription = (text) => {
        // Cette Regex cherche les URLs Noelshack se terminant par png, jpg ou jpeg
        const noelshackRegex = /(https?:\/\/image\.noelshack\.com\/fichiers\/[^\s]+\.(?:png|jpg|jpeg))/g;

        // On découpe le texte en gardant les URLs grâce aux parenthèses dans la Regex
        const parts = text.split(noelshackRegex);

        return parts.map((part, i) => {
            if (part.match(noelshackRegex)) {
                // Si la partie est une URL Noelshack, on affiche l'image
                return (
                    <img
                        key={i}
                        src={part}
                        alt="Noelshack"
                        className="desc-img"
                        style={{ verticalAlign: 'bottom', aspectRatio: 'auto 68 / 51', width: '68px', height: '51px', overflow: 'content-box'}}
                    />
                );
            }
            // Sinon, on affiche le texte normalement
            return <span key={i}>{part}</span>;
        });
    };



    useEffect(() => {
        let isCancelled = false;
        const fetchData = async () => {
            await new Promise(resolve => setTimeout(resolve, 50));

            if (isCancelled) return;

            console.log("Appel pour loading profil pour: ", username);
            loadProfil(username);
        }

        fetchData();

        return () => {
            isCancelled = true;
        }
    }, [username]);


    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Chargement du profil de l'élite...</p>
            </div>
        );
    }

    return (
        <div className="wrap">

            {/* <!-- PROFILE CARD --> */}

            <div className="profile-card">
                <div className="banner">
                    <div className="banner-accent"></div>
                </div>
                <div className="profile-body">
                    <div className="avatar-wrap">
                        <img className="profile-avatar" src={data.avatar} alt="Avatar" />
                        <div className="avatar-status"></div>
                    </div>
                    <div className="profile-top-row">
                        <div className="profile-identity">
                            <div className="profile-pseudo">{data.username}</div>
                            {/* <div className="profile-handle">@mathieu_r · #0042</div> */}
                            <div className="level-badge">
                                <span className="level-dot"></span>
                                Niveau {data.level}
                            </div>
                        </div>
                        <button className="btn-edit">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                            Modifier le profil
                        </button>
                    </div>

                    {/* <div className="xp-row">
                        <span className="xp-label">XP Niveau 34</span>
                        <div className="xp-track"><div className="xp-fill"></div></div>
                        <span className="xp-val">6 800 / 10 000</span>
                    </div> */}

                    <p className="profile-desc">
                        {renderDescription(data.description)}
                    </p>
                </div>
            </div>

            {/* <!-- TWO COLUMNS: INFO + STATS --> */}

            <div className="two-col">

                {/* <!-- INFO --> */}
                <div className="section-card">
                    <div className="section-title">Informations</div>
                    <div className="info-list">

                        {Object.entries(data.infos).map(([key, value], index) => {
                            // Si la clé est "Messages Forums", on ne retourne RIEN (null)
                            if (key === "Messages Forums" || key === "Commentaires") return null;

                            // Sinon, on affiche le reste normalement
                            return (
                                <Fragment key={index}>
                                    <div className="info-row">
                                        <span className="info-key">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="4" width="18" height="18" rx="2" />
                                                <line x1="16" y1="2" x2="16" y2="6" />
                                                <line x1="8" y1="2" x2="8" y2="6" />
                                                <line x1="3" y1="10" x2="21" y2="10" />
                                            </svg>
                                            {key}
                                        </span>
                                        <span className="info-val">{value}</span>
                                    </div>

                                    {/* {index === 2 && <div className="divider"></div>} */}
                                </Fragment>
                            );
                        })}

                        {/* <div className="info-row">
                            <span className="info-key">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="10" r="3" /><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 0 0-8-8z" /></svg>
                                Localisation
                            </span>
                            <span className="info-val">Lyon, France 🇫🇷</span>
                        </div>

                        <div className="divider"></div>

                        <div className="info-row">
                            <span className="info-key">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                                Membre depuis
                            </span>
                            <span className="info-val">mars 2019</span>
                        </div> */}



                    </div>
                </div>

                {/* <!-- STATS --> */}

                <div className="section-card">
                    <div className="section-title">Statistiques</div>
                    <div className="stats-grid">
                        {data.infos['Messages Forums'] && (
                            <div className="stat-box">
                                <div className="stat-num">{data.infos['Messages Forums'].replace('messages', '').replace('.', ' ')}</div>
                                <div className="stat-label">Messages postés</div>
                            </div>
                        )}

                        {data.infos['Commentaires'] && (
                            <div className="stat-box">
                                <div className="stat-num">{data.infos['Commentaires'].replace('commentaires', '').replace('.', ' ')}</div>
                                <div className="stat-label">Commentaires</div>
                            </div>
                        )}

                        {data.infos['Membre depuis'] && (
                            <div className="stat-box">
                                <div className="stat-num">{data.infos['Membre depuis'].match(/\(([^)]+)\)/)[1].replace('jours', '') || ""}</div>
                                <div className="stat-label">Jours actifs</div>
                            </div>
                        )}

                    </div>
                </div>

            </div>

            {/* <!-- BADGES --> */}

            <div className="badges-card">
                <div className="section-title">Badges</div>
                <div className="badges-grid">

                    <div className="badge legendary">
                        <div className="badge-icon" style={{ background: '#2a1f08' }}>🏆</div>
                        <div className="badge-info">
                            <div className="badge-name">Top Contributeur</div>
                            <div className="badge-desc">2000+ messages postés</div>
                            <span className="badge-rarity legendary">Légendaire</span>
                        </div>
                    </div>

                    <div className="badge rare">
                        <div className="badge-icon" style={{ background: '#0f1f33' }}>⚡</div>
                        <div className="badge-info">
                            <div className="badge-name">Réponse Éclair</div>
                            <div className="badge-desc">100 réponses en moins d'1 min</div>
                            <span className="badge-rarity rare">Rare</span>
                        </div>
                    </div>

                    <div className="badge">
                        <div className="badge-icon" style={{ background: '#1a1928' }}>🎯</div>
                        <div className="badge-info">
                            <div className="badge-name">Vieux de la vieille</div>
                            <div className="badge-desc">Membre depuis 5 ans</div>
                            <span className="badge-rarity common">Commun</span>
                        </div>
                    </div>

                    <div className="badge rare">
                        <div className="badge-icon" style={{ background: '#0f2d24' }}>🌿</div>
                        <div className="badge-info">
                            <div className="badge-name">Modérateur Honoraire</div>
                            <div className="badge-desc">Aide la communauté</div>
                            <span className="badge-rarity rare">Rare</span>
                        </div>
                    </div>

                    <div className="badge">
                        <div className="badge-icon" style={{ background: '#1a1928' }}>🔥</div>
                        <div className="badge-info">
                            <div className="badge-name">Streak 30 jours</div>
                            <div className="badge-desc">Connecté 30j de suite</div>
                            <span className="badge-rarity common">Commun</span>
                        </div>
                    </div>

                    <div className="badge legendary">
                        <div className="badge-icon" style={{ background: '#2d1020' }}>💎</div>
                        <div className="badge-info">
                            <div className="badge-name">Diamant</div>
                            <div className="badge-desc">Niveau 30 atteint</div>
                            <span className="badge-rarity legendary">Légendaire</span>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
}