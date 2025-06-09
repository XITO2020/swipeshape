import React from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

const HeroVideo: React.FC = () => {
  const scrollToContent = () => {
    const contentSection = document.getElementById('main-content');
    if (contentSection) {
      contentSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source
          src="/assets/videos/tapis.mp4"
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>

      {/* Overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-violet-900/30" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-white px-4 top-[35%]">
        {/* <h1 className="text-4xl md:text-6xl font-bold text-center mb-6 text-transparent bg-clip-text bg-gradient-to-r from-violet-200 to-white">
          Transformez Votre Corps,<br />
          Transformez Votre Vie
        </h1> */}
        <p className="text-xl md:text-2xl text-center mb-12 max-w-2xl text-violet-100">
          Laquelle de ces qualités résumerait le mieux vos objectifs fitness ?
        </p>
        <div className="flex items-center justify-between gap-4 mx-auto w-[80%] mx-auto mb-[64px]">
        <Link
          href="/programs"
          className="buttonny text-center group relative inline-flex items-center justify-center w-[192px] py-4 font-semibold text-gray-500 transition-all duration-300 ease-in-out rounded-full bg-yellow-100 hover:bg-cyan-200 hover:text-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
        >
          <span className="absolute inset-0 w-full h-full rounded-full opacity-50 filter blur-sm bg-gradient-to-br from-stone-200 to-pink-100"></span>
          <span className="absolute inset-0 w-full h-full transition-all duration-200 ease-in-out rounded-full opacity-0 group-hover:opacity-25 group-active:opacity-0 bg-gradient-to-b from-white/20 to-transparent"></span>
          <span className="relative text-sm hover:text-md transition-all duration-300 ease-in-out font-svelte text-buttonny">Svelte</span>
        </Link>
        <Link
          href="/programs"
          className="buttonny text-center group relative inline-flex items-center justify-center w-[192px] py-4 font-semibold text-gray-500 transition-all duration-300 ease-in-out rounded-full bg-pink-200 hover:bg-amber-300 hover:text-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
        >
          <span className="absolute inset-0 w-full h-full rounded-full opacity-50 filter blur-sm bg-gradient-to-br from-stone-200 to-pink-100"></span>
          <span className="absolute inset-0 w-full h-full transition-all duration-200 ease-in-out rounded-full opacity-0 group-hover:opacity-25 group-active:opacity-0 bg-gradient-to-b from-white/20 to-transparent"></span>
          <span className="relative text-sm hover:text-md transition-all duration-300 ease-in-out font-agile text-buttonny">Agile</span>
        </Link>
        <Link
          href="/programs"
          className="buttonny text-center group relative inline-flex items-center justify-center w-[192px] py-4 font-semibold text-gray-500 transition-all duration-300 ease-in-out rounded-full bg-violet-200 hover:bg-emerald-300 hover:text-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
        >
          <span className="absolute inset-0 w-full h-full rounded-full opacity-50 filter blur-sm bg-gradient-to-br from-stone-200 to-pink-100"></span>
          <span className="absolute inset-0 w-full h-full transition-all duration-200 ease-in-out rounded-full opacity-0 group-hover:opacity-25 group-active:opacity-0 bg-gradient-to-b from-white/20 to-transparent"></span>
          <span className="relative text-sm hover:text-md transition-all duration-300 ease-in-out font-tonic text-buttonny">Tonic !</span>
        </Link>
        </div>

        {/* Scroll Button */}
        <button
          onClick={scrollToContent}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce p-4 rounded-full transition-colors duration-300 hover:text-violet-400 group"
          aria-label="Scroll to content"
        >
          <div className="absolute inset-0 rounded-full opacity-25 group-hover:opacity-50 filter blur-sm bg-violet-500 transition-opacity duration-300"></div>
          <ChevronDown size={32} className="relative z-10" />
        </button>
      </div>
    </div>
  );
};

export default HeroVideo;
