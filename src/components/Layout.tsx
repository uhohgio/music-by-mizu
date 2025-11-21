// Layout.tsx (unchanged logic, safe to keep)
"use client";
import React, { useEffect } from "react";
import Header from "./Header";
import MusicPlayer from "./MusicPlayer";
import "/src/styles/layout.css";

const Layout = ({ children }: { children: React.ReactNode }) => {

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
    <div className="mizu-bg fixed inset-0 overflow-hidden">
      <div className="flex flex-col h-screen font-sans main-info">
        <Header />

        <div className="relative flex-grow m-[2rem] mt-60 overflow-hidden mb-30">
          <main className="h-full overflow-y-auto scroll-smooth custom-scroll pr-2 bg-gradient-to-t from-mizu-bg to-transparent">
            {children}
          </main>

          <div className="pointer-events-none absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-mizu-bg to-transparent z-10" />
          <div className="pointer-events-none absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-mizu-bg to-transparent z-10 pb-5" />
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-50 h-[100px]">
          <MusicPlayer /> {/* This is still a footer when music isn't playing */}
        </div>
      </div>
    </div>
  );
};

export default Layout;