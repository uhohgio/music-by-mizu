// src/store/playerStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { Track, Album } from '../types';

// --- Fisher-Yates Shuffle Algorithm ---
function shuffleArray<T>(array: T[]): T[] {
    let currentIndex = array.length, randomIndex;
    const newArray = [...array]; // Clone array
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [newArray[currentIndex], newArray[randomIndex]] = [
        newArray[randomIndex], newArray[currentIndex]];
    }
    return newArray;
}

// --- Interface defining State + Actions ---
interface PlayerState {
  // State
  currentAlbum: Pick<Album, 'id' | 'title' | 'albumArtSrc'> | null;
  queue: Track[]; // Tracks for the current album
  originalIndices: number[]; // e.g., [0, 1, 2]
  shuffledIndices: number[] | null; // e.g., [1, 0, 2] or null
  currentTrackIndex: number | null; // Index in the *original* queue array
  isPlaying: boolean;
  volume: number;
  isMuted: boolean;
  repeatMode: 'none' | 'one' | 'all';
  isShuffled: boolean;

  // Actions
  loadAlbum: (album: Album, playFirstTrack?: boolean) => void; // Option to autoplay first track on load
  playTrack: (trackIndex: number) => void; // Plays a specific track index from the current queue
  togglePlayPause: () => void; // Action called by UI button press
  setIsPlaying: (playing: boolean) => void; // Action called by audio element events
  playNext: () => void;
  playPrevious: () => void;
  setVolume: (volume: number) => void; // Action called by volume slider / mute toggle
  // toggleMute removed - logic handled in component calling setVolume
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  handleTrackEnd: () => void; // Logic for when a track finishes naturally
}

