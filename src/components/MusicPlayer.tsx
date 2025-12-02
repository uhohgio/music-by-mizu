// src/components/MusicPlayer.tsx
"use client";
import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  FaPlay, FaPause, FaStepBackward, FaStepForward, FaMusic,
  FaRedo, FaRandom, FaVolumeUp, FaVolumeMute,
  FaVolumeDown, FaVolumeOff
} from 'react-icons/fa';
import { TbRepeatOnce } from 'react-icons/tb';
import { usePlayerStore, selectCurrentTrack } from '../store/playerStore';
import Footer from './Footer';

// ---- Helpers ----
const formatTime = (time: number) => {
  if (!isFinite(time)) return "00:00";
  const m = Math.floor(time / 60).toString().padStart(2, "0");
  const s = Math.floor(time % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

const MusicPlayer: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const previousVolumeRef = useRef(1);

  // ---- Subscribe to ONLY what you need ----
  const currentTrack = usePlayerStore(selectCurrentTrack);
  const queue = usePlayerStore(s => s.queue);
  const currentTrackIndex = usePlayerStore(s => s.currentTrackIndex);
  const isPlaying = usePlayerStore(s => s.isPlaying);
  const volume = usePlayerStore(s => s.volume);
  const isMuted = usePlayerStore(s => s.isMuted);
  const repeatMode = usePlayerStore(s => s.repeatMode);
  const isShuffled = usePlayerStore(s => s.isShuffled);
  const albumArtSrc = usePlayerStore(s => s.currentAlbum?.albumArtSrc);

  // Actions
  const setVolume = usePlayerStore(s => s.setVolume);
  const toggleRepeat = usePlayerStore(s => s.toggleRepeat);
  const toggleShuffle = usePlayerStore(s => s.toggleShuffle);
  const setIsPlaying = usePlayerStore(s => s.setIsPlaying);
  const handleTrackEnd = usePlayerStore(s => s.handleTrackEnd);
  const playNext = usePlayerStore(s => s.playNext);
  const playPrevious = usePlayerStore(s => s.playPrevious);
  const togglePlayPause = usePlayerStore(s => s.togglePlayPause);

  // ---- Derived data ----
  const trackSrc = currentTrack?.audioSrc ?? null;
  const trackTitle = currentTrack?.title ?? "";

  // ---- Local UI state ----
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMetadataLoaded, setIsMetadataLoaded] = useState(false);

  // ---- Stable callbacks ----
  const handleLoadedMetadata = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const d = audio.duration;
    if (isFinite(d)) {
      setDuration(d);
      setIsMetadataLoaded(true);
    } else {
      setDuration(0);
      setIsMetadataLoaded(false);
    }
  }, []);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleTrackEndInternal = useCallback(() => {
    if (repeatMode !== "one") handleTrackEnd();
  }, [repeatMode, handleTrackEnd]);

  // ---- SEEK ----
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const t = parseFloat(e.target.value);
    audio.currentTime = t;
    setCurrentTime(t);
  };

  // ---- VOLUME ----
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = parseFloat(e.target.value);
    const audio = audioRef.current;
    if (audio) {
      audio.volume = v;
      audio.muted = v === 0;
    }
    setVolume(v);
  };

  const toggleMuteInternal = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted || volume === 0) {
      const restore = previousVolumeRef.current || 0.5;
      audio.muted = false;
      setVolume(restore);
    } else {
      previousVolumeRef.current = volume;
      audio.muted = true;
      setVolume(0);
    }
  };

  // ---- EFFECT: Load track ----
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // FULL RESET (important!)
    audio.pause();
    audio.removeAttribute("src"); 
    audio.load(); 

    setIsMetadataLoaded(false);
    setCurrentTime(0);
    setDuration(0);

    if (!trackSrc) return;

    // Attach listeners BEFORE setting src
    const onLoadedMetadata = () => {
        const d = audio.duration;
        if (isFinite(d) && d > 0) {
        setDuration(d);
        setIsMetadataLoaded(true);
        }
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleTrackEndInternal);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    audio.addEventListener("loadedmetadata", onLoadedMetadata);

    const newSrc = new URL(trackSrc, window.location.origin).toString();
    if (audio.currentSrc !== newSrc) {
        audio.src = trackSrc;
        audio.load();
        }
    return () => {
        audio.removeEventListener("loadedmetadata", onLoadedMetadata);
        audio.removeEventListener("timeupdate", handleTimeUpdate);
        audio.removeEventListener("ended", handleTrackEndInternal);
        audio.removeEventListener("play", onPlay);
        audio.removeEventListener("pause", onPause);
    };
    
  }, [trackSrc]);

  // ---- EFFECT: Play/pause sync ----
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !trackSrc) return;

    if (isPlaying) {
      if (audio.paused) {
        audio.play().catch(() => setIsPlaying(false));
      }
    } else {
      if (!audio.paused) audio.pause();
    }
  }, [isPlaying, trackSrc, setIsPlaying]);

  // ---- EFFECT: Sync volume ----
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
      audio.muted = isMuted;
    }
  });

  // ---- EFFECT: Loop ----
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = repeatMode === "one";
    }
  }, [repeatMode]);

  // ---- NAV LOGIC ----
  const canWrap = repeatMode === "all" || isShuffled;
  const hasPrev =
    queue.length > 1 &&
    (canWrap || (currentTrackIndex !== null && currentTrackIndex > 0));
  const hasNext =
    queue.length > 1 &&
    (canWrap || (currentTrackIndex !== null && currentTrackIndex < queue.length - 1));

  // ---- NO TRACK ----
  if (!trackSrc) {
    return (
      <div className="pt-4 w-full flex-wrap"><Footer /></div>
    );
  }

  return (
  <div className="p-4 bg-gray-100 dark:bg-gray-800 shadow-md flex items-center gap-4 w-full flex-wrap @container">

    {/* Album Art */}
    <div className="w-24 h-24 bg-gray-300 dark:bg-gray-600 rounded overflow-hidden flex items-center justify-center">
      {albumArtSrc ? (
        <img src={albumArtSrc} alt="Album art" className="w-full h-full object-cover" />
      ) : (
        <FaMusic className="text-2xl text-gray-500" />
      )}
    </div>

    <div className="flex flex-col flex-grow gap-2 min-w-0">
      
      {/* Track Title */}
      <p className="text-sm font-semibold truncate text-neutral-900 dark:text-neutral-100">
        {trackTitle}
      </p>
      <audio ref={audioRef} preload="metadata" />
      {/* ============================
          SMALL SCREEN CONTROLS (≤640px)
         ============================ */}
      <div className="flex @[640px]:hidden items-center gap-3 justify-left">

        <button onClick={playPrevious} disabled={!hasPrev} className="p-2 bg-mizu-light dark:bg-mizu-dark  text-gray-700 dark:text-white rounded-full">
          <FaStepBackward />
        </button>

        <button
          onClick={togglePlayPause}
          disabled={!isMetadataLoaded}
          className="p-3 bg-mizu-light dark:bg-mizu-dark text-gray-700 dark:text-white rounded-full"
        >
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>

        <button onClick={playNext} disabled={!hasNext} className="p-2 bg-mizu-light dark:bg-mizu-dark  text-gray-700 dark:text-white rounded-full">
          <FaStepForward />
        </button>

        {/* Volume */}
        <div className="flex items-center gap-2">
          <button onClick={toggleMuteInternal}>
            {isMuted || volume === 0 ? (
              <FaVolumeMute />
            ) : volume > 0.5 ? (
              <FaVolumeUp />
            ) : volume > 0 ? (
              <FaVolumeDown />
            ) : (
              <FaVolumeOff />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20"
          />
        </div>

        </div>
        <div className="flex @[640px]:hidden items-center gap-3 justify-center">

         {/* Repeat */}
        <button
          onClick={toggleRepeat}
          className={`p-2 text-lg ${
            repeatMode !== 'none'
              ? 'text-mizu-dark dark:text-mizu-light'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {repeatMode === "one" ? <TbRepeatOnce /> : <FaRedo />}
        </button>

        {/* Shuffle */}
        <button
          onClick={toggleShuffle}
          className={`p-2 text-lg ${
            isShuffled
              ? 'text-mizu-dark dark:text-mizu-light'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <FaRandom />
        </button>

        {/* Seek Bar */}
        <div className="flex items-center gap-2 flex-grow">
          <span className="font-mono w-12 text-sm">{formatTime(currentTime)}</span>
          <input
            type="range"
            max={duration || 1}
            value={currentTime}
            onChange={handleSeek}
            className="flex-grow"
          />
          <span className="font-mono w-12 text-sm">{formatTime(duration)}</span>
        </div>
      </div>

      {/* =============================
          LARGE SCREEN CONTROLS (≥640px)
         ============================= */}
      <div className="hidden @[640px]:flex flex-col @[640px]:flex-row items-center gap-3">

        {/* Repeat */}
        <button
          onClick={toggleRepeat}
          className={`p-2 text-lg ${
            repeatMode !== 'none'
              ? 'text-mizu-dark dark:text-mizu-light'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          {repeatMode === "one" ? <TbRepeatOnce /> : <FaRedo />}
        </button>

        {/* Prev */}
        <button onClick={playPrevious} disabled={!hasPrev} className="p-2 bg-mizu-light dark:bg-mizu-dark  text-gray-700 dark:text-white rounded-full">
          <FaStepBackward />
        </button>

        {/* Play / Pause */}
        <button
          onClick={togglePlayPause}
          disabled={!isMetadataLoaded}
          className="p-3 bg-mizu-light dark:bg-mizu-dark  text-gray-700 dark:text-white rounded-full"
        >
          {isPlaying ? <FaPause /> : <FaPlay />}
        </button>

        {/* Next */}
        <button onClick={playNext} disabled={!hasNext} className="p-2 bg-mizu-light dark:bg-mizu-dark  text-gray-700 dark:text-white rounded-full">
          <FaStepForward />
        </button>

        {/* Shuffle */}
        <button
          onClick={toggleShuffle}
          className={`p-2 text-lg ${
            isShuffled
              ? 'text-mizu-dark dark:text-mizu-light'
              : 'text-gray-500 dark:text-gray-400'
          }`}
        >
          <FaRandom />
        </button>

        {/* Seek Bar */}
        <div className="flex items-center gap-2 flex-grow">
          <span className="font-mono w-12 text-sm">{formatTime(currentTime)}</span>
          <input
            type="range"
            max={duration || 1}
            value={currentTime}
            onChange={handleSeek}
            className="flex-grow"
          />
          <span className="font-mono w-12 text-sm">{formatTime(duration)}</span>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2">
          <button onClick={toggleMuteInternal}>
            {isMuted || volume === 0 ? (
              <FaVolumeMute />
            ) : volume > 0.5 ? (
              <FaVolumeUp />
            ) : volume > 0 ? (
              <FaVolumeDown />
            ) : (
              <FaVolumeOff />
            )}
          </button>

          <input
            type="range"
            min="0"
            max="1"
            step="0.02"
            value={volume}
            onChange={handleVolumeChange}
            className="w-20"
          />
        </div>

      </div>
    </div>
  </div>
);

};

export default MusicPlayer;
