// src/components/TrackList.tsx
import React from 'react';
import type { Track } from '../types'; // Adjust path if needed

interface TrackListProps {
  tracks: Track[];
  onSelectTrack: (audioSrc: string) => void; // Function prop to notify parent
  currentTrackSrc: string | null; // Add prop to receive current track
}

const TrackList: React.FC<TrackListProps> = ({ tracks, onSelectTrack, currentTrackSrc }) => {

  return (
    <ul className="space-y-2"> {/* Adds vertical space between list items */}
      {tracks.map((track) => {
        const isActive = track.audioSrc === currentTrackSrc;
        return (
            <li
            key={track.id}
            onClick={() => onSelectTrack(track.audioSrc)} // Call parent function on click
            className={`${isActive
                    ? 'bg-mizu-light dark:bg-mizu-dark text-white dark:text-neutral-900 font-semibold' // Active styles
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-600' // Inactive styles
                } `}
            
            // Style list items
            >
                <span className={` ${isActive ? 'font-bold text-(--color-content-light)' : 'font-semibold text-(--color-content-light)'}`}> {/* Adjusts text color based on active state */}
                {track.title} 
                </span>
            </li>
            );
        })}
    </ul>
  );
};

export default TrackList;