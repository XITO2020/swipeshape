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

/**
 * Interface pour les réponses API standard
 */
export interface ApiResponse<T = any> {
  data: T | null;
  error: any | null;
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
  user_email: string; // Making this required as it's used in the component
  avatar_url?: string; // Added at root level for Supabase data structure
  author?: {
    id: string;
    name?: string;
    email?: string;
    avatar_url?: string;
  };
  content: string;
  rating: number; // Making this required as it's used for star rendering
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

export interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Test {
  id: number;
  title: string;
  description: string;
  duration_minutes: number;
  created_at: string;
  updated_at?: string;
  passing_score?: number;
  max_score?: number;
  questions?: TestQuestion[];
}

export interface TestQuestion {
  id: number;
  test_id: number;
  question_text: string;
  options: string[];
  correct_option: number;
  points: number;
  created_at: string;
  updated_at?: string;
}

export interface UserTestResult {
  id: number;
  user_id: string;
  test_id: number;
  score: number;
  completed_at: string;
  created_at: string;
  is_passed: boolean;
  answers?: {
    question_id: number;
    selected_option: number;
    is_correct: boolean;
  }[];
}