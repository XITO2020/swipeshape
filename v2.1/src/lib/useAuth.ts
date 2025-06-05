import { useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { useAppStore } from './store';

// Custom hook for authentication
export function useAuth(redirectTo?: string) {
  const router = useRouter();
  const { isAuthenticated, isAdmin, setAuthState, setUser } = useAppStore();
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      if (redirectTo) {
        router.push(redirectTo);
      }
      return;
    }
    
    // Set default auth header for all requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Fetch current user data
    const fetchUser = async () => {
      try {
        const response = await axios.get('/api/auth');
        setAuthState(true, response.data.user.role === 'admin');
        setUser(response.data.user);
      } catch (error) {
        // If the request fails, clear token and redirect
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setAuthState(false, false);
        setUser(null);
        
        if (redirectTo) {
          router.push(redirectTo);
        }
      }
    };
    
    fetchUser();
  }, []);
  
  return { isAuthenticated, isAdmin };
}

// Function to handle logout
export const logout = async () => {
  try {
    await axios.post('/api/auth', { action: 'logout' });
  } finally {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    window.location.href = '/login';
  }
};

// Axios interceptor to handle 401 responses
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      if (window.location.pathname !== '/login') {
        window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
      }
    }
    return Promise.reject(error);
  }
);
