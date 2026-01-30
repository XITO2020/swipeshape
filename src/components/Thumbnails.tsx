import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import { searchArticles } from '../lib/supabase';
import { Article } from '../types';

interface ThumbnailProps {
  title: string;
  imageSrc: string;
  description: string;
  link: string;
}

const Thumbnail: React.FC<ThumbnailProps> = ({ title, imageSrc, description, link }) => {
  const summary = description.split(' ').slice(0, 20).join(' ');

  return (
    <div className="rounded-lg shadow-lg bg-white p-6 hover:shadow-xl transition-shadow duration-300 my-[100px]">
      <img src={imageSrc} alt={title} className="w-full h-48 object-cover rounded-lg mb-4" />
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-4">{summary}...</p>
      <a href={link} className="inline-block bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition-colors duration-300 hover:animate-heartbeat">Lire l'article</a>
    </div>
  );
};

const Thumbnails: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const { data, error } = await searchArticles();
        if (error) {
          console.error('Error fetching articles:', error);
          return;
        }
        setArticles(data || []);
      } catch (err) {
        console.error('Error fetching articles:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchArticles();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    swipe: true,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-800"></div>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Aucun article disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-bold text-gradient mb-8 text-center">Nos Articles</h2>
      <div className="w-full">
        <Slider {...settings}>
          {articles.map((article) => (
            <Thumbnail
              key={article.id}
              title={article.title}
              imageSrc={article.image_url || '/assets/images/placeholder.jpg'}
              description={article.content.replace(/<[^>]*>?/gm, '').substring(0, 300)}
              link={`/blog/${article.id}`}
            />
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default Thumbnails;
