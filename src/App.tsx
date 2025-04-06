// src/App.tsx
import React, {useState} from 'react';
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
  // Add more tracks here
];

function App() {
  // We will add our Layout component here soon
  const [tracks, setTracks] = useState<Track[]>(initialTracks);
  const [currentTrackSrc, setCurrentTrackSrc] = useState<string | null>(null); // State for the selected track URL

  // Function to handle track selection from TrackList
  const handleSelectTrack = (audioSrc: string) => {
    console.log("Selected track:", audioSrc); // For debugging
    setCurrentTrackSrc(audioSrc);
  };
  return (
      <Layout >
      {/* This content will be passed as 'children' to Layout */}
      <h1 className="text-4xl font-bold text-center mb-6 align-middle text-gray-100"> {/* Example Tailwind */}
          <i>♫⋆｡♪ ₊˚♬ ﾟ. Music by Mizu ♫⋆｡♪ ₊˚♬ ﾟ.</i>
      </h1>

      <section className=" shadow-lg content-section text-center"> {/* Example reuse */}
          <h2 className="text-2xl font-bold mb-4 text-[var(--color-content-light)] font-title">
            Demos
          </h2>
         <TrackList tracks={tracks} onSelectTrack={handleSelectTrack} />
         <MusicPlayer trackSrc={currentTrackSrc} />
         <p className="text-center text-neutral-600 dark:text-neutral-400">(Music player updates coming soon!)</p>
      </section>

      <Bio /> {/* Add the Bio component here */}
      <Contact />
      <hr className='text-white font-bold mt-8 '/>
    </Layout>
    
    
  )
}

export default App