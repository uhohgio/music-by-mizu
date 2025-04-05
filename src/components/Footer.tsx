// src/components/Footer.tsx
import React from 'react';

const Footer: React.FC = () => {
  // Apply Tailwind classes
  return (
    // <footer className="bg-gray-500 text-gray-50 p-4 mt-8 text-center"> {/* Example Tailwind */}
    <footer className="custom-footer mt-8 p-4">
      <p>&copy; {new Date().getFullYear()} Mizu Media - </p>
    </footer>
  );
};

export default Footer;