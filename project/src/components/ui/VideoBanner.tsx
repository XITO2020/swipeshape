interface VideoBannerProps {
    title: string
    subtitle?: string
    videoUrl: string
  }
  
  export const VideoBanner = ({ title, subtitle, videoUrl }: VideoBannerProps) => {
    return (
      <div className="relative w-full h-[400px] overflow-hidden rounded-2xl shadow-md">
        <video
          autoPlay
          muted
          loop
          className="absolute top-0 left-0 w-full h-full object-cover"
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="relative z-10 p-6 bg-black/40 text-white h-full flex flex-col justify-center items-start">
          <h1 className="text-4xl font-bold">{title}</h1>
          {subtitle && <p className="mt-2 text-lg">{subtitle}</p>}
        </div>
      </div>
    )
  }
  