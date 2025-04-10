// src/pages/DirectoryView.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // For navigation links
import type { Album } from '../types'; // Import Album type (summary version if defined)

// Define a type for the summary data we expect from the API
interface AlbumSummary {
    id: string;
    title: string;
    albumArtSrc?: string;
    year?: number;
}

const DirectoryView: React.FC<{ albums?: Album[] }> = () => { // Optional prop for initial data if needed later
  const [albums, setAlbums] = useState<AlbumSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch album summaries when component mounts
    const fetchAlbums = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/albums'); // Fetch from our API endpoint
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: AlbumSummary[] = await response.json();
        setAlbums(data);
      } catch (e: any) {
        console.error("Failed to fetch albums:", e);
        setError('Failed to load music library. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAlbums();
  }, []); // Empty dependency array means this runs once on mount

  if (isLoading) {
    // You can replace this with a nicer loading spinner component
    return <div className="text-center p-10 text-[var(--color-element-light)] tracking-widest">Loading music library...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">{error}</div>;
  }

  if (albums.length === 0) {
      return <div className="text-center p-10 text-[var(--color-element-light)] tracking-widest">No albums found.</div>;
  }

  return (
    <div className="p-4 mr-auto ml-auto">
      <h1 className="text-3xl font-bold mb-6 text-center font-title text-neutral-100 tracking-wider ">
      ˗ˏˋ directory ˎˊ˗
      </h1>
      {/* Grid layout for albums */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 mr-auto ml-auto">
        {albums.map((album) => (
          <Link
            key={album.id}
            to={`/album/${album.id}`} // Link to the specific album's playback view
            className="block group content-section p-0 overflow-hidden transform hover:scale-105 transition-transform duration-200" // Reuse content-section, remove padding, add hover
          >
            {/* Album Art */}
            <div className="aspect-square bg-[var(--color-content-light)] flex items-center justify-center">
              {album.albumArtSrc ? (
                <img src={album.albumArtSrc} alt={`Cover for ${album.title}`} className="w-full h-full object-cover"/>
              ) : (
                 <span className="text-9xl text-[var(--color-element-light)] dark:text-[var(--color-element-dark)]">🎵</span> // Placeholder
              )}
            </div>
            {/* Album Info */}
            <div className="p-3 text-[var(--color-element-light)]">
               <h3 className="font-semibold truncate font-title text-[var(--color-content-light)] dark:text-[var(--color-content-dark)] group-hover:text-mizu-dark dark:group-hover:text-mizu-light" title={album.title}>
                  {album.title}
                </h3>
               {album.year && <p className="text-sm text-neutral-600 dark:text-neutral-400">{album.year}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DirectoryView;