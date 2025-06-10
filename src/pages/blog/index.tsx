import React from 'react';
import BlogPage from '../BlogPage';
// Utilisation de la version SSR-safe pour getServerSideProps
import { ssrGetArticles } from '@/lib/ssr-api';
import { Article } from '@/types';

// Server-side data fetching
export async function getServerSideProps() {
  try {
    // Fetch articles on the server side avec la fonction SSR-safe
    const { data, error } = await ssrGetArticles();
    
    if (error) {
      console.error('Error fetching articles in getServerSideProps:', error);
      return { props: { initialArticles: [] } };
    }
    
    return { props: { initialArticles: data || [] } };
  } catch (err) {
    console.error('Exception in getServerSideProps:', err);
    return { props: { initialArticles: [] } };
  }
}

export default function Blog({ initialArticles = [] }) {
  return <BlogPage initialArticles={initialArticles} />;
}
