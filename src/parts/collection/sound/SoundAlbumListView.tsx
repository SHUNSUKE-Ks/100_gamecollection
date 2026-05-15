import { useEffect, useState } from 'react';
import type { SoundAlbum } from '@/core/services/SoundAlbumService';
import { SoundAlbumService } from '@/core/services/SoundAlbumService';
import { useSoundAlbumStore } from '@/core/stores/soundAlbumStore';
import './SoundAlbumView.css';

interface SoundAlbumListViewProps {
  onAlbumSelect: (album: SoundAlbum) => void;
}

export function SoundAlbumListView({ onAlbumSelect }: SoundAlbumListViewProps) {
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
    <div className="sound-album-list-container">
      <table className="sound-album-table">
        <thead>
          <tr>
            <th>アルバム名</th>
            <th>曲数</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {albums.map((album, idx) => (
            <tr
              key={album.id}
              className="sound-album-row"
              onClick={() => onAlbumSelect(album)}
            >
              <td className="sound-album-name">
                {editingId === album.id ? (
                  <div
                    className="sound-album-edit-inline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveLabel(album.id);
                        if (e.key === 'Escape') setEditingId(null);
                      }}
                      autoFocus
                      className="sound-album-edit-input-inline"
                    />
                    <button
                      onClick={() => handleSaveLabel(album.id)}
                      className="sound-album-edit-save-small"
                    >
                      ✓
                    </button>
                  </div>
                ) : (
                  getAlbumLabel(album.id)
                )}
              </td>
              <td className="sound-album-count">{album.tracks.length}</td>
              <td className="sound-album-action" onClick={(e) => e.stopPropagation()}>
                <button
                  className="sound-album-menu-btn-small"
                  onClick={() => handleEditLabel(album.id)}
                  title="Label を編集"
                >
                  ⋮
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
