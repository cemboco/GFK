import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Sparkles, Info, Mail, LogIn, LogOut, Menu, X as XIcon, User as UserIcon, HelpCircle, Heart } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from './LanguageSelector';

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

const Header: React.FC<HeaderProps> = (props: HeaderProps) => {
  const {
    user,
    handleSignOut,
    isMobileMenuOpen,
    setIsMobileMenuOpen
  } = props;

  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { id: 'home', label: t.nav.home, icon: Sparkles, path: '/home' },
    { id: 'ueber', label: t.nav.about, icon: Info, path: '/ueber' },
    { id: 'kontakt', label: t.nav.contact, icon: Mail, path: '/kontakt' },
    { id: 'faq', label: t.nav.faq, icon: HelpCircle, path: '/faq' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-10 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
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
          </div>
          
          <div className="hidden md:flex space-x-1 items-center">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.path)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                  isActive(item.path)
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </button>
            ))}
            
            {/* Language Selector */}
            <div className="ml-4 pl-4 border-l border-gray-200">
              <LanguageSelector />
            </div>
            
            {/* Auth Buttons */}
            <div className="ml-4 pl-4 border-l border-gray-200">
              {user ? (
                <div className="flex items-center space-x-3">
                  <Link
                    to="/profile"
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                      isActive('/profile')
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    👤 {user.email?.split('@')[0] || t.nav.profile}
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    {t.nav.logout}
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
                >
                  {t.nav.login}
                </Link>
              )}
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              {isMobileMenuOpen ? <XIcon className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-gray-100 pt-4 pb-4"
            >
              <div className="space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.path)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
                      isActive(item.path)
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                ))}
                
                {/* Mobile Language Selector */}
                <div className="px-4 py-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Sprache / Language</span>
                    <LanguageSelector />
                  </div>
                </div>
                
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all ${
                        isActive('/profile')
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <UserIcon className="h-5 w-5" />
                      <span>{t.nav.profile}</span>
                    </Link>
                    <button
                      onClick={() => {
                        handleSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-5 w-5" />
                      <span>{t.nav.logout}</span>
                    </button>
                  </>
                ) : (
                  <Link
                    to="/auth"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full flex items-center space-x-3 px-4 py-3 bg-purple-600 text-white rounded-lg font-medium"
                  >
                    <LogIn className="h-5 w-5" />
                    <span>{t.nav.login}</span>
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Header; 