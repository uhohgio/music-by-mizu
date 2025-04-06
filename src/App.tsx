// src/App.tsx
// import {useState} from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout' // our layout
import DirectoryView from './pages/DirectoryView';
import AlbumPlaybackView from './pages/AlbumPlaybackView';
import Bio from './components/Bio'
import Contact from './components/Contact';
// import TrackList from './components/TrackList'; 
// import MusicPlayer from './components/MusicPlayer'; 
import './index.css'
import type { Album } from './types';


const musicLibrary: Album[] = [
  {
    "id": "covers",
    "title": "covers",
    "year": 2025,
    "albumArtSrc": "src/assets/mizu-trees.jpg",
    "tracks": [
      { "id": 1, "title": "snow", "audioSrc": "src/assets/audio_srcs/freshstaticsnowshelterlive.mp3" },
      { "id": 2, "title": "instagram", "audioSrc": "src/assets/audio_srcs/instagram (guitar cover).wav" },
      { "id": 3, "title": "fireflies", "audioSrc": "src/assets/audio_srcs/fireflies.mp3" },
      { "id": 4, "title": "sad machine", "audioSrc": "src/assets/audio_srcs/SAD MACHINE PORTER SAMPLE.mp3" }

    ]
  },
  {
    "id": "vibes",
    "title": "vibes",
    "year": 2025,
    "albumArtSrc": "src/assets/mizu-trees.jpg",
    "tracks": [
      { "id": 5, "title": "neko", "audioSrc": "src/assets/audio_srcs/neko!.wav" },
      { "id": 6, "title": "vibes", "audioSrc": "src/assets/audio_srcs/vibes_demo_1.wav"},
      { "id": 7, "title": "nostalgia", "audioSrc": "src/assets/audio_srcs/NOSTALGIA 2.mp3" },
      { "id": 8, "title": "mizu", "audioSrc": "src/assets/audio_srcs/mizu! (demo 5).wav"},
      { "id": 9, "title": "nathan", "audioSrc": "src/assets/audio_srcs/NATHAN GAME MAIN 1.mp3"}
    ]
  },
  {
      "id": "bouncin-ep",
      "title": "bouncin",
      "year": 2025,
      "albumArtSrc": "src/assets/mizu-trees.jpg",
      "tracks": [
        { "id": 10, "title": "bouncin", "audioSrc": "src/assets/audio_srcs/BOUNCIN 2.mp3" },
        { "id": 11, "title": "bouncin-guitar ISO", "audioSrc": "src/assets/audio_srcs/BOUNCIN Guitar ISO.mp3"}
      ]
    }
];

function App() {

  return (
      <Layout >
      {/* This content will be passed as 'children' to Layout */}
      <h1 className="text-4xl font-bold text-center mb-6 align-middle text-gray-100"> {/* Example Tailwind */}
          <i>♫⋆｡♪ ₊˚♬ ﾟ. Music by Mizu ♫⋆｡♪ ₊˚♬ ﾟ.</i>
      </h1>
      {/* Music Section */}
      <Routes> {/* Defines the routes */}
        <Route
          path="/" // Root path shows the directory
          element={<DirectoryView albums={musicLibrary} />} // Pass data to the directory view
        />
        <Route
          path="/album/:albumId" // Path for a specific album, :albumId is a parameter
          element={<AlbumPlaybackView albums={musicLibrary} />} // Pass data to the playback view
        />

        {/* You could add other routes here if needed */}
        {/* e.g., <Route path="/about" element={<Bio />} /> */}

      </Routes>

      <Bio /> {/* Add the Bio component here */}
      <Contact />
      <hr className='text-white font-bold mt-8 '/>
    </Layout>
    
    
  )
}

export default App