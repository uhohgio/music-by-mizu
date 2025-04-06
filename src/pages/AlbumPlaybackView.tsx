// src/pages/AlbumPlaybackView.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom'; // Import useParams to get URL params, Link for navigation
import TrackList from '../components/TrackList'; // Adjust path if needed
import MusicPlayer from '../components/MusicPlayer'; // Adjust path if needed
import type { Album} from '../types'; // Import types


// --- Fisher-Yates Shuffle Algorithm ---
function shuffleArray<T>(array: T[]): T[] {
    let currentIndex = array.length, randomIndex;
    const newArray = [...array]; // Clone array
    // While there remain elements to shuffle.
    while (currentIndex !== 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        // And swap it with the current element.
        [newArray[currentIndex], newArray[randomIndex]] = [
        newArray[randomIndex], newArray[currentIndex]];
    }
    return newArray;
}

const AlbumPlaybackView: React.FC<{ albums?: Album[] }> = () => { // Optional prop for initial data if passed from App (not strictly needed with fetch)
  const { albumId } = useParams<{ albumId: string }>(); // Get albumId from URL parameter

  // State for this view
  const [albumData, setAlbumData] = useState<Album | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null); // Index within this album's tracks
  const [repeatMode, setRepeatMode] = useState<'none' | 'one' | 'all'>('none'); // repeat mode state

  // shuffle state
  const [isShuffled, setIsShuffled] = useState<boolean>(false);
  // Store the original indices: [0, 1, 2, ...]
  const originalIndices = useMemo(() =>
      albumData ? Array.from(albumData.tracks.keys()) : [],
      [albumData]
  );

  const [shuffledIndices, setShuffledIndices] = useState<number[]>(originalIndices);


  // --- Effect to Update Shuffled List ---
  useEffect(() => {
    if (isShuffled && albumData) {
         // Generate new shuffled order, ensuring current track is first if possible? Or just random. Let's do random.
        setShuffledIndices(shuffleArray(originalIndices));
        // We don't change currentTrackIndex here, just the order we'll navigate in
    } else {
        // If shuffle turned off or album changes, revert to original order
        setShuffledIndices(originalIndices);
    }
}, [isShuffled, originalIndices, albumData]); // Rerun when shuffle toggles or album changes


  // Effect to fetch album data when albumId changes
  useEffect(() => {
    if (!albumId) {
      setError("No album ID specified.");
      setIsLoading(false);
      return;
    }

    const fetchAlbumData = async () => {
      setIsLoading(true);
      setError(null);
      setAlbumData(null); // Clear previous album data
      setCurrentTrackIndex(null); // Reset track index
      try {
        const response = await fetch(`/api/albums/${albumId}`); // Fetch specific album
        if (!response.ok) {
            if(response.status === 404) {
                 throw new Error(`Album with ID "${albumId}" not found.`);
            }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Album = await response.json();
        setAlbumData(data);
      } catch (e: any) {
        console.error(`Failed to fetch album ${albumId}:`, e);
        setError(e.message || 'Failed to load album data.');
      } finally {
        setIsLoading(false);
      }
      
    };
    
    fetchAlbumData();
    setIsShuffled(false);
  }, [albumId]); // Re-run effect if albumId changes

  // --- Playback State & Handlers (Scoped to this album) ---

  const currentTrack = albumData && currentTrackIndex !== null ? albumData.tracks[currentTrackIndex] : null;
  const currentTrackSrc = currentTrack?.audioSrc ?? null;
  const currentAlbumArtSrc = albumData?.albumArtSrc ?? null; // Use album art, could override with track specific art if available
  const currentTrackTitle = currentTrack?.title ?? '';

  const handleSelectTrack = (audioSrc: string) => {
    const trackIndex = albumData?.tracks.findIndex(track => track.audioSrc === audioSrc) ?? -1;
    if (trackIndex !== -1) {
      setCurrentTrackIndex(trackIndex);
    }
  };

   
   const playNextTrack = useCallback(() => {
    if (!albumData || albumData.tracks.length === 0) return;
    if (currentTrackIndex === null) { // Nothing playing, start from 0 (or shuffled 0)
        const startIndex = isShuffled ? shuffledIndices[0] : 0;
        setCurrentTrackIndex(startIndex);
        return;
    }

    let nextIndex: number;
    if (isShuffled) {
        const currentPositionInShuffle = shuffledIndices.indexOf(currentTrackIndex);
        const nextPositionInShuffle = (currentPositionInShuffle + 1) % shuffledIndices.length; // Wrap around shuffle list
        nextIndex = shuffledIndices[nextPositionInShuffle];
    } else {
        // Linear mode (with wrap around)
        nextIndex = (currentTrackIndex + 1) % albumData.tracks.length;
    }
    setCurrentTrackIndex(nextIndex);

}, [albumData, currentTrackIndex, isShuffled, shuffledIndices]);

const playPreviousTrack = useCallback(() => {
    if (!albumData || albumData.tracks.length === 0) return;
    if (currentTrackIndex === null) { // Nothing playing, start from end (or shuffled end)
         const endIndex = isShuffled ? shuffledIndices[shuffledIndices.length - 1] : albumData.tracks.length - 1;
         setCurrentTrackIndex(endIndex);
         return;
    }

   let prevIndex: number;
   if (isShuffled) {
        const currentPositionInShuffle = shuffledIndices.indexOf(currentTrackIndex);
        const prevPositionInShuffle = (currentPositionInShuffle - 1 + shuffledIndices.length) % shuffledIndices.length; // Wrap around shuffle list backwards
        prevIndex = shuffledIndices[prevPositionInShuffle];
   } else {
        // Linear mode (with wrap around)
        prevIndex = (currentTrackIndex - 1 + albumData.tracks.length) % albumData.tracks.length;
   }
   setCurrentTrackIndex(prevIndex);

}, [albumData, currentTrackIndex, isShuffled, shuffledIndices]);

 // toggles shuffle
    const toggleShuffle = useCallback(() => {
        setIsShuffled(prev => !prev);
    }, []);

  // toggles repeat mode ---
  const toggleRepeatMode = useCallback(() => {
    setRepeatMode(prevMode => {
      if (prevMode === 'none') return 'one';
      if (prevMode === 'one') return 'all';
      return 'none'; // Cycle back to 'none' from 'all'
    });
  }, []); // No dependencies needed

   // --- Handler for when a track ends (to be passed to MusicPlayer) ---
   const handleTrackEnd = useCallback(() => {
    if (repeatMode === 'one') {
       // The 'loop' attribute handles this in MusicPlayer - but we might need to ensure state consistency? No, loop is fine.
       // But maybe we need to call play() again if browser stops it? Test this.
       // Let's rely on loop for now.
    } else if (repeatMode === 'all' || (repeatMode === 'none' && !isShuffled)) { // Play next if repeat all, or if repeat none and not shuffled? Or only if repeat all? Let's only do it for 'all'.
       playNextTrack();
    } else if (repeatMode === 'none' && isShuffled) {
        // If shuffle is on and repeat is off, play next shuffled track? Or stop? Let's play next shuffled.
        playNextTrack();
    }
    // If repeatMode is 'none' and shuffle is off, it will stop naturally.
}, [repeatMode, isShuffled, playNextTrack]); // Added isShuffled


  // Calculate flags based on the current album's tracks
  const hasPrevious = albumData ? (currentTrackIndex !== null && currentTrackIndex > 0) || (currentTrackIndex === 0 && albumData.tracks.length > 1) : false; // Enable if wrapping
  const hasNext = albumData ? (currentTrackIndex !== null && currentTrackIndex < albumData.tracks.length - 1) || (currentTrackIndex === albumData.tracks.length - 1 && albumData.tracks.length > 1) : false; // Enable if wrapping


  // --- Render Logic ---

  if (isLoading) {
    return <div className="text-center p-10">Loading album...</div>;
  }

  if (error) {
    return (
        <div className="text-center p-10">
            <p className="text-red-500 mb-4">{error}</p>
            <Link to="/" className="text-mizu-dark dark:text-mizu-light hover:underline">Back to Directory</Link>
        </div>
    );
  }

  if (!albumData) {
    // Should be caught by error state usually, but added as safeguard
    return <div className="text-center p-10">Album data could not be loaded.</div>;
  }

  // Data loaded successfully
  return (
    <div className="p-4">
      <div className="mb-6">
        <Link to="/" className="text-sm text-[var(--color-content-light)]  hover:underline">
          &larr; Back to Directory
        </Link>
      </div>

      {/* Album Header Info */}
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-6 content-section py-4"> {/* Reusing .content-section for bg/shadow */}
          <div className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 bg-gray-300 dark:bg-neutral-600 rounded overflow-hidden flex items-center justify-center">
               {albumData.albumArtSrc ? (
                   <img src={albumData.albumArtSrc} alt={`Cover for ${albumData.title}`} className="w-full h-full object-cover"/>
                ) : (
                    <span className="text-4xl text-gray-500 dark:text-neutral-400">🎵</span>
                )}
           </div>
           <div>
                <h1 className="text-3xl md:text-4xl font-bold font-title text-neutral-900 dark:text-neutral-100">{albumData.title}</h1>
                {albumData.year && <p className="text-lg text-neutral-600 dark:text-neutral-400">{albumData.year}</p>}
                {albumData.description && <p className="mt-2 text-neutral-700 dark:text-neutral-300">{albumData.description}</p>}
           </div>
      </div>


      {/* Track List and Player */}
      <div className="content-section"> {/* Wrap list and player */}
        <h2 className="text-2xl font-bold mb-4 text-neutral-900 dark:text-neutral-100 font-title">Tracks</h2>
        <TrackList
          tracks={albumData.tracks}
          onSelectTrack={handleSelectTrack}
          currentTrackSrc={currentTrackSrc} // For highlighting
        />
        <MusicPlayer
          trackSrc={currentTrackSrc}
          trackTitle={currentTrackTitle}
          albumArtSrc={currentAlbumArtSrc} // Using album art for all tracks here
          onPlayNext={playNextTrack}
          onPlayPrevious={playPreviousTrack}
          hasNext={hasNext}
          hasPrevious={hasPrevious}
          repeatMode={repeatMode}
          onToggleRepeat={toggleRepeatMode}
          onTrackEnd={handleTrackEnd} // Pass the end handler
          isShuffled={isShuffled}
          onToggleShuffle={toggleShuffle}
        />
      </div>
    </div>
  );
};

export default AlbumPlaybackView;