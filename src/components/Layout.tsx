// src/components/Layout.tsx
import React from 'react';
import Header from './Header';
import Footer from './Footer';
// import MusicPlayer from './MusicPlayer'; // Import the player here
// import { usePlayerStore } from '../store/playerStore'; // Import the store hook

// Define props using an interface for type safety
interface LayoutProps {
  children: React.ReactNode; // Allows this component to wrap other components
}

// On page load or when changing themes, best to add inline in `head` to avoid FOUC
document.documentElement.classList.toggle(
  "dark",
  localStorage.theme === "dark" ||
    (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches),
);
// Whenever the user explicitly chooses light mode
localStorage.theme = "light";
// Whenever the user explicitly chooses dark mode
localStorage.theme = "dark";
// Whenever the user explicitly chooses to respect the OS preference
localStorage.removeItem("theme");

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    // Try this:
<div className="flex flex-col min-h-screen bg-mizu-light mizu-bg font-sans mr-auto ml-auto">
      <Header />
      <main className="flex-grow container p-4 align-middle mx-10 mr-auto ml-auto"> 
        {children} {/* This is where page-specific content will render */}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;