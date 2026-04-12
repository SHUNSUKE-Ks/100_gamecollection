import { useReducer, useRef, useEffect, useCallback } from 'react';

// Types
export interface BGMTrack {
    id: string;
    title: string;
    filename: string;
    description: string;
    tags: string[];
    category: string;
    duration: number | null;
    artist: string;
    selected?: boolean;
}

interface BGMPlayerState {
    isPlaying: boolean;
    currentTrackIndex: number;
    currentTime: number;
    duration: number;
    volume: number;
    isMuted: boolean;
    shuffleMode: boolean;
    repeatMode: 'off' | 'all' | 'one';
    playlist: BGMTrack[];
    originalPlaylist: BGMTrack[];
    showSelectedOnly: boolean;
    searchQuery: string;
}

type BGMPlayerAction =
    | { type: 'SET_PLAYLIST'; payload: BGMTrack[] }
    | { type: 'TOGGLE_PLAY' }
    | { type: 'SET_PLAYING'; payload: boolean }
    | { type: 'SELECT_TRACK'; payload: number }
    | { type: 'NEXT' }
    | { type: 'PREVIOUS' }
    | { type: 'SET_TIME'; payload: number }
    | { type: 'SET_DURATION'; payload: number }
    | { type: 'TOGGLE_SHUFFLE' }
    | { type: 'CYCLE_REPEAT' }
    | { type: 'SET_VOLUME'; payload: number }
    | { type: 'TOGGLE_MUTE' }
    | { type: 'SET_SEARCH'; payload: string }
    | { type: 'TOGGLE_SELECTED_ONLY' }
    | { type: 'TOGGLE_TRACK_SELECTED'; payload: string };

const initialState: BGMPlayerState = {
    isPlaying: false,
    currentTrackIndex: 0,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    isMuted: false,
    shuffleMode: false,
    repeatMode: 'off',
    playlist: [],
    originalPlaylist: [],
    showSelectedOnly: false,
    searchQuery: '',
};

function shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function reducer(state: BGMPlayerState, action: BGMPlayerAction): BGMPlayerState {
    switch (action.type) {
        case 'SET_PLAYLIST':
            return {
                ...state,
                playlist: action.payload,
                originalPlaylist: action.payload,
                currentTrackIndex: 0,
            };
        case 'TOGGLE_PLAY':
            return { ...state, isPlaying: !state.isPlaying };
        case 'SET_PLAYING':
            return { ...state, isPlaying: action.payload };
        case 'SELECT_TRACK':
            return { ...state, currentTrackIndex: action.payload, isPlaying: true };
        case 'NEXT': {
            const nextIndex = (state.currentTrackIndex + 1) % state.playlist.length;
            return { ...state, currentTrackIndex: nextIndex };
        }
        case 'PREVIOUS': {
            // If more than 3 seconds in, restart current track
            if (state.currentTime > 3) {
                return { ...state, currentTime: 0 };
            }
            const prevIndex = state.currentTrackIndex === 0
                ? state.playlist.length - 1
                : state.currentTrackIndex - 1;
            return { ...state, currentTrackIndex: prevIndex };
        }
        case 'SET_TIME':
            return { ...state, currentTime: action.payload };
        case 'SET_DURATION':
            return { ...state, duration: action.payload };
        case 'TOGGLE_SHUFFLE':
            if (!state.shuffleMode) {
                // Enable shuffle
                const currentTrack = state.playlist[state.currentTrackIndex];
                const shuffled = shuffleArray(state.playlist);
                const newIndex = shuffled.findIndex(t => t.id === currentTrack.id);
                return { ...state, shuffleMode: true, playlist: shuffled, currentTrackIndex: newIndex };
            } else {
                // Disable shuffle - restore original order
                const currentTrack = state.playlist[state.currentTrackIndex];
                const newIndex = state.originalPlaylist.findIndex(t => t.id === currentTrack.id);
                return { ...state, shuffleMode: false, playlist: state.originalPlaylist, currentTrackIndex: newIndex };
            }
        case 'CYCLE_REPEAT': {
            const modes: ('off' | 'all' | 'one')[] = ['off', 'all', 'one'];
            const currentIndex = modes.indexOf(state.repeatMode);
            const nextMode = modes[(currentIndex + 1) % modes.length];
            return { ...state, repeatMode: nextMode };
        }
        case 'SET_VOLUME':
            return { ...state, volume: action.payload, isMuted: action.payload === 0 };
        case 'TOGGLE_MUTE':
            return { ...state, isMuted: !state.isMuted };
        case 'SET_SEARCH':
            return { ...state, searchQuery: action.payload };
        case 'TOGGLE_SELECTED_ONLY':
            return { ...state, showSelectedOnly: !state.showSelectedOnly };
        case 'TOGGLE_TRACK_SELECTED': {
            const updatedPlaylist = state.playlist.map(track =>
                track.id === action.payload ? { ...track, selected: !track.selected } : track
            );
            const updatedOriginal = state.originalPlaylist.map(track =>
                track.id === action.payload ? { ...track, selected: !track.selected } : track
            );
            return { ...state, playlist: updatedPlaylist, originalPlaylist: updatedOriginal };
        }
        default:
            return state;
    }
}

