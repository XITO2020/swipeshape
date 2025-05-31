import { motion } from "framer-motion";

export default function VideoBanner() {
  return (
    <section className="relative h-[70vh] w-full overflow-hidden rounded-2xl shadow-lg">
      <video
        autoPlay
        loop
        muted
        className="absolute top-0 left-0 h-full w-full object-cover"
      >
        <source src="/videos/banner.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
        <motion.h1
          className="text-white text-4xl md:text-6xl font-bold text-center px-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          Bienvenue sur Swipeshape
        </motion.h1>
      </div>
    </section>
  );
}
