// src/components/TrackList.tsx
import React from 'react';
import type { Track } from '../types'; // Adjust path if needed

interface TrackListProps {
  tracks: Track[];
  onSelectTrack: (audioSrc: string) => void; // Function prop to notify parent
}

const TrackList: React.FC<TrackListProps> = ({ tracks, onSelectTrack }) => {
  return (
    <ul className="space-y-2"> {/* Adds vertical space between list items */}
      {tracks.map((track) => (
        <li
          key={track.id}
          onClick={() => onSelectTrack(track.audioSrc)} // Call parent function on click
          className="p-3 shadow-md rounded cursor-pointer hover:bg-mizu-light dark:hover:bg-mizu-dark transition-colors duration-150" // Style list items
        >
          <span className="font-semibold text-[var(--color-content-light)]">
            {track.title}
          </span>
          {/* Optional: Add artist, duration, etc. */}
          {/* {track.artist && <span className="text-sm text-gray-600 dark:text-gray-400"> - {track.artist}</span>} */}
        </li>
      ))}
    </ul>
  );
};

export default TrackList;