// src/pages/AlbumPlaybackView.tsx
import React, { useState, useEffect } from 'react'; // Removed useCallback, useMemo as handlers are gone
import { useParams, Link } from 'react-router-dom';
import TrackList from '../components/TrackList';
import { usePlayerStore, selectCurrentTrack } from '../store/playerStore'; // Import store hook AND selector
import type { Album} from '../types';

const AlbumPlaybackView: React.FC<{ albums?: Album[] }> = () => {
  const { albumId } = useParams<{ albumId: string }>();

  // --- Local State for Fetched Data ---
  const [albumData, setAlbumData] = useState<Album | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // --- Removed local currentTrackIndex ---

  // --- Get Actions & State from Store ---
  const loadAlbumToPlayer = usePlayerStore((state) => state.loadAlbum);
  const playTrack = usePlayerStore((state) => state.playTrack);
  const currentAlbumIdInStore = usePlayerStore((state) => state.currentAlbum?.id);
  // Get the currently playing track's source from the store for highlighting
  const currentlyPlayingSrc = usePlayerStore((state) => selectCurrentTrack(state)?.audioSrc ?? null);

  // --- Effect to fetch album data ---
  useEffect(() => {
    if (!albumId) {
      setError("No album ID specified.");
      setIsLoading(false);
      return;
    }
    const fetchAlbumData = async () => {
      setIsLoading(true);
      setError(null);
      setAlbumData(null);
      try {
        const response = await fetch(`/music.json`); // Adjusted to fetch full music.json
        if (!response.ok) throw new Error(`HTTP error ${response.status}`);
        const albums: Album[] = await response.json();
        const album = albums.find(a => a.id === albumId);

        if (!album) throw new Error(`Album with ID "${albumId}" not found.`);
      
        setAlbumData(album); // Set local data for displaying album info/tracklist

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        console.error(`Failed to fetch album ${albumId}:`, e);
        setError(e.message || 'Failed to load album data.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchAlbumData();
  }, [albumId]); // Dependencies

  // --- Track Selection Handler ---
  const handleSelectTrack = (audioSrc: string) => {
    // Find the index within the locally fetched albumData
    const trackIndex = albumData?.tracks.findIndex(track => track.audioSrc === audioSrc) ?? -1;
    if (trackIndex !== -1 && albumData) {
      // If the album currently in view isn't the one loaded in the store, load it first.
      // This ensures the store's queue matches the list the user clicked from.
      if (currentAlbumIdInStore !== albumId) {
        console.log(`AlbumPlaybackView: Stale store album detected on track select. Reloading album ${albumId} before playing.`);
        loadAlbumToPlayer(albumData);
      }
      // Tell the store to play the track at the found index within its current queue
      console.log(`AlbumPlaybackView: Calling playTrack action with index: ${trackIndex}`);
      playTrack(trackIndex);
    } else {
      console.error("AlbumPlaybackView: Could not find selected track index locally for src:", audioSrc);
    }
  };

  // --- Render Logic ---
  if (isLoading) {
    return <div className="text-sm text-[var(--color-content-dark)] flex justify-center items-center">Loading album...</div>;
  } 
  
  if (error) { 
    console.error("Error Occurred: ", error);
    return <div className="text-sm text-[var(--color-content-dark)] flex justify-center items-center">Error: No album data could be loaded.</div>; 
  }

  if (!albumData) {
    // Return message or null if data is unexpectedly missing after loading and no error
    console.error("AlbumPlaybackView Render: No album data found after load!");
    return <div className="text-sm text-[var(--color-content-dark)] flex justify-center items-center">Album data unavailable.</div>;
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <Link to="/" className="text-sm text-[var(--color-content-dark)]  hover:underline">
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

      {/* Track List */}
      <div className="content-section">
        <h2 className="text-2xl font-bold mb-4 text-neutral-800 dark:text-neutral-100 font-title">Tracks</h2>
        <TrackList
          tracks={albumData.tracks} // Use locally fetched tracks for display
          onSelectTrack={handleSelectTrack} // Use the updated handler
          currentTrackSrc={currentlyPlayingSrc} // Use value from global store for highlighting
        />
        {/* MusicPlayer is NOT rendered here anymore */}
      </div>
    </div>
  );
};

export default AlbumPlaybackView;