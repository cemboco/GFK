import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Sparkles, Info, Mail, LogIn, LogOut, Menu, X as XIcon, User as UserIcon, HelpCircle, BarChart3 } from 'lucide-react';

// Typ für User (kann ggf. noch angepasst werden, je nach Supabase-User-Objekt)
interface User {
  id: string;
  [key: string]: any;
}

interface HeaderProps {
  user: User | null;
  handleSignOut: () => void;
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

const navItems = [
    { id: 'home', label: 'GFK Transform', icon: Sparkles, path: '/home' },
    { id: 'ueber', label: 'Über GFK', icon: Info, path: '/ueber' },
    { id: 'kontakt', label: 'Kontakt', icon: Mail, path: '/kontakt' },
    { id: 'faq', label: 'FAQ', icon: HelpCircle, path: '/faq' },
];

const userNavItems = [
    { id: 'statistiken', label: 'Statistiken', icon: BarChart3, path: '/statistiken' },
];

const Header: React.FC<HeaderProps> = (props: HeaderProps) => {
  const {
    user,
    handleSignOut,
    isMobileMenuOpen,
    setIsMobileMenuOpen
  } = props;

  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white/80 backdrop-blur-xl shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-[80px] h-[80px] rounded-xl overflow-hidden flex items-center justify-center">
                <img src="/logo.png" alt="GFKCoach Logo" className="w-[80px] h-[80px] object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  GFKCoach
                </h1>
                <span className="text-xs text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                  Beta
                </span>
              </div>
            </Link>
          </motion.div>
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleNavigation(item.path)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                  isActive(item.path)
                    ? 'bg-purple-100 text-purple-700 shadow-sm'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </motion.button>
            ))}
            {user && userNavItems.map((item) => (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleNavigation(item.path)}
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2 ${
                  isActive(item.path)
                    ? 'bg-purple-100 text-purple-700 shadow-sm'
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </motion.button>
            ))}
            {user ? (
              <div className="flex items-center space-x-2 ml-4">
                <Link
                  to="/profile"
                  className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                    isActive('/profile') 
                    ? 'bg-purple-100 text-purple-700 shadow-sm' 
                    : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  Profil
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center px-4 py-2 rounded-xl font-medium transition-all duration-200 text-gray-600 hover:text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Abmelden
                </button>
              </div>
            ) : (
              <Link
                to="/auth"
                className="ml-4 flex items-center px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <LogIn className="h-4 w-4 mr-2" />
                Anmelden
              </Link>
            )}
          </div>
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-colors"
          >
            {isMobileMenuOpen ? <XIcon className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 space-y-2 border-t border-gray-100 pt-4"
            >
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              ))}
              {user && userNavItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleNavigation(item.path)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              ))}
              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                        isActive('/profile')
                        ? 'bg-purple-100 text-purple-700'
                        : 'text-gray-600 hover:text-purple-600 hover:bg-purple-50'
                    }`}
                  >
                    <UserIcon className="h-5 w-5" />
                    <span>Profil</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Abmelden</span>
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full flex items-center space-x-3 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium"
                >
                  <LogIn className="h-5 w-5" />
                  <span>Anmelden</span>
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header; 