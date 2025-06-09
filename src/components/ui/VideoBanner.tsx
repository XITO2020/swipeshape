import React from "react";

interface VideoBannerProps {
  src: string;          // Source URL of the video
  poster?: string;      // Optional poster image
  className?: string;   // Optional additional classes
  title?: string;       // Optional title text
  subtitle?: string;    // Optional subtitle text
}

export const VideoBanner = ({ src, poster, className, title, subtitle }: VideoBannerProps) => {
  return (
    <div className={`relative overflow-hidden ${className || "w-full h-[400px] rounded-2xl shadow-md"}`}>
      <video
        autoPlay
        muted
        loop
        poster={poster}
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {(title || subtitle) && (
        <div className="relative z-10 p-6 bg-black/40 text-white h-full flex flex-col justify-center items-start">
          {title && <h1 className="text-4xl font-bold">{title}</h1>}
          {subtitle && <p className="mt-2 text-lg">{subtitle}</p>}
        </div>
      )}
    </div>
  );
};

// Add default export for easier imports
export default VideoBanner;