// src/components/Contact.tsx
import React from 'react';
// Optional: Import an icon library if you want icons
import { FaEnvelope, FaSpotify, FaSoundcloud, FaInstagram } from 'react-icons/fa'; // Example using react-icons

const Contact: React.FC = () => {
  // Define your links (can be moved to props later)
  const email = 'mailto:erikts777@icloud.com'; // Use mailto: for email links
  const spotifyUrl = 'https://open.spotify.com/artist/1e7K8jD3wRuQfnwDAOeGqe?si=dqcw1rXoQhOIBYnSf_WYUA';
  const soundcloudUrl = 'https://soundcloud.com/madeon';
  const instagramUrl = "https://www.instagram.com/shimizuerik?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==";
  // Add other links as needed (Bandcamp, YouTube, etc.)

  return (
    <section className="content-section shadow-md"> {/* Use consistent styling with Bio */}
      <h2 className="text-2xl font-bold mb-4 text-[var(--color-content-light)] font-title text-center"> {/* Use themed font */}
      ─⋆⋅☆ Connect & Listen ⋆─
      </h2>
      <div className="flex flex-wrap justify-center gap-4"> {/* Flexbox for layout */}
        {/* Email Link */}
        <a
          href={email}
          className="text-[--color-mizu-dark] hover:text-opacity-80 dark:text-[--color-mizu-blue] dark:hover:text-opacity-80 transition-colors duration-200" // Use themed colors
          aria-label="Email Mizu" // Accessibility
        >
          {/* Option 1: Text */}
          {/* Email */}
          {/* Option 2: Icon (requires installing react-icons: npm install react-icons) */}
          {/* <span className="text-3xl">✉︎</span> Placeholder Emoji Icon */}
          <FaEnvelope size={30} className="text-[var(--color-content-light)]" />
        </a>

        {/* Spotify Link */}
        <a
          href={spotifyUrl}
          target="_blank" // Open in new tab
          rel="noopener noreferrer" // Security for target="_blank"
          className="text-[--color-mizu-dark] hover:text-opacity-80 dark:text-[--color-mizu-blue] dark:hover:text-opacity-80 transition-colors duration-200"
          aria-label="Listen on Spotify"
        >
           {/* <span className="text-3xl">🎧</span> Placeholder */}
           <FaSpotify size={30} className="text-[var(--color-content-light)]"/>
        </a>

        {/* SoundCloud Link */}
        <a
          href={soundcloudUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[--color-mizu-dark] hover:text-opacity-80 dark:text-[--color-mizu-blue] dark:hover:text-opacity-80 transition-colors duration-200"
          aria-label="Listen on SoundCloud"
        >
           {/* <span className="text-3xl">☁️</span> Placeholder */}
           <FaSoundcloud size={30} className="text-[var(--color-content-light)]"/>
        </a>

         {/* Instagram Link */}
         <a
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[--color-mizu-dark] hover:text-opacity-80 dark:text-[--color-mizu-blue] dark:hover:text-opacity-80 transition-colors duration-200"
          aria-label="Follow on Instagram"
        >
           {/* <span className="text-3xl">📸</span> Placeholder */}
           <FaInstagram size={30} className="text-[var(--color-content-light)]"/>
        </a>

        {/* Add more links similarly */}

      </div>
    </section>
  );
};

export default Contact;