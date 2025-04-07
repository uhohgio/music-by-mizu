// src/store/playerStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware'; // Import persist middleware
import type { Track, Album } from '../types'; // Assuming types are here

// Helper to shuffle indices (Fisher-Yates)
function shuffleArray<T>(array: T[]): T[] { /* ... (keep shuffle function) ... */ }

interface PlayerState {
  // Queue & Playback State
  currentAlbum: Pick<Album, 'id' | 'title' | 'albumArtSrc'> | null; // Basic info about the loaded album
  queue: Track[]; // The tracks currently loaded (from the current album)
  originalIndices: number[]; // Order before shuffling
  shuffledIndices: number[] | null; // Shuffled order (or null if not shuffled)
  currentTrackIndex: number | null; // Index *within originalIndices*
  isPlaying: boolean;
  // Note: currentTime & duration might stay local to MusicPlayer for performance,
  // unless other components need them frequently. Let's keep them local for now.

  // Settings
  volume: number;
  isMuted: boolean;
  repeatMode: 'none' | 'one' | 'all';
  isShuffled: boolean;

  // Actions
  loadAlbum: (album: Album) => void; // Loads tracks, resets state
  playTrack: (trackIndex: number) => void; // Plays a specific track index from the current queue
  togglePlayPause: (audioIsPlaying: boolean) => void; // Needs actual playing state from audio element
  setIsPlaying: (playing: boolean) => void; // Action to set playing state
  playNext: () => void;
  playPrevious: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleRepeat: () => void;
  toggleShuffle: () => void;
  handleTrackEnd: () => void; // Logic for what happens when a track ends
  // Add other actions as needed: seek, setCurrentTime/Duration (if made global)
}

