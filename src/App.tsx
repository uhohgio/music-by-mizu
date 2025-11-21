// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import DirectoryView from './pages/DirectoryView';
import AlbumPlaybackView from './pages/AlbumPlaybackView';

import './index.css'


function App() {

  return (
      <Routes > {/* Defines the routes */}
        <Route
          path="/" // Root path shows the directory
          element={<DirectoryView />} // Pass data to the directory view
        />
        <Route
          path="/album/:albumId" // Path for a specific album, :albumId is a parameter
          element={<AlbumPlaybackView />} // Pass data to the playback view
        />
      </Routes>
  )
}

export default App