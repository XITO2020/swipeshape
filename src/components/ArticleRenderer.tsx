import React from 'react';

type Props = {
  content: string;
};

const ArticleRenderer: React.FC<Props> = ({ content }) => {
  return (
    <div
      className="prose prose-lg max-w-none text-gray-800"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default ArticleRenderer;
