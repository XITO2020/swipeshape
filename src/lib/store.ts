import { create } from 'zustand';
import { Program, Article, User } from '../types';

interface AppState {
  // Authentication
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: User | null;
  setAuthState: (isAuthenticated: boolean, isAdmin: boolean) => void;
  setUser: (user: User | null) => void;
  updateUserAvatar: (avatarUrl: string) => void;

  // Programs
  programs: Program[];
  setPrograms: (programs: Program[]) => void;
  
  // Articles
  articles: Article[];
  setArticles: (articles: Article[]) => void;
  
  // Cart
  cart: Program[];
  addToCart: (program: Program) => void;
  removeFromCart: (programId: number) => void;
  clearCart: () => void;
  
  // User Preferences
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  
  // Purchase History
  purchasedPrograms: number[];
  setPurchasedPrograms: (programIds: number[]) => void;
  addPurchasedProgram: (programId: number) => void;
  hasPurchased: (programId: number) => boolean;
  
  // Comment Permissions
  canComment: boolean;
  setCanComment: (canComment: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Authentication
  isAuthenticated: false,
  isAdmin: false,
  user: null,
  setAuthState: (isAuthenticated, isAdmin) => set({ isAuthenticated, isAdmin }),
  setUser: (user) => set({ user }),
  updateUserAvatar: (avatarUrl) => set((state) => ({
    user: state.user ? { ...state.user, avatarUrl } : state.user
  })),
  
  // Programs
  programs: [],
  setPrograms: (programs) => set({ programs }),
  
  // Articles
  articles: [],
  setArticles: (articles) => set({ articles }),
  
  // Cart
  cart: [],
  addToCart: (program) => set((state) => ({
    cart: state.cart.some(item => item.id === program.id)
      ? state.cart
      : [...state.cart, program]
  })),
  removeFromCart: (programId) => set((state) => ({
    cart: state.cart.filter(item => item.id !== programId)
  })),
  clearCart: () => set({ cart: [] }),
  
  // User Preferences
  theme: 'light',
  setTheme: (theme) => set({ theme }),
  
  // Purchase History
  purchasedPrograms: [],
  setPurchasedPrograms: (programIds) => set({ purchasedPrograms: programIds }),
  addPurchasedProgram: (programId) => set((state) => ({
    purchasedPrograms: [...state.purchasedPrograms, programId]
  })),
  hasPurchased: (programId) => get().purchasedPrograms.includes(programId),
  
  // Comment Permissions
  canComment: false,
  setCanComment: (canComment) => set({ canComment })
}));

// Persist cart to localStorage
if (typeof window !== 'undefined') {
  const savedCart = localStorage.getItem('cart');
  if (savedCart) {
    useAppStore.setState({ cart: JSON.parse(savedCart) });
  }
  
  useAppStore.subscribe((state) => {
    localStorage.setItem('cart', JSON.stringify(state.cart));
  });
}

// Persist theme preference
if (typeof window !== 'undefined') {
  const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
  if (savedTheme) {
    useAppStore.setState({ theme: savedTheme });
  }
  
  useAppStore.subscribe((state) => {
    localStorage.setItem('theme', state.theme);
  });
}