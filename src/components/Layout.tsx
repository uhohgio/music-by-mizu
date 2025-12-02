// Layout.tsx (unchanged logic, safe to keep)
"use client";
import React, { useEffect, useState } from "react";
import Header from "./Header";
import MusicPlayer from "./MusicPlayer";
import "/src/styles/layout.css";

const Layout = ({ children }: { children: React.ReactNode }) => {
  // --- Responsive width hook (SSR-safe) ---
  const useViewportWidth = () => {
    const [width, setWidth] = useState(
      typeof window !== "undefined" ? window.innerWidth : 9999
    );

    useEffect(() => {
      const handler = () => setWidth(window.innerWidth);
      window.addEventListener("resize", handler);
      return () => window.removeEventListener("resize", handler);
    }, []);

    return width;
  };

  const width = useViewportWidth();
  const isSmallScreen = width <= 400;

  // --- Theme loading ---
  useEffect(() => {
    const root = document.documentElement;
    const saved = localStorage.getItem("theme");
    const shouldDark =
      saved === "dark" ||
      (!saved &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    root.classList.toggle("dark", shouldDark);
  }, []);

  return (
    <div className="mizu-bg min-h-screen w-full flex flex-col">

      {isSmallScreen ? (
        // --- Blocker message for tiny devices ---
        <div className="flex items-center justify-center flex-1">
          <p className="text-center text-[var(--color-content-dark)] p-4">
            Your screen is too small to use Mizu Media.  
            Please use a device with a larger screen.
          </p>
        </div>
      ) : (
        <>
          {/* HEADER */}
          <Header />

          {/* --- Main content area with proper scroll --- */}
          <div className="relative flex-1 min-h-0 m-[2rem] mt-70 mb-30">

            <main className="overflow-y-auto h-full scroll-smooth custom-scroll pr-2 pb-[120px]">
              {children}
            </main>

            {/* top fade */}
            <div className="pointer-events-none absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-mizu-bg to-transparent z-10" />

            {/* bottom fade */}
            <div className="pointer-events-none absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-mizu-bg to-transparent z-10" />
          </div>

          {/* --- Music Player (sticky on mobile, fixed on desktop) --- */}
          <div className="bottom-0 left-0 right-0 z-50 h-[125px] sticky md:fixed md:bottom-0 ">
            <MusicPlayer />
          </div>
        </>
      )}
    </div>
  );
};

export default Layout;
