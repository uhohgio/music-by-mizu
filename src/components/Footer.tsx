// src/components/Footer.tsx
import React from 'react';
// import { FaGithub } from 'react-icons/fa';

const Footer: React.FC = () => {
  // Apply Tailwind classes
  return (
    // <footer className="bg-gray-500 text-gray-50 p-4 mt-8 text-center"> {/* Example Tailwind */}
    <footer className="custom-footer mt-8 p-4">
      {/* <p>&copy; {new Date().getFullYear()} Mizu Media - </p> */}
      <a
                href={"https://github.com/uhohgio"}
                className="text-[--color-mizu-dark] hover:text-opacity-80 dark:text-[--color-mizu-blue] dark:hover:text-opacity-80 transition-colors duration-200 text-center flex flex-wrap justify-center gap-2 align-middle" // Use themed colors
                aria-label="Creator Github" // Accessibility
              >
                &copy; {new Date().getFullYear()} Mizu Media -
                {/* <FaGithub  size={20} className="text-[var(--color-content-light)]" /> */}
              </a>
    </footer>
  );
};

export default Footer;