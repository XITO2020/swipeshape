// src/components/Hero.tsx
import React from "react";
import VideoBanner from "@/components/ui/VideoBanner";

export default function Hero() {
  return (
    <div className="relative w-full h-[60vh] mb-12">
      <VideoBanner
        src="/assets/videos/banner.mp4"
        poster="/assets/images/hero-poster.jpg"
        className="absolute inset-0"
      />
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white bg-black bg-opacity-50">
        <h1 className="text-4xl font-bold mb-4">Bienvenue chez Swipeshape</h1>
        <p className="text-lg">Votre plateforme de coaching sportif en ligne</p>
      </div>
    </div>
  );
}
