// api/albums.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import path from 'path';
import fs from 'fs/promises'; // Using promises API for async reading
import type { Album } from '../src/types'; // Adjust path if your types are elsewhere

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Construct the path to the data file relative to the project root
    const jsonPath = path.join(process.cwd(), 'data', 'music.json');
    // Read the file asynchronously
    const jsonData = await fs.readFile(jsonPath, 'utf-8');
    // Parse the JSON data
    const musicLibrary: Album[] = JSON.parse(jsonData);

    // For the directory view, often you only need summary data.
    // Map the data to include only what's necessary (id, title, art).
    const albumSummaries = musicLibrary.map(album => ({
      id: album.id,
      title: album.title,
      albumArtSrc: album.albumArtSrc,
      year: album.year, // Include year if needed for display
    }));

    // Set cache headers - cache for 5 mins on CDN, revalidate after 1 day stale
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=86400');
    // Send the summary data
    return res.status(200).json(albumSummaries);

  } catch (error) {
    console.error("Error reading music data:", error);
    // Send an internal server error response
    return res.status(500).json({ message: 'Error loading music library data.' });
  }
}