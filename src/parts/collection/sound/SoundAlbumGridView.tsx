import { useState, useEffect } from 'react';
import type { SoundAlbum } from '@/core/services/SoundAlbumService';
import { SoundAlbumService } from '@/core/services/SoundAlbumService';
import { useSoundAlbumStore } from '@/core/stores/soundAlbumStore';
import './SoundAlbumView.css';

interface SoundAlbumGridViewProps {
  onAlbumSelect: (album: SoundAlbum) => void;
}

export function SoundAlbumGridView({ onAlbumSelect }: SoundAlbumGridViewProps) {
  const { albums, setAlbums, setLoading, isLoading } = useSoundAlbumStore();
  const { getAlbumLabel, setAlbumLabel, loadLabelsFromStorage } = useSoundAlbumStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    loadLabelsFromStorage();
    loadAlbums();
  }, []);

  const loadAlbums = async () => {
    setLoading(true);
    const loaded = await SoundAlbumService.loadAllAlbums();
    setAlbums(loaded);
    setLoading(false);
  };

  const handleEditLabel = (albumId: string) => {
    setEditingId(albumId);
    setEditValue(getAlbumLabel(albumId));
  };

  const handleSaveLabel = (albumId: string) => {
    if (editValue.trim()) {
      setAlbumLabel(albumId, editValue.trim());
    }
    setEditingId(null);
  };

  if (isLoading) {
    return <div className="sound-loading">読み込み中...</div>;
  }

  return (
    <div className="sound-album-grid-container">
      <div className="sound-album-grid">
        {albums.map((album) => (
          <div
            key={album.id}
            className="sound-album-card"
            onClick={() => onAlbumSelect(album)}
          >
            {/* Artwork */}
            <div className="sound-album-artwork">
              <div className="sound-artwork-placeholder">
                <span style={{ fontSize: '3rem' }}>🎵</span>
              </div>

              {/* Menu (three-dot) */}
              <div className="sound-album-menu">
                <button
                  className="sound-album-menu-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditLabel(album.id);
                  }}
                  title="Label を編集"
                >
                  ⋮
                </button>
              </div>
            </div>

            {/* Album Info */}
            <div className="sound-album-info">
              {editingId === album.id ? (
                <div className="sound-album-edit" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="text"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveLabel(album.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    autoFocus
                    className="sound-album-edit-input"
                  />
                  <div className="sound-album-edit-buttons">
                    <button
                      onClick={() => handleSaveLabel(album.id)}
                      className="sound-album-edit-save"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="sound-album-edit-cancel"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h3 className="sound-album-title">{getAlbumLabel(album.id)}</h3>
                  <p className="sound-album-tracks">{album.tracks.length} 曲</p>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
