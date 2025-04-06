// src/pages/AlbumPlaybackView.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; // Import useParams to get URL params, Link for navigation
import TrackList from '../components/TrackList'; // Adjust path if needed
import MusicPlayer from '../components/MusicPlayer'; // Adjust path if needed
import type { Album} from '../types'; // Import types

const AlbumPlaybackView: React.FC<{ albums?: Album[] }> = () => { // Optional prop for initial data if passed from App (not strictly needed with fetch)
  const { albumId } = useParams<{ albumId: string }>(); // Get albumId from URL parameter

  // State for this view
  const [albumData, setAlbumData] = useState<Album | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null); // Index within this album's tracks

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

  const playNextTrack = () => {
    if (albumData && currentTrackIndex !== null) {
      if (currentTrackIndex < albumData.tracks.length - 1) {
        setCurrentTrackIndex(currentTrackIndex + 1);
      } else {
        setCurrentTrackIndex(0); // Wrap around to the first track
      }
    } else if (albumData && albumData.tracks.length > 0) {
        setCurrentTrackIndex(0); // Play first track if nothing was selected
    }
  };

  const playPreviousTrack = () => {
     if (albumData && currentTrackIndex !== null) {
      if (currentTrackIndex > 0) {
        setCurrentTrackIndex(currentTrackIndex - 1);
      } else {
        setCurrentTrackIndex(albumData.tracks.length - 1); // Wrap around to the last track
      }
    } else if (albumData && albumData.tracks.length > 0) {
        setCurrentTrackIndex(albumData.tracks.length - 1); // Play last track if nothing was selected
    }
  };

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
        />
      </div>
    </div>
  );
};

export default AlbumPlaybackView;