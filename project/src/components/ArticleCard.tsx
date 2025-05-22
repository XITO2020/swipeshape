import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User } from 'lucide-react';
import { Article } from '../types';

interface ArticleCardProps {
  article: Article;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-transform hover:scale-105">
      {article.image_url && (
        <div className="h-48 overflow-hidden">
          <img 
            src={article.image_url} 
            alt={article.title} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-5">
        <h3 className="text-xl font-bold text-purple-800 mb-2">{article.title}</h3>
        
        <div className="flex items-center text-gray-500 text-sm mb-3">
          <div className="flex items-center mr-4">
            <User size={14} className="mr-1" />
            <span>{article.author}</span>
          </div>
          <div className="flex items-center">
            <Calendar size={14} className="mr-1" />
            <span>{formatDate(article.created_at)}</span>
          </div>
        </div>
        
        <div 
          className="text-gray-600 mb-4 line-clamp-3"
          dangerouslySetInnerHTML={{ 
            __html: article.content.substring(0, 150) + '...' 
          }}
        />
        
        <Link 
          to={`/blog/${article.id}`}
          className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium hover:bg-purple-200 transition-colors"
        >
          En savoir plus !
        </Link>
      </div>
    </div>
  );
};

export default ArticleCard;