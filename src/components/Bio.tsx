// src/components/Bio.tsx
import React from 'react';
import aboutData from "../content/about.json"; // Import the JSON data

const Bio: React.FC = () => {
  return (
    <section className="content-section shadow-lg text-center">
      <h2 className="text-2xl font-bold mb-4 text-(--color-content-light)">
     ˖ ࣪𓂃 About Mizu 𓂃 ࣪˖ 
      </h2>
      <p className="text-(--color-content-light) leading-relaxed">
        {aboutData.bio}
        {/** hardcoded alternative: */}
        {/* A rising pop artist from San Diego, CA. "You'll have bad times, but it'll always wake you up to the good stuff you weren't paying attention to." - Sean, Good Will Hunting 1997 */}
      </p>
    </section>
  );
};

export default Bio;