export function useBGMPlayer(basePath: string = '/src/assets/sound/bgm/bgmlist01/') {
    const [state, dispatch] = useReducer(reducer, initialState);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio element
    useEffect(() => {
        audioRef.current = new Audio();
        audioRef.current.volume = state.volume;

        const audio = audioRef.current;

        const handleTimeUpdate = () => {
            dispatch({ type: 'SET_TIME', payload: audio.currentTime });
        };

        const handleLoadedMetadata = () => {
            dispatch({ type: 'SET_DURATION', payload: audio.duration });
        };

        const handleEnded = () => {
            if (state.repeatMode === 'one') {
                audio.currentTime = 0;
                audio.play();
            } else if (state.repeatMode === 'all' || state.currentTrackIndex < state.playlist.length - 1) {
                dispatch({ type: 'NEXT' });
            } else {
                dispatch({ type: 'SET_PLAYING', payload: false });
            }
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
            audio.pause();
        };
    }, []);

    // Handle repeat mode changes for ended event
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const handleEnded = () => {
            if (state.repeatMode === 'one') {
                audio.currentTime = 0;
                audio.play();
            } else if (state.repeatMode === 'all' || state.currentTrackIndex < state.playlist.length - 1) {
                dispatch({ type: 'NEXT' });
            } else {
                dispatch({ type: 'SET_PLAYING', payload: false });
            }
        };

        audio.addEventListener('ended', handleEnded);
        return () => audio.removeEventListener('ended', handleEnded);
    }, [state.repeatMode, state.currentTrackIndex, state.playlist.length]);

    // Load and play track when currentTrackIndex changes
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || state.playlist.length === 0) return;

        const track = state.playlist[state.currentTrackIndex];
        if (!track) return;

        audio.src = `${basePath}${track.filename}`;
        audio.load();

        if (state.isPlaying) {
            audio.play().catch(console.error);
        }
    }, [state.currentTrackIndex, state.playlist, basePath]);

    // Handle play/pause
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (state.isPlaying) {
            audio.play().catch(console.error);
        } else {
            audio.pause();
        }
    }, [state.isPlaying]);

    // Handle volume changes
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = state.isMuted ? 0 : state.volume;
        }
    }, [state.volume, state.isMuted]);

    // Actions
    const setPlaylist = useCallback((tracks: BGMTrack[]) => {
        dispatch({ type: 'SET_PLAYLIST', payload: tracks });
    }, []);

    const togglePlay = useCallback(() => {
        dispatch({ type: 'TOGGLE_PLAY' });
    }, []);

    const selectTrack = useCallback((index: number) => {
        dispatch({ type: 'SELECT_TRACK', payload: index });
    }, []);

    const next = useCallback(() => {
        dispatch({ type: 'NEXT' });
    }, []);

    const previous = useCallback(() => {
        dispatch({ type: 'PREVIOUS' });
    }, []);

    const seek = useCallback((time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
            dispatch({ type: 'SET_TIME', payload: time });
        }
    }, []);

    const toggleShuffle = useCallback(() => {
        dispatch({ type: 'TOGGLE_SHUFFLE' });
    }, []);

    const cycleRepeat = useCallback(() => {
        dispatch({ type: 'CYCLE_REPEAT' });
    }, []);

    const setVolume = useCallback((vol: number) => {
        dispatch({ type: 'SET_VOLUME', payload: vol });
    }, []);

    const toggleMute = useCallback(() => {
        dispatch({ type: 'TOGGLE_MUTE' });
    }, []);

    const setSearchQuery = useCallback((query: string) => {
        dispatch({ type: 'SET_SEARCH', payload: query });
    }, []);

    const toggleSelectedOnly = useCallback(() => {
        dispatch({ type: 'TOGGLE_SELECTED_ONLY' });
    }, []);

    const toggleTrackSelected = useCallback((trackId: string) => {
        dispatch({ type: 'TOGGLE_TRACK_SELECTED', payload: trackId });
    }, []);

    // Filtered playlist
    const filteredPlaylist = state.playlist.filter(track => {
        const matchesSearch = state.searchQuery === '' ||
            track.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            track.filename.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
            track.artist.toLowerCase().includes(state.searchQuery.toLowerCase());
        const matchesSelected = !state.showSelectedOnly || track.selected;
        return matchesSearch && matchesSelected;
    });

    const currentTrack = state.playlist[state.currentTrackIndex] || null;

    return {
        // State
        isPlaying: state.isPlaying,
        currentTrack,
        currentTrackIndex: state.currentTrackIndex,
        currentTime: state.currentTime,
        duration: state.duration,
        volume: state.volume,
        isMuted: state.isMuted,
        shuffleMode: state.shuffleMode,
        repeatMode: state.repeatMode,
        searchQuery: state.searchQuery,
        showSelectedOnly: state.showSelectedOnly,
        playlist: state.playlist,
        filteredPlaylist,

        // Actions
        setPlaylist,
        togglePlay,
        selectTrack,
        next,
        previous,
        seek,
        toggleShuffle,
        cycleRepeat,
        setVolume,
        toggleMute,
        setSearchQuery,
        toggleSelectedOnly,
        toggleTrackSelected,
    };
}
