// api/albums/[albumId].ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import path from 'path';
import fs from 'fs/promises';
import type { Album } from '../../src/types'; // Adjust path relative to this file

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
   // Only allow GET requests
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Get the albumId from the query parameters (e.g., /api/albums/album-1 -> albumId = 'album-1')
  const { albumId } = req.query;

  if (typeof albumId !== 'string') {
      return res.status(400).json({ message: 'Invalid album ID.' });
  }

  try {
    const jsonPath = path.join(process.cwd(), 'data', 'music.json');
    const jsonData = await fs.readFile(jsonPath, 'utf-8');
    const musicLibrary: Album[] = JSON.parse(jsonData);

    // Find the specific album by its ID
    const album = musicLibrary.find(a => a.id === albumId);

    if (album) {
      // Album found, send its full data (including tracks)
      res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=86400');
      return res.status(200).json(album);
    } else {
      // Album not found
      return res.status(404).json({ message: 'Album not found.' });
    }

  } catch (error) {
    console.error(`Error reading data for album ${albumId}:`, error);
    return res.status(500).json({ message: 'Error loading album data.' });
  }
}