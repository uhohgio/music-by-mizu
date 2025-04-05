// src/components/Header.tsx
import React from 'react';

const Header: React.FC = () => {
  // Apply Tailwind classes for basic styling
  return (
    // <header className="bg-gray-500 text-gray-50 p-4 align-middle text-center"> {/* Example Tailwind */}
    <header className="cloud-header  text-gray-800 text-center p-3">
      <nav>
        {/* Navigation links will go here */}
        {/* <h1 className="text-2xl font-bold text-center align-text-bottom">Music By Mizu</h1> */}
      </nav>
    </header>
  );
};

export default Header;