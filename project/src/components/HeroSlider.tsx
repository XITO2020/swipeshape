import React, { useState } from 'react';
import Slider from 'react-slick';
import { Link } from 'react-router-dom';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const HeroSlider: React.FC = () => {
  const [hoveredSlide, setHoveredSlide] = useState<number | null>(null);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 6000,
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false
        }
      }
    ]
  };

  const slides = [
    {
      id: 1,
      title: "   9 Mois pour changer toutes les parties de ton corps !",
      subtitle: "Obtiens le physique LEAN et tonique dont toutes ont toujours rêvé",
      image: "./public/assets/images/usabox.jpg",
      buttonText: "Lire les détails"
    },
    {
      id: 2,
      title: "  Programme Pré-estival !",
      subtitle: "Sois BEACH-READY avec notre solution Intensive 10-weeks !",
      image: "./public/assets/images/pinas1.jpg",
      link: "/programs/summer-body",
      buttonText: "Checker le programme"
    },
    {
      id: 3,
      title: "   Cardio-training | Weight lifter | CrossFit... Que choisir ? ",
      subtitle: "Etudiez selon votre morphologie le domaine d'entrainement qui vous convient le mieux",
      image: "./public/assets/images/mangadarkgym.jpg",
      link: "/blog/strength-and-confidence",
      buttonText: "Avoir un aperçu"
    },
    {
      id: 4,
      title: "  En confiance grâce à ton confort intérieur ! ",
      subtitle: "Développez vos muscles et renforcez votre confiance en vous avec notre GUIDE de musculation",
      image: "./public/assets/images/teas.jpg",
      link: "/shop/teas",
      buttonText: "En savoir plus !"
    },
    
    {
      id: 5,
      title: "Le gainage debout, ça fonctionne ? ",
      subtitle: "Apprends les rudiments du gainage au quotidien avec 12 postures",
      image: "./public/assets/images/greyblue.jpg",
      link: "/blog/gainage?1",
      buttonText: "Découvrir"
    },
    {
    id: 6,
    title: "L'aliment détox de la semaine ",
    subtitle: "Best prépa et meilleurs moments pour consommer le citron",
    image: "./public/assets/images/greenlimes.jpg",
    link: "/blog/aliments?1",
    buttonText: "Etudier le sujet"
  }
  ];

  return (
    <div className="relative pb-32 bg-white">
      <Slider {...settings}>
        {slides.map((slide, index) => (
          <div 
            key={slide.id} 
            className="relative h-[70vh] md:h-[80vh]"
            onMouseEnter={() => setHoveredSlide(index)}
            onMouseLeave={() => setHoveredSlide(null)}
          >
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div 
                className={`absolute inset-0 bg-gradient-to-r from-stone-00 via-yellow-00 to-violet-300 transition-opacity duration-500 ease-in-out ${
                  hoveredSlide === index ? 'opacity-60' : 'opacity-20'
                }`}
              ></div>
            </div>
            <div className="relative h-full flex flex-col justify-center items-center text-center px-6 md:px-16">
              <h2 className="text-3xl md:text-5xl max-w-[70%] mx-auto font-bold text-white mb-4 transition-transform duration-500 ease-out transform hover:scale-105">
                {slide.title}
              </h2>
              <p className="text-lg md:text-xl text-white mb-8 max-w-2xl">
                {slide.subtitle}
              </p>
              <Link 
                to={slide.link || '#'}
                className="px-8 py-3 bg-stone-200 text-slate-700 rounded-full font-medium hover:bg-stone-400 hover:text-slate-200 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
              >
                {slide.buttonText}
              </Link>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default HeroSlider;