// src/components/Header.tsx

// Just the clouds, maybe more later
import React from 'react';

const Header: React.FC = () => {
  return (
    <a href="/" >
    <img
      src="/mizuHeader.png"
      alt="Mizu Header"
      className="fixed top-0 left-1/2 transform -translate-x-1/2 min-h-[330px] w-full max-w-[1150px]  object-cover object-center mt-[-100px]"
      style={{
        filter: "brightness(1.4) saturate(60%) opacity(0.75)",
        zIndex: 5,
      }}

    />
    </a>
  );
};

export default Header;