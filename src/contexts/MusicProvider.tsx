'use client'

import { ReactNode, createContext, useContext, useMemo, useState, useRef, useCallback, useEffect } from 'react';

export interface MusicTrack {
    title: string;
    source: string;
    artist?: string;
}

interface MusicContextType {
    tracks: MusicTrack[];
    currentTrack: MusicTrack | null;
    isPlaying: boolean;
    play: () => void;
    pause: () => void;
    next: () => void;
    setVolume: (volume: number) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const useMusic = () => {
    const context = useContext(MusicContext);
    if (context === undefined) {
        throw new Error('useMusic must be used within a MusicProvider');
    }
    return context;
};

export interface MusicProviderProps {
    children?: ReactNode;
    autoPlay?: boolean;
}

export default function MusicProvider({ children, autoPlay = true }: MusicProviderProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const tracks = useMemo<MusicTrack[]>(() => [{
        title: "Quiz Master",
        source: "/mp3/quiz-master.mp3",
        artist: "Background Music"
    }, 
    // {
    //     title: "Game Time",
    //     source: "/mp3/game-time.mp3",
    //     artist: "Background Music"
    // }, {
    //     title: "Victory Theme",
    //     source: "/mp3/victory-theme.mp3",
    //     artist: "Background Music"
    // }
], []);

    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    const currentTrack = tracks[currentTrackIndex];

    // Initialize audio element
    useEffect(() => {
        if (typeof window !== 'undefined') {
            audioRef.current = new Audio();
            audioRef.current.volume = 0.3; // Lower volume for background music
            audioRef.current.loop = false; // Don't loop, we'll handle playlist

            const audio = audioRef.current;

            const handleEnded = () => {
                next(); // Auto-play next track when current ends
            };

            audio.addEventListener('ended', handleEnded);

            return () => {
                audio.removeEventListener('ended', handleEnded);
                audio.pause();
            };
        }
    }, []);

    // Load current track
    useEffect(() => {
        if (audioRef.current && currentTrack) {
            audioRef.current.src = currentTrack.source;
            audioRef.current.load();
            if (isPlaying) {
                audioRef.current.play().catch(console.error);
            }
        }
    }, [currentTrack, isPlaying]);

    // Auto-play on mount if enabled
    useEffect(() => {
        if (autoPlay && tracks.length > 0) {
            play();
        }
    }, [autoPlay, tracks.length]);

    const play = useCallback(() => {
        if (audioRef.current && tracks.length > 0) {
            audioRef.current.play().then(() => {
                setIsPlaying(true);
            }).catch(console.error);
        }
    }, [tracks.length]);

    const pause = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
    }, []);

    const next = useCallback(() => {
        setCurrentTrackIndex(prev => (prev + 1) % tracks.length);
        // Auto-play next track
        setTimeout(play, 100);
    }, [tracks.length, play]);

    const setVolume = useCallback((newVolume: number) => {
        if (audioRef.current) {
            audioRef.current.volume = Math.max(0, Math.min(1, newVolume));
        }
    }, []);

    const value = useMemo(() => ({
        tracks,
        currentTrack,
        isPlaying,
        play,
        pause,
        next,
        setVolume,
    }), [tracks, currentTrack, isPlaying, play, pause, next, setVolume]);

    return (
        <MusicContext.Provider value={value}>
            {children}
        </MusicContext.Provider>
    );
}