// --- Store Implementation ---
export const usePlayerStore = create<PlayerState>()(
    devtools(
  persist(
    (set, get) => ({
      // --- Initial State ---
      currentAlbum: null,
      queue: [],
      originalIndices: [],
      shuffledIndices: null,
      currentTrackIndex: null,
      isPlaying: false,
      volume: 1,
      isMuted: false,
      repeatMode: 'all',
      isShuffled: false,

      // --- Actions ---
      loadAlbum: (album, playFirstTrack = false) => {
        const newOriginalIndices = Array.from(album.tracks.keys());
        const startPlaying = playFirstTrack && album.tracks.length > 0;
        const firstIndex = startPlaying ? 0 : null; // Play track 0 if playFirstTrack is true

        set({
          currentAlbum: { id: album.id, title: album.title, albumArtSrc: album.albumArtSrc },
          queue: album.tracks,
          originalIndices: newOriginalIndices,
          currentTrackIndex: firstIndex, // Set initial track index
          isPlaying: startPlaying, // Set playing state based on option
          isShuffled: false, // Always reset shuffle when loading a new album
          shuffledIndices: null,
        });
      },

      playTrack: (trackIndex) => {
        const { queue } = get();
        if (trackIndex >= 0 && trackIndex < queue.length) {
          set({ currentTrackIndex: trackIndex, isPlaying: true });
        }
      },

      togglePlayPause: () => {
        // Only toggle if a track is loaded
        if (get().currentTrackIndex !== null) {
             set(state => ({ isPlaying: !state.isPlaying }));
        }
      },

      setIsPlaying: (playing) => {
        // Directly set playing state, usually based on audio events
        set({ isPlaying: playing });
      },

      playNext: () => {
        const { currentTrackIndex, isShuffled, shuffledIndices, queue,  repeatMode } = get();
        if (queue.length === 0) return; // No tracks loaded

        let nextOriginalIndex: number | null = null; // Index in the original queue

        if (currentTrackIndex === null) {
            // Nothing playing, start from beginning (shuffled or linear)
            nextOriginalIndex = isShuffled && shuffledIndices ? shuffledIndices[0] : 0;
        } else if (isShuffled && shuffledIndices) {
            const currentPositionInShuffle = shuffledIndices.indexOf(currentTrackIndex);
            const nextPositionInShuffle = currentPositionInShuffle + 1;
            if (nextPositionInShuffle < shuffledIndices.length) {
                nextOriginalIndex = shuffledIndices[nextPositionInShuffle];
            } else if (repeatMode === 'all') { // Wrap shuffled if repeat all
                nextOriginalIndex = shuffledIndices[0];
            }
            // If end reached & repeat !== 'all', nextOriginalIndex remains null
        } else { // Linear mode
            const nextLinearIndex = currentTrackIndex + 1;
            if (nextLinearIndex < queue.length) {
                nextOriginalIndex = nextLinearIndex;
            } else if (repeatMode === 'all') { // Wrap linear if repeat all
                nextOriginalIndex = 0;
            }
            // If end reached & repeat !== 'all', nextOriginalIndex remains null
        }

        if (nextOriginalIndex !== null) {
            set({ currentTrackIndex: nextOriginalIndex, isPlaying: true });
        } else {
             // Reached end and not repeating all, stop playback
             set({ isPlaying: false });
        }
      },

      playPrevious: () => {
        const { currentTrackIndex, isShuffled, shuffledIndices, queue,  repeatMode } = get();
        if (queue.length === 0) return;

        let prevOriginalIndex: number | null = null;

        if (currentTrackIndex === null) {
            // Nothing playing, start from end (shuffled or linear)
            prevOriginalIndex = isShuffled && shuffledIndices ? shuffledIndices[shuffledIndices.length - 1] : queue.length - 1;
        } else if (isShuffled && shuffledIndices) {
            const currentPositionInShuffle = shuffledIndices.indexOf(currentTrackIndex);
            const prevPositionInShuffle = currentPositionInShuffle - 1;
            if (prevPositionInShuffle >= 0) {
                prevOriginalIndex = shuffledIndices[prevPositionInShuffle];
            } else if (repeatMode === 'all') { // Wrap shuffled if repeat all
                prevOriginalIndex = shuffledIndices[shuffledIndices.length - 1];
            }
            // If start reached & repeat !== 'all', prevOriginalIndex remains null
        } else { // Linear mode
            const prevLinearIndex = currentTrackIndex - 1;
            if (prevLinearIndex >= 0) {
                prevOriginalIndex = prevLinearIndex;
            } else if (repeatMode === 'all') { // Wrap linear if repeat all
                prevOriginalIndex = queue.length - 1;
            }
            // If start reached & repeat !== 'all', prevOriginalIndex remains null
        }

         if (prevOriginalIndex !== null) {
             set({ currentTrackIndex: prevOriginalIndex, isPlaying: true });
         } else {
              // Reached start and not repeating all, stop playback
              set({ isPlaying: false });
         }
      },

      setVolume: (newVolume) => {
        // Ensure volume is between 0 and 1
        const clampedVolume = Math.max(0, Math.min(1, newVolume));
        set({ volume: clampedVolume, isMuted: clampedVolume === 0 });
      },

      // toggleMute removed - component calls setVolume(0) or setVolume(restoreValue)

      toggleRepeat: () => {
        set(state => ({
          repeatMode: state.repeatMode === 'none' ? 'one' : state.repeatMode === 'one' ? 'all' : 'none'
        }));
      },

      toggleShuffle: () => {
        set(state => {
          const willBeShuffled = !state.isShuffled;
          return {
            isShuffled: willBeShuffled,
            shuffledIndices: willBeShuffled ? shuffleArray(state.originalIndices) : null,
          };
        });
      },

      handleTrackEnd: () => {
        const { repeatMode } = get(); // 'repeat one' is handled by <audio loop>
        if (repeatMode === 'all') {
          get().playNext(); // This will wrap around if needed
        } else {
          // If repeatMode is 'none', stop playback
          set({ isPlaying: false });
        }
      },
    }),
    // --- Persistence Configuration ---
    {
      name: 'music-player-settings-v1', // Unique name in localStorage
      partialize: (state) => ({
        // Only persist user settings, not the active queue/playback state
        volume: state.volume,
        isMuted: state.isMuted, // Persist mute state
        repeatMode: state.repeatMode,
        isShuffled: state.isShuffled,
        showPlayer: (state.currentTrackIndex !== null),
        // Optionally persist last played info to restore session later
        // lastPlayedAlbumId: state.currentAlbum?.id,
        // lastPlayedTrackIndex: state.currentTrackIndex,
      }),
      // Optional: Add migration logic if state shape changes later
      // version: 1, migrate: (persistedState, version) => { ... }
    }
  )
)
);

// --- Selector for current track details ---
export const selectCurrentTrack = (state: PlayerState): Track | null => {
  if (state.currentTrackIndex === null || state.queue.length === 0) {
    return null;
  }
  const index = state.currentTrackIndex;
  // Basic boundary check (shouldn't be needed if actions are correct)
  if (index < 0 || index >= state.queue.length) return null;
  return state.queue[index];
};