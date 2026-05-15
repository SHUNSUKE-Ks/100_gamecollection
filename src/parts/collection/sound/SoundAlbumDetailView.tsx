import { useState, useRef, useEffect } from 'react';
import type { SoundAlbum } from '@/core/services/SoundAlbumService';
import { SoundAlbumService } from '@/core/services/SoundAlbumService';
import { useSoundAlbumStore } from '@/core/stores/soundAlbumStore';
import './SoundAlbumView.css';

interface SoundAlbumDetailViewProps {
  album: SoundAlbum;
  onBack: () => void;
}

export function SoundAlbumDetailView({ album, onBack }: SoundAlbumDetailViewProps) {
  const { getAlbumLabel } = useSoundAlbumStore();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const currentTrack = album.tracks[currentTrackIndex];
  const trackPath = SoundAlbumService.getTrackPath(album.id, currentTrack.filename);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => {
      if (currentTrackIndex < album.tracks.length - 1) {
        setCurrentTrackIndex(currentTrackIndex + 1);
      } else {
        setIsPlaying(false);
      }
    };
    const handleCanPlay = () => {
      if (isPlaying) {
        audio.play().catch(() => {});
      }
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, [currentTrackIndex, album.tracks.length, isPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  const handlePlayTrack = (index: number) => {
    // 同じ曲の場合は一度停止してから再生
    if (index === currentTrackIndex && isPlaying) {
      setIsPlaying(false);
      setTimeout(() => {
        setIsPlaying(true);
      }, 100);
    } else {
      // 異なる曲の場合は切り替えて再生
      setCurrentTrackIndex(index);
      setIsPlaying(true);
    }
  };

  const handlePrevious = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1);
      setIsPlaying(true);
    }
  };

  const handleNext = () => {
    if (currentTrackIndex < album.tracks.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
      setIsPlaying(true);
    }
  };

  const formatTime = (time: number) => {
    if (!time || !isFinite(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="sound-album-detail-container">
      <audio ref={audioRef} src={trackPath} crossOrigin="anonymous" />

      {/* Header */}
      <div className="sound-detail-header">
        <button className="sound-detail-back-btn" onClick={onBack}>
          ← Back
        </button>
        <h2 className="sound-detail-title">{getAlbumLabel(album.id)}</h2>
      </div>

      {/* Player */}
      <div className="sound-player-section">
        <div className="sound-player-artwork">
          <div className="sound-player-artwork-placeholder">
            <span style={{ fontSize: '5rem' }}>🎵</span>
          </div>
        </div>

        <div className="sound-player-info">
          <h3 className="sound-player-track">{currentTrack.title}</h3>
          <p className="sound-player-album">{getAlbumLabel(album.id)}</p>
        </div>

        <div className="sound-player-controls">
          <button
            className="sound-player-btn"
            onClick={handlePrevious}
            disabled={currentTrackIndex === 0}
          >
            ⏮ Previous
          </button>
          <button
            className="sound-player-btn sound-player-play"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? '⏸ Pause' : '▶ Play'}
          </button>
          <button
            className="sound-player-btn"
            onClick={handleNext}
            disabled={currentTrackIndex === album.tracks.length - 1}
          >
            Next ⏭
          </button>
        </div>

        <div className="sound-player-progress">
          <span className="sound-player-time">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={(e) => {
              const newTime = Number(e.target.value);
              setCurrentTime(newTime);
              if (audioRef.current) {
                audioRef.current.currentTime = newTime;
              }
            }}
            className="sound-player-slider"
          />
          <span className="sound-player-time">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Playlist */}
      <div className="sound-playlist-section">
        <h3 className="sound-playlist-title">曲一覧</h3>
        <div className="sound-playlist">
          {album.tracks.map((track, index) => (
            <div
              key={index}
              className={`sound-playlist-item ${
                index === currentTrackIndex ? 'active' : ''
              } ${isPlaying && index === currentTrackIndex ? 'playing' : ''}`}
              onClick={() => handlePlayTrack(index)}
            >
              <span className="sound-playlist-index">
                {isPlaying && index === currentTrackIndex ? '▶' : index + 1}
              </span>
              <span className="sound-playlist-track-name">{track.title}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
