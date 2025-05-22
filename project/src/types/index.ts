export interface User {
  id: string;
  email: string;
  fullName?: string;
  imageUrl?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Program {
  id: number;
  title: string;
  description: string;
  price: number;
  image_url: string;
  pdf_url: string;
  created_at: string;
}

export interface Article {
  id: number;
  title: string;
  content: string;
  author: string;
  created_at: string;
  updated_at: string;
  image_url?: string;
  tiktok_url?: string;
  instagram_url?: string;
  related_articles?: number[];
}

export interface Comment {
  id: number;
  user_id: string;
  user_email: string;
  content: string;
  rating: number;
  created_at: string;
  avatar_url?: string;
}

export interface Newsletter {
  id: number;
  email: string;
  created_at: string;
}

export interface PurchaseHistory {
  programId: number;
  purchaseDate: string;
  status: 'completed' | 'refunded';
}