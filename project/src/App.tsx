import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn, SignIn, SignUp } from '@clerk/clerk-react';

// Components
import Sidebar from './components/SideBar';
import Header from './components/Header';
import Footer from './components/Footer';

// Pages
import HomePage from './pages/HomePage';
import BlogPage from './pages/BlogPage';
import ArticlePage from './pages/ArticlePage';
import ProgramsPage from './pages/ProgramsPage';
import ProgramDetailPage from './pages/ProgramDetailPage';
import CartPage from './pages/CartPage';
import AdminPage from './pages/AdminPage';
import ThankYouPage from './pages/ThankYouPage';
import ProfilePage from './pages/ProfilePage';
import AdminNewsletterPage from './pages/AdminNewsletterPage';
import AdminArticlesPage from './pages/AdminArticlesPage';
import EventsPage from './pages/EventsPage';
import ContactPage from './pages/ContactPage';

const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="bg-violet-300 bg-opacity-10">
    <Router>
      <div className="min-h-screen bg-transparent">
      <div className="z-3">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        
        {/* Main content */}
        <div className="flex flex-col min-h-screen lg:ml-64">
          {/* Header */}
          <Header setIsSidebarOpen={setIsSidebarOpen} />
          
          {/* Page content */}
          <div className="flex-grow">
            <Routes>
              <Route path="/" element={<HomePage useVideoHero={true} />} />
              <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
              <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/blog/:id" element={<ArticlePage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/programs" element={<ProgramsPage />} />
              <Route path="/programs/:id" element={<ProgramDetailPage />} />
              <Route path="/admin/newsletter" element={<AdminNewsletterPage />} />
              <Route path="/admin/articles" element={<AdminArticlesPage />} />
              
              {/* Protected Routes */}
              <Route
                path="/cart"
                element={
                  <>
                    <SignedIn>
                      <CartPage />
                    </SignedIn>
                    <SignedOut>
                      <RedirectToSignIn />
                    </SignedOut>
                  </>
                }
              />
              
              <Route
                path="/profile"
                element={
                  <>
                    <SignedIn>
                      <ProfilePage />
                    </SignedIn>
                    <SignedOut>
                      <RedirectToSignIn />
                    </SignedOut>
                  </>
                }
              />

              <Route path="/admin" element={<AdminPage />} />
              <Route path="/thank-you" element={<ThankYouPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
          </div>              
          {/* Footer */}
          <div className="z-3">
            <Footer />
          </div>
        </div>
      </div>
    </Router>
    </div>
  );
};

export default App;