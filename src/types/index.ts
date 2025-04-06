// src/types/index.ts (or at top of App.tsx)
export interface Track {
    id: number;
    title: string;
    artist?: string; // Optional if all tracks are by the same artist
    audioSrc: string; // Path or URL to the audio file
    // Add other optional fields if needed: duration, albumArtSrc, etc.
  }