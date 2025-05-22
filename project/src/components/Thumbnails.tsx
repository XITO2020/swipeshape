import React, { useState, useEffect } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './Thumbnails.css';
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
    <div className="thumbnail my-[100px]">
      <img src={imageSrc} alt={title} className="thumbnail-image" />
      <h3 className="thumbnail-title">{title}</h3>
      <p className="thumbnail-summary">{summary}...</p>
      <a href={link} className="thumbnail-link hover:animate-heartbeat">Lire l'article</a>
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
    <div className="thumbnails-container max-w-2xl mx-auto px-4">
      <h2 className="text-3xl font-bold text-gradient mb-8 text-center">Nos Articles</h2>
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
  );
};

export default Thumbnails;
