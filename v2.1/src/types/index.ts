export interface User {
  id: string;
  email: string;
  name?: string;
  fullName?: string;
  imageUrl?: string;
  avatar_url?: string;
  created_at: string;
  role?: string;
  password?: string;
  purchases?: Array<{
    programId: number;
  }>;
}

export interface Program {
  id: number;
  title: string;
  name?: string; // Added for backward compatibility
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
  slug: string;
  image_url?: string;
  tiktok_url?: string;
  instagram_url?: string;
  related_articles?: number[];
}

export interface Comment {
  id: number;
  articleId?: number;
  authorId?: string;
  user_id?: string;
  user_email?: string;
  author?: {
    id: string;
    name?: string;
    email?: string;
    avatar_url?: string;
  };
  content: string;
  rating?: number;
  // Support both naming conventions
  created_at: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  isApproved?: boolean;
  article?: {
    id: number;
    title: string;
    slug?: string;
  };
  // For cases where authorName is directly included
  authorName?: string;
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

export interface Video {
  id: string;
  url: string;
  title: string;
  created_at: string;
  updated_at?: string;
}