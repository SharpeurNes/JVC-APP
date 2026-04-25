import { useState, useEffect, useCallback, useRef, Fragment } from 'react'
import './ProfilPage.css';
import defaultBanner from '../assets/default-banner.webp'


export default function Profilpage({ username }) {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        username: "",
        level: 0,
        genesisPass: false,
        infos: [],
        description: "",
        avatar: "https://image.jeuxvideo.com/avatar-md/default.jpg",
        banner: "",
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
                        style={{ verticalAlign: 'bottom', aspectRatio: 'auto 68 / 51', width: '68px', height: '51px', overflow: 'content-box' }}
                    />
                );
            }
            // Sinon, on affiche le texte normalement
            return <span key={i}>{part}</span>;
        });
    };

    const renderRankBadge = () => {
        const nbrMsg = data.infos['Messages Forums']?.replace('messages', '').replace('.', ' ').replace(' ', '');
        if (!nbrMsg) {
            return null
        } else if (nbrMsg < 50) {
            //Carton
            return (
                <div className="badge common">
                    <div className="badge-icon" style={{ background: '#2d1020' }}>📦</div>
                    <div className="badge-info">
                        <div className="badge-name">Carton</div>
                        <div className="badge-desc">Newfag</div>
                        <span className="badge-rarity common">Commun</span>
                    </div>
                </div>
            );
        } else if (nbrMsg < 200) {
            //Bronze
            return (
                <div className="badge common">
                    <div className="badge-icon" style={{ background: '#2d1020' }}>🟤</div>
                    <div className="badge-info">
                        <div className="badge-name">Bronze</div>
                        <div className="badge-desc">+50 messages</div>
                        <span className="badge-rarity common">Commun</span>
                    </div>
                </div>
            );
        } else if (nbrMsg < 1000) {
            //Silver
            return (
                <div className="badge common">
                    <div className="badge-icon" style={{ background: '#2d1020' }}>🔘</div>
                    <div className="badge-info">
                        <div className="badge-name">Silver</div>
                        <div className="badge-desc">+200 messages</div>
                        <span className="badge-rarity common">Commun</span>
                    </div>
                </div>
            );
        } else if (nbrMsg < 10000) {
            //Gold
            return (
                <div className="badge rare">
                    <div className="badge-icon" style={{ background: '#2d1020' }}>🪙</div>
                    <div className="badge-info">
                        <div className="badge-name">Gold</div>
                        <div className="badge-desc">+1000 messages</div>
                        <span className="badge-rarity rare">Rare</span>
                    </div>
                </div>
            );
        } else if (nbrMsg < 30000) {
            //Rubis
            return (
                <div className="badge common">
                    <div className="badge-icon" style={{ background: '#2d1020' }}>♦️</div>
                    <div className="badge-info">
                        <div className="badge-name">Silver</div>
                        <div className="badge-desc">+10.000 messages</div>
                        <span className="badge-rarity common">Rare</span>
                    </div>
                </div>
            );
        } else if (nbrMsg < 75000) {
            //Saphir
            return (
                <div className="badge rare">
                    <div className="badge-icon" style={{ background: '#2d1020' }}>🔷</div>
                    <div className="badge-info">
                        <div className="badge-name">Saphir</div>
                        <div className="badge-desc">+30.000 messages</div>
                        <span className="badge-rarity rare">Rare</span>
                    </div>
                </div>
            );
        } else if (nbrMsg < 150000) {
            //Emeraude
            return (
                <div className="badge rare">
                    <div className="badge-icon" style={{ background: '#2d1020' }}>🟢</div>
                    <div className="badge-info">
                        <div className="badge-name">Emeraude</div>
                        <div className="badge-desc">+30.000 messages</div>
                        <span className="badge-rarity rare">Rare</span>
                    </div>
                </div>
            );
        } else if (nbrMsg > 150000) {
            //Diamant
            return (
                <div className="badge legendary">
                    <div className="badge-icon" style={{ background: '#2d1020' }}>💎</div>
                    <div className="badge-info">
                        <div className="badge-name">Diamant</div>
                        <div className="badge-desc">+150.000 messages</div>
                        <span className="badge-rarity legendary">Légendaire</span>
                    </div>
                </div>
            );
        }
    }

    const renderGenesisPass = () => {
        if (data.genesisPass) {
            return (
                <div className="genesis-badge">
                    <span className="genesis-dot"></span>
                    Genesis Pass 👑
                </div>
            )
        } else {
            return null;
        }

    }


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

    const dynamicBannerUrl = {
        '--khey-banner-url': `url(${data.banner ? data.banner : defaultBanner})`
    };

    return (
        <div className="wrap">
            {/* <!-- PROFILE CARD --> */}
            <div className="profile-card">
                <div className="banner" style={dynamicBannerUrl}>
                </div>
                <div className="profile-body">
                    <div className="avatar-wrap">
                        <img className="profile-avatar" src={data.avatar} alt="Avatar"/>
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
                            {renderGenesisPass()}
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
                            if (key === "Messages Forums" || key === "Commentaires") return null;
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
                                <div className="stat-num">{data.infos['Commentaires'].replace('commentaire', '').replace('.', ' ').replace('s', '')}</div>
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
                    {renderRankBadge()}
                </div>
            </div>

        </div>
    );
}