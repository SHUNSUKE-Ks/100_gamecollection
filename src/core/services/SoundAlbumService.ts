export interface SoundTrack {
  filename: string;
  title: string;
}

export interface SoundAlbum {
  id: string;
  label: string;
  description: string;
  artworkPath: string;
  tracks: SoundTrack[];
}

const ALBUM_IDS = ['ect', 'Unnamed Memory'];

export const SoundAlbumService = {
  async loadAlbumMetadata(albumId: string): Promise<SoundAlbum | null> {
    try {
      const response = await fetch(`/src/assets/sound/bgm/${albumId}/${albumId}.json`);
      if (!response.ok) return null;
      return await response.json();
    } catch {
      return null;
    }
  },

  async loadAllAlbums(): Promise<SoundAlbum[]> {
    const albums: SoundAlbum[] = [];
    for (const albumId of ALBUM_IDS) {
      const album = await this.loadAlbumMetadata(albumId);
      if (album) albums.push(album);
    }
    return albums;
  },

  getTrackPath(albumId: string, filename: string): string {
    return `/src/assets/sound/bgm/${albumId}/${filename}`;
  },
};
