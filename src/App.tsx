// src/App.tsx
import {useState} from 'react';
import Layout from './components/Layout' // our layout
import Bio from './components/Bio'
import Contact from './components/Contact';
import TrackList from './components/TrackList'; 
import MusicPlayer from './components/MusicPlayer'; 
import './index.css'
import type { Track } from './types';

const initialTracks: Track[] = [
  { id: 1, title: 'mizu!', audioSrc: 'src/assets/audio_srcs/mizu! (demo 5).wav' },
  { id: 2, title: 'neko!', audioSrc: 'src/assets/audio_srcs/neko!.wav' },
  { id: 3, title: 'vibes', audioSrc: 'src/assets/audio_srcs/vibes_demo_1.wav' },
  { id: 4, title: 'nathan', audioSrc: 'src/assets/audio_srcs/NATHAN GAME MAIN 1.mp3' },
  { id: 5, title: 'snow', audioSrc: 'src/assets/audio_srcs/freshstaticsnowshelterlive.mp3' },
  { id: 6, title: 'nostalgia', audioSrc: 'src/assets/audio_srcs/NOSTALGIA 2.mp3' },
  { id: 7, title: 'bouncin', audioSrc: 'src/assets/audio_srcs/BOUNCIN 2.mp3', albumArtSrc: 'src/assets/mizu-trees.jpg' },
  // Add more tracks here
];

function App() {
  // We will add our Layout component here soon
  const [tracks] = useState<Track[]>(initialTracks);

  // --- State Change: Store index instead of src ---
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);

  // --- Derive currentTrackSrc from index ---
  const currentTrackSrc = currentTrackIndex !== null ? tracks[currentTrackIndex]?.audioSrc : null;

  // --- Derive currrent track data --- 
  const currentTrack = currentTrackIndex !== null ? tracks[currentTrackIndex] : null;
  const currentAlbumArtSrc = currentTrack?.albumArtSrc ?? null; // Get art source
  const currentTrackTitle = currentTrack?.title ?? ''; // Get title for alt text
 

  // Function to handle track selection from TrackList
  const handleSelectTrack = (audioSrc: string) => {
    const trackIndex = tracks.findIndex(track => track.audioSrc === audioSrc);
    if (trackIndex !== -1) {
      console.log("Selected track index:", trackIndex, " Src:", audioSrc);
      setCurrentTrackIndex(trackIndex);
    } else {
        console.warn("Selected track not found in list:", audioSrc);
        setCurrentTrackIndex(null); // Or handle differently
    }
  };

  // --- Handler for playing the next track ---
  const playNextTrack = () => {
    if (currentTrackIndex === null) {
        // If nothing is playing, play the first track (optional)
        if (tracks.length > 0) setCurrentTrackIndex(0);
    } else if (currentTrackIndex < tracks.length - 1) {
        // Play next track if not the last one
        setCurrentTrackIndex(currentTrackIndex + 1);
    }
    // Optional: Implement wrap-around to first track
    else { setCurrentTrackIndex(0); }
  };

  // --- Handler for playing the previous track ---
  const playPreviousTrack = () => {
    if (currentTrackIndex === null) {
        // If nothing is playing, play the last track (optional)
        if (tracks.length > 0) setCurrentTrackIndex(tracks.length - 1);
    } else if (currentTrackIndex > 0) {
        // Play previous track if not the first one
        setCurrentTrackIndex(currentTrackIndex - 1);
    }
    // Optional: Implement wrap-around to last track
    else { setCurrentTrackIndex(tracks.length - 1); }
  };

  // --- Calculate flags for disabling buttons ---
  const hasPrevious = currentTrackIndex !== null 
  const hasNext = currentTrackIndex !== null 
  // If implementing wrap-around, these might always be true if tracks exist

  return (
      <Layout >
      {/* This content will be passed as 'children' to Layout */}
      <h1 className="text-4xl font-bold text-center mb-6 align-middle text-gray-100"> {/* Example Tailwind */}
          <i>♫⋆｡♪ ₊˚♬ ﾟ. Music by Mizu ♫⋆｡♪ ₊˚♬ ﾟ.</i>
      </h1>
      {/* Music Section */}
      <section className=" shadow-lg content-section text-center"> {/* Example reuse */}
          <h2 className="text-2xl font-bold mb-4 text-[var(--color-content-light)] font-title">
          🎧 Demos 🎧
          </h2>
         <TrackList 
         tracks={tracks} 
         onSelectTrack={handleSelectTrack}
         currentTrackSrc={currentTrackSrc} // Pass down the currently playing track src
          />
         {/* Pass handlers and flags to MusicPlayer */}
         <MusicPlayer
             trackSrc={currentTrackSrc}
             trackTitle={currentTrackTitle} // Pass title
             albumArtSrc={currentAlbumArtSrc} // Pass art source
             onPlayNext={playNextTrack}
             onPlayPrevious={playPreviousTrack}
             hasNext={hasNext}
             hasPrevious={hasPrevious}
           />
      </section>

      <Bio /> {/* Add the Bio component here */}
      <Contact />
      <hr className='text-white font-bold mt-8 '/>
    </Layout>
    
    
  )
}

export default App