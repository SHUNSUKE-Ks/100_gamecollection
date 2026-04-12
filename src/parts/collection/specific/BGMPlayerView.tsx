import React, { useEffect } from 'react';
import { useBGMPlayer, type BGMTrack } from '@/core/hooks/useBGMPlayer';
import bgmData from '@/data/collection/bgm.json';

// Utility: Format time
const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Styles
const styles = {
    container: {
        display: 'flex',
        height: '100%',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        color: '#e2e8f0',
        fontFamily: 'system-ui, sans-serif',
        overflow: 'hidden',
        position: 'relative' as const,
    },
    backgroundOverlay: {
        position: 'absolute' as const,
        inset: 0,
        backgroundImage: 'url(/src/assets/images/bg/main_visual.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        opacity: 0.15,
        filter: 'blur(20px)',
        zIndex: 0,
    },
    playerArea: {
        flex: '0 0 45%',
        display: 'flex',
        flexDirection: 'column' as const,
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        position: 'relative' as const,
        zIndex: 1,
    },
    albumArt: {
        width: '280px',
        height: '280px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem',
        boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        fontSize: '4rem',
        color: 'rgba(255,255,255,0.3)',
    },
    nowPlayingCard: {
        background: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        padding: '1.5rem 2rem',
        width: '100%',
        maxWidth: '350px',
        border: '1px solid rgba(255,255,255,0.1)',
    },
    trackTitle: {
        fontSize: '1.25rem',
        fontWeight: 700,
        marginBottom: '0.25rem',
        color: '#fff',
    },
    trackSubtitle: {
        fontSize: '0.875rem',
        color: 'rgba(255,255,255,0.5)',
        marginBottom: '1rem',
    },
    progressContainer: {
        marginBottom: '0.5rem',
    },
    progressTrack: {
        height: '4px',
        background: 'rgba(255,255,255,0.2)',
        borderRadius: '2px',
        cursor: 'pointer',
        position: 'relative' as const,
    },
    progressFill: {
        height: '100%',
        background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
        borderRadius: '2px',
        transition: 'width 0.1s linear',
    },
    timeDisplay: {
        display: 'flex',
        justifyContent: 'space-between',
        fontSize: '0.75rem',
        color: 'rgba(255,255,255,0.5)',
        marginBottom: '1rem',
    },
    controls: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
    },
    controlBtn: {
        background: 'transparent',
        border: 'none',
        color: 'rgba(255,255,255,0.7)',
        fontSize: '1.25rem',
        cursor: 'pointer',
        padding: '0.5rem',
        borderRadius: '50%',
        transition: 'all 0.2s',
    },
    controlBtnActive: {
        color: '#f59e0b',
    },
    playBtn: {
        background: 'rgba(255,255,255,0.1)',
        border: 'none',
        color: '#fff',
        fontSize: '1.5rem',
        cursor: 'pointer',
        padding: '1rem',
        borderRadius: '50%',
        marginLeft: '0.5rem',
        marginRight: '0.5rem',
        transition: 'all 0.2s',
    },
    playlistArea: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column' as const,
        background: 'rgba(0,0,0,0.3)',
        borderLeft: '1px solid rgba(255,255,255,0.1)',
        position: 'relative' as const,
        zIndex: 1,
    },
    playlistHeader: {
        padding: '1rem',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
    },
    searchInput: {
        width: '100%',
        padding: '0.75rem 1rem',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        color: '#fff',
        fontSize: '0.875rem',
        outline: 'none',
    },
    trackList: {
        flex: 1,
        overflowY: 'auto' as const,
        padding: '0.5rem',
    },
    trackItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        marginBottom: '2px',
    },
    trackItemActive: {
        background: 'rgba(245, 158, 11, 0.2)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
    },
    trackItemHover: {
        background: 'rgba(255,255,255,0.05)',
    },
    trackIcon: {
        width: '40px',
        height: '40px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1rem',
    },
    trackInfo: {
        flex: 1,
        minWidth: 0,
    },
    trackName: {
        fontSize: '0.875rem',
        fontWeight: 500,
        color: '#fff',
        whiteSpace: 'nowrap' as const,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    trackArtist: {
        fontSize: '0.75rem',
        color: 'rgba(255,255,255,0.5)',
    },
    trackDuration: {
        fontSize: '0.75rem',
        color: 'rgba(255,255,255,0.4)',
    },
};

