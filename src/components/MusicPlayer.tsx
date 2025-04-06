// src/components/MusicPlayer.tsx
import React, { useRef, useEffect } from 'react';

interface MusicPlayerProps {
  trackSrc: string | null; // URL of the track to play, or null if none selected
}

const MusicPlayer: React.FC<MusicPlayerProps> = ({ trackSrc }) => {
  const audioRef = useRef<HTMLAudioElement>(null); // Ref to access the audio element

  // Effect to load new track when trackSrc changes
  useEffect(() => {
    if (trackSrc && audioRef.current) {
      audioRef.current.src = trackSrc;
      // Optionally auto-play (might be blocked by browser policies)
      // audioRef.current.play().catch(e => console.error("Autoplay prevented:", e));
      // Or just load it:
       audioRef.current.load(); // Load the new source
    }
  }, [trackSrc]); // Re-run effect when trackSrc changes


  if (!trackSrc) {
    // Optionally render nothing or a placeholder if no track is selected
    return <div className="mt-4 text-center text-neutral-500 dark:text-neutral-400">Select a track to play</div>;
  }

  return (
    <div className="mt-4"> {/* Add some margin */}
      {/* Basic HTML5 audio player */}
      <audio ref={audioRef} controls className="w-full"> {/* 'controls' shows browser default controls */}
        Your browser does not support the audio element.
        {/* Source tag is set dynamically via the useEffect hook */}
      </audio>
      {/* We will likely replace 'controls' with custom React controls later */}
    </div>
  );
};

export default MusicPlayer;