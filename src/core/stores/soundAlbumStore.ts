import { create } from 'zustand';
import type { SoundAlbum } from '@/core/services/SoundAlbumService';

interface AlbumLabel {
  [albumId: string]: string;
}

interface SoundAlbumStore {
  albums: SoundAlbum[];
  albumLabels: AlbumLabel;
  isLoading: boolean;
  error: string | null;

  // Actions
  setAlbums: (albums: SoundAlbum[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAlbumLabel: (albumId: string, label: string) => void;
  getAlbumLabel: (albumId: string) => string;
  loadLabelsFromStorage: () => void;
  saveLabelsToStorage: () => void;
}

const STORAGE_KEY = 'sound_album_labels';

export const useSoundAlbumStore = create<SoundAlbumStore>((set, get) => ({
  albums: [],
  albumLabels: {},
  isLoading: false,
  error: null,

  setAlbums: (albums) => set({ albums }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),

  setAlbumLabel: (albumId, label) => {
    set((state) => ({
      albumLabels: { ...state.albumLabels, [albumId]: label },
    }));
    // Auto-save to storage
    setTimeout(() => get().saveLabelsToStorage(), 100);
  },

  getAlbumLabel: (albumId) => {
    const { albumLabels, albums } = get();
    return (
      albumLabels[albumId] ||
      albums.find((a) => a.id === albumId)?.label ||
      albumId
    );
  },

  loadLabelsFromStorage: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        set({ albumLabels: JSON.parse(stored) });
      }
    } catch (e) {
      console.error('Failed to load album labels from storage:', e);
    }
  },

  saveLabelsToStorage: () => {
    try {
      const { albumLabels } = get();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(albumLabels));
    } catch (e) {
      console.error('Failed to save album labels to storage:', e);
    }
  },
}));
