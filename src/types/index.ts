// src/types/index.ts (or at top of App.tsx)
export interface Track {
    id: number;
    title: string;
    artist?: string; // Optional if all tracks are by the same artist
    audioSrc: string; // Path or URL to the audio file
    albumArtSrc?: string; // optional field
  }

  export interface Album { // Or Project, EP, etc.
    id: string; // Use a unique string ID (e.g., 'album-1', 'project-alpha')
    title: string;
    year?: number;
    description?: string;
    albumArtSrc?: string; // Art for the whole album/project
    tracks: Track[]; // Array of tracks belonging to this album
  }