interface BGMPlayerViewProps {
    data?: BGMTrack[];
}

export const BGMPlayerView: React.FC<BGMPlayerViewProps> = () => {
    const player = useBGMPlayer();
    const tracks: BGMTrack[] = bgmData.bgm as BGMTrack[];

    // Initialize playlist
    useEffect(() => {
        player.setPlaylist(tracks);
    }, []);

    const progress = player.duration > 0 ? (player.currentTime / player.duration) * 100 : 0;

    const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percentage = x / rect.width;
        player.seek(percentage * player.duration);
    };

    const getRepeatIcon = () => {
        switch (player.repeatMode) {
            case 'one': return '🔂';
            case 'all': return '🔁';
            default: return '🔁';
        }
    };

    return (
        <div style={styles.container}>
            {/* Background Overlay */}
            <div style={styles.backgroundOverlay} />

            {/* Left: Player Area */}
            <div style={styles.playerArea}>
                {/* Album Art */}
                <div style={styles.albumArt}>
                    🎵
                </div>

                {/* Now Playing Card */}
                <div style={styles.nowPlayingCard}>
                    <div style={styles.trackTitle}>
                        {player.currentTrack?.title || 'No Track Selected'}
                    </div>
                    <div style={styles.trackSubtitle}>
                        {player.currentTrack?.artist || 'Unknown Artist'}
                    </div>

                    {/* Progress Bar */}
                    <div style={styles.progressContainer}>
                        <div style={styles.progressTrack} onClick={handleProgressClick}>
                            <div style={{ ...styles.progressFill, width: `${progress}%` }} />
                        </div>
                    </div>
                    <div style={styles.timeDisplay}>
                        <span>{formatTime(player.currentTime)}</span>
                        <span>{formatTime(player.duration)}</span>
                    </div>

                    {/* Controls */}
                    <div style={styles.controls}>
                        <button
                            style={{
                                ...styles.controlBtn,
                                ...(player.shuffleMode ? styles.controlBtnActive : {})
                            }}
                            onClick={player.toggleShuffle}
                            title="シャッフル"
                        >
                            🔀
                        </button>
                        <button style={styles.controlBtn} onClick={player.previous} title="前の曲">
                            ⏮️
                        </button>
                        <button style={styles.playBtn} onClick={player.togglePlay}>
                            {player.isPlaying ? '⏸️' : '▶️'}
                        </button>
                        <button style={styles.controlBtn} onClick={player.next} title="次の曲">
                            ⏭️
                        </button>
                        <button
                            style={{
                                ...styles.controlBtn,
                                ...(player.repeatMode !== 'off' ? styles.controlBtnActive : {})
                            }}
                            onClick={player.cycleRepeat}
                            title={`リピート: ${player.repeatMode}`}
                        >
                            {getRepeatIcon()}
                        </button>
                    </div>
                </div>
            </div>

            {/* Right: Playlist Area */}
            <div style={styles.playlistArea}>
                {/* Search Header */}
                <div style={styles.playlistHeader}>
                    <input
                        type="text"
                        placeholder="🔍 曲名、アーティストで検索..."
                        style={styles.searchInput}
                        value={player.searchQuery}
                        onChange={(e) => player.setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Track List */}
                <div style={styles.trackList}>
                    {player.filteredPlaylist.map((track) => {
                        const isActive = player.currentTrack?.id === track.id;
                        const actualIndex = player.playlist.findIndex(t => t.id === track.id);

                        return (
                            <div
                                key={track.id}
                                style={{
                                    ...styles.trackItem,
                                    ...(isActive ? styles.trackItemActive : {}),
                                }}
                                onClick={() => player.selectTrack(actualIndex)}
                                onMouseEnter={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                    }
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) {
                                        e.currentTarget.style.background = 'transparent';
                                    }
                                }}
                            >
                                <div style={styles.trackIcon}>
                                    {isActive && player.isPlaying ? '🔊' : '🎵'}
                                </div>
                                <div style={styles.trackInfo}>
                                    <div style={styles.trackName}>{track.title}</div>
                                    <div style={styles.trackArtist}>{track.artist}</div>
                                </div>
                                <div style={styles.trackDuration}>
                                    {track.category}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
