/* src/components/Footer.tsx */
import React from 'react';

const Footer: React.FC = () => {
  // Apply Tailwind classes
  return (
    <footer className="custom-footer p-12 pb-safe-bottom text-center  bg-gray-100 dark:bg-neutral-800 shadow-md flex items-center gap-4 w-full flex-wrap ">
      <a
                href={"https://github.com/uhohgio"}
                className="text-[--color-mizu-dark] hover:text-opacity-80 dark:text-[--color-mizu-light] dark:hover:text-opacity-80 transition-colors duration-200 text-center flex flex-wrap justify-center gap-2 align-middle" // Use themed colors
                aria-label="Creator Github" // Accessibility
              >
                &copy; {new Date().getFullYear()} Mizu Media -
              </a>
    </footer>
  );
};

export default Footer;