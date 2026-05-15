import { useState, useEffect } from 'react';
import type { SoundAlbum } from '@/core/services/SoundAlbumService';
import { useSoundAlbumStore } from '@/core/stores/soundAlbumStore';
import { SoundAlbumGridView } from './SoundAlbumGridView';
import { SoundAlbumListView } from './SoundAlbumListView';
import { SoundAlbumDetailView } from './SoundAlbumDetailView';
import './SoundAlbumView.css';

type ViewMode = 'grid' | 'list' | 'detail';

export function SoundCollectionView() {
  const { loadLabelsFromStorage } = useSoundAlbumStore();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [selectedAlbum, setSelectedAlbum] = useState<SoundAlbum | null>(null);

  useEffect(() => {
    loadLabelsFromStorage();
  }, []);

  const handleAlbumSelect = (album: SoundAlbum) => {
    setSelectedAlbum(album);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setSelectedAlbum(null);
    setViewMode('grid');
  };

  // Show detail view
  if (viewMode === 'detail' && selectedAlbum) {
    return (
      <SoundAlbumDetailView
        album={selectedAlbum}
        onBack={handleBackToList}
      />
    );
  }

  // Show grid or list view
  return (
    <div className="sound-collection-main">
      {/* View Mode Switcher */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        padding: '1rem 2rem',
        background: 'rgba(31, 41, 55, 0.6)',
        borderBottom: '1px solid rgba(75, 85, 99, 0.5)',
      }}>
        <button
          onClick={() => setViewMode('grid')}
          style={{
            padding: '0.5rem 1rem',
            background: viewMode === 'grid' ? 'rgba(120, 113, 255, 0.3)' : 'transparent',
            border: `1px solid ${viewMode === 'grid' ? '#7871ff' : 'rgba(75, 85, 99, 0.5)'}`,
            color: viewMode === 'grid' ? '#facc15' : '#9ca3af',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.3s ease',
          }}
        >
          🎨 Grid
        </button>
        <button
          onClick={() => setViewMode('list')}
          style={{
            padding: '0.5rem 1rem',
            background: viewMode === 'list' ? 'rgba(120, 113, 255, 0.3)' : 'transparent',
            border: `1px solid ${viewMode === 'list' ? '#7871ff' : 'rgba(75, 85, 99, 0.5)'}`,
            color: viewMode === 'list' ? '#facc15' : '#9ca3af',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'all 0.3s ease',
          }}
        >
          📋 List
        </button>
      </div>

      {/* Content Area */}
      {viewMode === 'grid' && <SoundAlbumGridView onAlbumSelect={handleAlbumSelect} />}
      {viewMode === 'list' && <SoundAlbumListView onAlbumSelect={handleAlbumSelect} />}
    </div>
  );
}