export const usePlayerStore = create<PlayerState>()(
  persist( // Wrap store definition with persist middleware
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
      repeatMode: 'none',
      isShuffled: false,

      // --- Actions ---
      loadAlbum: (album) => {
          const newOriginalIndices = Array.from(album.tracks.keys());
          set({
              currentAlbum: { id: album.id, title: album.title, albumArtSrc: album.albumArtSrc },
              queue: album.tracks,
              originalIndices: newOriginalIndices,
              currentTrackIndex: null, // Don't autoplay on load, let playTrack handle it
              isPlaying: false,
              isShuffled: false, // Reset shuffle when loading new album
              shuffledIndices: null,
          });
      },
      playTrack: (trackIndex) => {
          const { queue, isShuffled, originalIndices } = get();
          if (trackIndex >= 0 && trackIndex < queue.length) {
              // If shuffle is on, we still set the original index,
              // but playNext/Prev will use the shuffle order.
              set({ currentTrackIndex: trackIndex, isPlaying: true }); // Set isPlaying true to trigger play in player
          }
      },
       // Renamed to avoid conflict with state variable
       togglePlaybackStatus: (audioIsPlaying: boolean) => {
           // This action might be called by the player based on play/pause button clicks
           // OR by the audio element's actual play/pause events.
           // We need a way for the component to trigger play/pause INTENT
           // And another way to SYNC the state based on audio events.
           // Let's rethink this slightly... Player controls call actions like 'requestPlay', 'requestPause'.
           // Audio events call actions like 'syncPlayState(true/false)'.

           // Simpler for now: let togglePlayPause in Player handle audioRef, and just sync state here
            set({ isPlaying: !get().isPlaying }); // Basic toggle action
       },
       setIsPlaying: (playing) => set({ isPlaying: playing }), // Action called by audio events

      playNext: () => {
          const { currentTrackIndex, isShuffled, shuffledIndices, queue, originalIndices, repeatMode } = get();
          if (queue.length === 0) return;

          let nextOriginalIndex: number | null = null;

          if (isShuffled && shuffledIndices) {
              if (currentTrackIndex === null) { // Play first shuffled if nothing playing
                  nextOriginalIndex = shuffledIndices[0];
              } else {
                  const currentPositionInShuffle = shuffledIndices.indexOf(currentTrackIndex);
                  const nextPositionInShuffle = (currentPositionInShuffle + 1);
                  if (nextPositionInShuffle < shuffledIndices.length) {
                      nextOriginalIndex = shuffledIndices[nextPositionInShuffle];
                  } else if (repeatMode === 'all') { // Wrap shuffled only if repeat all
                      nextOriginalIndex = shuffledIndices[0];
                  } else {
                      // Reached end of shuffled list, stop (or handle differently)
                       set({ isPlaying: false }); // Stop playback maybe?
                       return; // Exit early
                  }
              }
          } else { // Linear mode
              if (currentTrackIndex === null) { // Play first linear if nothing playing
                  nextOriginalIndex = 0;
              } else {
                  const nextLinearIndex = currentTrackIndex + 1;
                   if (nextLinearIndex < queue.length) {
                        nextOriginalIndex = nextLinearIndex;
                   } else if (repeatMode === 'all') { // Wrap linear only if repeat all
                       nextOriginalIndex = 0;
                   } else {
                       // Reached end of linear list, stop
                        set({ isPlaying: false });
                        return; // Exit early
                   }
              }
          }

          if (nextOriginalIndex !== null) {
              set({ currentTrackIndex: nextOriginalIndex, isPlaying: true });
          }
      },
      playPrevious: () => {
           const { currentTrackIndex, isShuffled, shuffledIndices, queue, originalIndices, repeatMode } = get();
           if (queue.length === 0) return;

           let prevOriginalIndex: number | null = null;

           if (isShuffled && shuffledIndices) {
               if (currentTrackIndex === null) { // Play last shuffled if nothing playing
                    prevOriginalIndex = shuffledIndices[shuffledIndices.length - 1];
               } else {
                   const currentPositionInShuffle = shuffledIndices.indexOf(currentTrackIndex);
                   const prevPositionInShuffle = (currentPositionInShuffle - 1);
                    if (prevPositionInShuffle >= 0) {
                        prevOriginalIndex = shuffledIndices[prevPositionInShuffle];
                    } else if (repeatMode === 'all') { // Wrap shuffled only if repeat all
                        prevOriginalIndex = shuffledIndices[shuffledIndices.length - 1];
                    } else {
                        // Reached start of shuffled list, stop
                         set({ isPlaying: false });
                         return; // Exit early
                    }
               }
           } else { // Linear mode
               if (currentTrackIndex === null) { // Play last linear if nothing playing
                    prevOriginalIndex = queue.length - 1;
               } else {
                   const prevLinearIndex = currentTrackIndex - 1;
                    if (prevLinearIndex >= 0) {
                        prevOriginalIndex = prevLinearIndex;
                    } else if (repeatMode === 'all') { // Wrap linear only if repeat all
                        prevOriginalIndex = queue.length - 1;
                    } else {
                        // Reached start of linear list, stop
                         set({ isPlaying: false });
                         return; // Exit early
                    }
               }
           }

           if (prevOriginalIndex !== null) {
               set({ currentTrackIndex: prevOriginalIndex, isPlaying: true });
           }
      },
      setVolume: (newVolume) => set({ volume: newVolume, isMuted: newVolume === 0 }),
      toggleMute: () => {
          const { isMuted, volume } = get();
          const currentlyMuted = !isMuted;
          if(currentlyMuted) {
            // We need to store previous volume *before* muting, this logic is tricky in Zustand alone
            // Let's simplify: Mute just sets volume to 0, unmute sets to 1 (or last known non-zero?)
            // Let MusicPlayer handle previousVolumeRef locally for better unmute behavior
             set({ volume: 0, isMuted: true });
          } else {
             set({ volume: 1, isMuted: false }); // Simple unmute to full - enhance later if needed
          }
      },
      toggleRepeat: () => {
          set(state => ({
              repeatMode: state.repeatMode === 'none' ? 'one' : state.repeatMode === 'one' ? 'all' : 'none'
          }));
      },
      toggleShuffle: () => {
          set(state => {
              const willBeShuffled = !state.isShuffled;
              const newShuffledIndices = willBeShuffled
                                        ? shuffleArray(state.originalIndices)
                                        : null;
              return {
                  isShuffled: willBeShuffled,
                  shuffledIndices: newShuffledIndices,
                  // Don't change currentTrackIndex when toggling shuffle
              };
          });
      },
      handleTrackEnd: () => {
          const { repeatMode } = get(); // Don't need 'isShuffled' here as playNext handles it
          if (repeatMode === 'all') {
              get().playNext();
          } else if (repeatMode === 'none') {
              // Stop playback (implicitly handled if 'loop' is false and playNext not called)
              set({ isPlaying: false });
          }
           // If repeatMode === 'one', the 'loop' attribute handles it, state remains playing.
      },
    }),
    // --- Persistence Configuration ---
    {
      name: 'music-player-settings', // unique name for localStorage key
      partialize: (state) => ({
        // Only persist settings, not playback state or queue
        volume: state.volume,
        isMuted: state.isMuted,
        repeatMode: state.repeatMode,
        isShuffled: state.isShuffled,
        // Could persist currentAlbum.id and currentTrackIndex to restore session later
        // currentAlbumId: state.currentAlbum?.id,
        // currentTrackIndex: state.currentTrackIndex,
      }),
    }
  )
);

// --- Selector for current track details ---
// (Useful for MusicPlayer to get all info easily)
export const selectCurrentTrack = (state: PlayerState): Track | null => {
    if (state.currentTrackIndex === null || state.queue.length === 0) {
        return null;
    }
    // Ensure index is valid (though actions should handle this)
    const index = Math.min(state.queue.length - 1, Math.max(0, state.currentTrackIndex));
    return state.queue[index] ?? null;
}