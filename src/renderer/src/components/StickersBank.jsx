import React, { useState, useRef, useEffect } from 'react';
import './StickersBank.css';

const STICKERS = [
    { url: 'https://image.noelshack.com/fichiers/2017/26/1/1498499454-asuka.png#sticker', l: 'Asuka' },
    { url: 'https://image.noelshack.com/fichiers/2026/02/2/1767730831-ebahit.png#sticker', l: 'Ebahit' },
    { url: 'https://image.noelshack.com/fichiers/2024/07/5/1708105023-frierenmimiced2.png#sticker', l: 'Frieren' },
    { url: 'https://image.noelshack.com/fichiers/2023/12/4/1679608638-nerd2.png#sticker', l: 'Nerd' },
    { url: 'https://image.noelshack.com/fichiers/2025/20/1/1747006967-miyabi-i-am-all-ears-je-t-ecoute-petite-mrd3.png#sticker', l: 'Miyabi'},
    { url: 'https://image.noelshack.com/fichiers/2023/14/3/1680653409-mioncafe.png#sticker', l: 'Mion'},

    { url: 'https://image.noelshack.com/fichiers/2023/47/5/1700845799-frierentroll.png#sticker', l: 'Frieren' },
    { url: 'https://image.noelshack.com/fichiers/2023/43/5/1698423400-frierensourirepsycho2.jpg#sticker', l: 'Frieren' },
    { url: 'https://image.noelshack.com/fichiers/2024/11/5/1710520536-ubelvoitunshittaste.jpg#sticker', l: 'Ubel' },
    { url: 'https://image.noelshack.com/fichiers/2023/47/5/1700855454-frierentroll2.png#sticker', l: 'Frieren' },
    { url: 'https://image.noelshack.com/fichiers/2023/48/5/1701451125-capture-d-ecran-2023-12-01-181636-removebg-preview.png#sticker', l: 'Frieren' },
    
    // ajoute tes autres stickers ici...
];

const DATA = {
  top:    STICKERS,
  recent: [STICKERS[0], STICKERS[1], STICKERS[2]],
  fav:    [STICKERS[2], STICKERS[3]],
};

const TABS = [
    { id: 'top', title: 'Top stickers', icon: <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /> },
    { id: 'recent', title: 'Récents', icon: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></> },
    { id: 'fav', title: 'Favoris', icon: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /> },
    { id: 'search', title: 'Rechercher', icon: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></> },
];

const StickersBank = ({ onStickerClick }) => {
    const [tab, setTab] = useState('top');
    const [query, setQuery] = useState('');

    const searchRef = useRef(null);

    useEffect(() => {
        if (tab === 'search' && searchRef.current) {
            searchRef.current.focus();
        }
    }, [tab]);

    const getStickers = () => {
        if (tab === 'search') {
            return query
                ? STICKERS.filter(s => s.l.toLowerCase().includes(query.toLowerCase()))
                : [];
        }
        return DATA[tab] || [];
    };

    const stickers = getStickers();

    return (
        <div className="sticker-module">

            {/* Onglets */}
            <div className="sticker-tabs">
                {TABS.map(t => (
                    <button
                        key={t.id}
                        className={`sticker-tab${tab === t.id ? ' active' : ''}`}
                        title={t.title}
                        onClick={() => { setTab(t.id); setQuery(''); }}
                    >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            {t.icon}
                        </svg>
                    </button>
                ))}
            </div>

            {/* Barre de recherche */}
            {tab === 'search' && (
                <div className="sticker-search">
                    <input
                        ref={searchRef}
                        type="text"
                        placeholder="Rechercher un sticker…"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                    />
                </div>
            )}

            {/* Grille */}
            <div className="sticker-grid-wrap">
                <div className="sticker-grid">
                    {stickers.length === 0 ? (
                        <div className="sticker-empty">
                            {tab === 'search' ? 'Tape pour rechercher…' : 'Aucun sticker ici'}
                        </div>
                    ) : (
                        stickers.map((s, i) => (
                            <div
                                key={i}
                                className="sticker"
                                title={s.l}
                                onClick={() => onStickerClick?.(s.url)}
                            >
                                <img src={s.url} alt={s.l} />
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>
    );
};

export default StickersBank;