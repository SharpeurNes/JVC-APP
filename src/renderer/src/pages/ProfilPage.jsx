import { useState, useEffect, useCallback, useRef } from 'react'
import './ProfilPage.css';

export default function Profilpage({ username }) {
    const [loading, setLoading] = useState(true);


    return (
        <div className="wrap">

            {/* <!-- PROFILE CARD --> */}

            <div className="profile-card">
                <div className="banner">
                    <div className="banner-accent"></div>
                </div>
                <div className="profile-body">
                    <div className="avatar-wrap">
                        <div className="avatar-lg">MR</div>
                        <div className="avatar-status"></div>
                    </div>
                    <div className="profile-top-row">
                        <div className="profile-identity">
                            <div className="profile-pseudo">{username}</div>
                            <div className="profile-handle">@mathieu_r · #0042</div>
                            <div className="level-badge">
                                <span className="level-dot"></span>
                                Niveau 34 — Vétéran
                            </div>
                        </div>
                        <button className="btn-edit">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                            Modifier le profil
                        </button>
                    </div>

                    <div className="xp-row">
                        <span className="xp-label">XP Niveau 34</span>
                        <div className="xp-track"><div className="xp-fill"></div></div>
                        <span className="xp-val">6 800 / 10 000</span>
                    </div>

                    <p className="profile-desc">
                        Développeur fullstack passionné par Vue.js et l'écosystème Node. Je traîne ici depuis 2019 pour apprendre, partager, et parfois troller gentiment sur les guerres de frameworks.
                    </p>
                </div>
            </div>

            {/* <!-- TWO COLUMNS: INFO + STATS --> */}

            <div className="two-col">

                {/* <!-- INFO --> */}
                <div className="section-card">
                    <div className="section-title">Informations</div>
                    <div className="info-list">

                        <div className="info-row">
                            <span className="info-key">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                                Âge
                            </span>
                            <span className="info-val">28 ans</span>
                        </div>

                        <div className="info-row">
                            <span className="info-key">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="10" r="3" /><path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 14 8 14s8-8.75 8-14a8 8 0 0 0-8-8z" /></svg>
                                Localisation
                            </span>
                            <span className="info-val">Lyon, France 🇫🇷</span>
                        </div>

                        <div className="divider"></div>

                        <div className="info-row">
                            <span className="info-key">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                                Membre depuis
                            </span>
                            <span className="info-val">mars 2019</span>
                        </div>

                        <div className="info-row"> 
                            <span className="info-key">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                Dernier passage
                            </span>
                            <span className="info-val">aujourd'hui</span>
                        </div>

                        <div className="divider"></div>

                        <div className="info-row hidden">
                            <span className="info-key">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                                Nb messages
                            </span>
                            <span className="info-val">2 481</span>
                        </div>

                        <div className="info-row">
                            <span className="info-key">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                                Nb messages
                            </span>
                            <span className="info-val">2 481</span>
                        </div>

                        <div className="info-row">
                            <span className="info-key">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
                                Commentaires
                            </span>
                            <span className="info-val">847</span>
                        </div>

                        <div className="divider"></div>

                        <div className="info-row">
                            <span className="info-key">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                                Rang
                            </span>
                            <span className="info-val rank">Vétéran ✦</span>
                        </div>

                    </div>
                </div>

                {/* <!-- STATS --> */}

                <div className="section-card">
                    <div className="section-title">Statistiques</div>
                    <div className="stats-grid">
                        <div className="stat-box">
                            <div className="stat-num">2 481</div>
                            <div className="stat-label">Messages postés</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-num">847</div>
                            <div className="stat-label">Commentaires</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-num">134</div>
                            <div className="stat-label">Topics créés</div>
                        </div>
                        <div className="stat-box">
                            <div className="stat-num">1 920</div>
                            <div className="stat-label">Jours actifs</div>
                        </div>
                    </div>
                </div>

            </div>

            {/* <!-- BADGES --> */}

            <div className="badges-card">
                <div className="section-title">Badges</div>
                <div className="badges-grid">

                    <div className="badge legendary">
                        <div className="badge-icon" style={{background: '#2a1f08'}}>🏆</div>
                        <div className="badge-info">
                            <div className="badge-name">Top Contributeur</div>
                            <div className="badge-desc">2000+ messages postés</div>
                            <span className="badge-rarity legendary">Légendaire</span>
                        </div>
                    </div>

                    <div className="badge rare">
                        <div className="badge-icon" style={{background: '#0f1f33'}}>⚡</div>
                        <div className="badge-info">
                            <div className="badge-name">Réponse Éclair</div>
                            <div className="badge-desc">100 réponses en moins d'1 min</div>
                            <span className="badge-rarity rare">Rare</span>
                        </div>
                    </div>

                    <div className="badge">
                        <div className="badge-icon" style={{background: '#1a1928'}}>🎯</div>
                        <div className="badge-info">
                            <div className="badge-name">Vieux de la vieille</div>
                            <div className="badge-desc">Membre depuis 5 ans</div>
                            <span className="badge-rarity common">Commun</span>
                        </div>
                    </div>

                    <div className="badge rare">
                        <div className="badge-icon" style={{background: '#0f2d24'}}>🌿</div>
                        <div className="badge-info">
                            <div className="badge-name">Modérateur Honoraire</div>
                            <div className="badge-desc">Aide la communauté</div>
                            <span className="badge-rarity rare">Rare</span>
                        </div>
                    </div>

                    <div className="badge">
                        <div className="badge-icon" style={{background: '#1a1928'}}>🔥</div>
                        <div className="badge-info">
                            <div className="badge-name">Streak 30 jours</div>
                            <div className="badge-desc">Connecté 30j de suite</div>
                            <span className="badge-rarity common">Commun</span>
                        </div>
                    </div>

                    <div className="badge legendary">
                        <div className="badge-icon" style={{background: '#2d1020'}}>💎</div>
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