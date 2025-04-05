// src/components/Layout.tsx
import React from 'react';
import Header from './Header';
import Footer from './Footer';

// Define props using an interface for type safety
interface LayoutProps {
  children: React.ReactNode; // Allows this component to wrap other components
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-mizu-blue font-sans"> {/* Example Tailwind: Makes footer stick to bottom */}
      <Header />
      <main className="flex-grow container p-4 align-middle mx-12"> {/* Example Tailwind: Centers content, adds padding */}
        {children} {/* This is where page-specific content will render */}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;