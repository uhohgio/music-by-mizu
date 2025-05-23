// src/components/Bio.tsx
import React from 'react';

const Bio: React.FC = () => {
  return (
    <section className="content-section shadow-lg text-center"> {/* Example Tailwind v4 utilities */}
      <h2 className="text-2xl font-bold mb-4 text-[var(--color-content-light)] dark:text-[var(--color-content-dark)]">
     ˖ ࣪𓂃 About Mizu 𓂃 ࣪˖ {/* Or your boyfriend's artist name */}
      </h2>
      <p className="text-[var(--color-content-light)] dark:text-[var(--color-content-dark)] leading-relaxed">
        {/* Add the actual bio text here. You can hardcode it for now,
            or we could pass it as a prop later if needed. */}
        A rising pop artist from San Diego, CA. "You'll have bad times, but it'll always wake you up to the good stuff you weren't paying attention to." - Sean, Good Will Hunting 1997 
      </p>
      {/* You could add an image here too if desired */}
      {/* <img src="/path/to/artist-image.jpg" alt="Artist Name" className="mt-4 rounded" /> */}
    </section>
  );
};

export default Bio;