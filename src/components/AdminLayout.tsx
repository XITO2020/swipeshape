import React, { ReactNode } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Home, ShoppingCart, Users, Package, Settings, LogOut } from 'lucide-react';
import { useAppStore } from '../lib/store';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, title = 'Admin Dashboard' }) => {
  const router = useRouter();
  const { user, logout } = useAppStore();

  // Vérifier si l'utilisateur est connecté et est admin
  React.useEffect(() => {
    if (!user || !user.isAdmin) {
      router.push('/login?redirect=' + router.asPath);
    }
  }, [user, router]);

  // Gérer la déconnexion
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const navItems = [
    { href: '/admin', label: 'Dashboard', icon: <Home size={20} /> },
    { href: '/admin/programs', label: 'Programmes', icon: <Package size={20} /> },
    { href: '/admin/purchases', label: 'Achats', icon: <ShoppingCart size={20} /> },
    { href: '/admin/users', label: 'Utilisateurs', icon: <Users size={20} /> },
    { href: '/admin/settings', label: 'Paramètres', icon: <Settings size={20} /> },
  ];

  const isActive = (href: string) => {
    if (href === '/admin') {
      return router.pathname === '/admin';
    }
    return router.pathname.startsWith(href);
  };

  if (!user || !user.isAdmin) {
    return null; // Ne rien afficher pendant la vérification ou la redirection
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>{title} | SwipeShape Admin</title>
      </Head>

      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-white shadow-md">
          <div className="p-4 border-b">
            <h2 className="text-xl font-semibold text-pink-600">SwipeShape Admin</h2>
          </div>

          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link 
                    href={item.href} 
                    className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                      isActive(item.href)
                        ? 'bg-pink-50 text-pink-600' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <LogOut size={20} className="mr-3" />
              <span>Se déconnecter</span>
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile header */}
          <header className="md:hidden bg-white shadow-sm">
            <div className="px-4 py-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-pink-600">SwipeShape Admin</h2>
              {/* Add mobile menu button here if needed */}
            </div>
          </header>

          {/* Main content area */}
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
