// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout' // our layout
import DirectoryView from './pages/DirectoryView';
import AlbumPlaybackView from './pages/AlbumPlaybackView';
import Bio from './components/Bio'
import Contact from './components/Contact';
import './index.css'


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
          element={<DirectoryView />} // Pass data to the directory view
        />
        <Route
          path="/album/:albumId" // Path for a specific album, :albumId is a parameter
          element={<AlbumPlaybackView />} // Pass data to the playback view
        />

        {/* You could add other routes here if needed */}
        {/* e.g., <Route path="/about" element={<Bio />} /> */}

      </Routes>

      <Bio />
      <Contact />
      <hr className='text-white font-bold mt-8 '/>
    </Layout>
    
    
  )
}

export default App