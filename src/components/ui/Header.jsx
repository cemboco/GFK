import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [remainingTransformations, setRemainingTransformations] = useState(3);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleAuthToggle = () => {
    setIsAuthenticated(!isAuthenticated);
    if (!isAuthenticated) {
      setRemainingTransformations(999);
    } else {
      setRemainingTransformations(3);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setRemainingTransformations(3);
    setIsUserMenuOpen(false);
    navigate('/dashboard-home-screen');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-surface-200 shadow-warm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center cursor-pointer transition-transform duration-150 hover:scale-105"
            onClick={() => handleNavigation('/dashboard-home-screen')}
          >
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Icon name="MessageCircle" size={20} color="white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-semibold text-text-primary">NVC Coach</h1>
                <p className="text-xs text-text-secondary -mt-1">Empathische Kommunikation</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => handleNavigation('/dashboard-home-screen')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-h-touch ${
                location.pathname === '/dashboard-home-screen' ?'bg-primary-50 text-primary border border-primary-100' :'text-text-secondary hover:text-text-primary hover:bg-surface-100'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Icon name="Home" size={16} />
                <span>Transformieren</span>
              </div>
            </button>
            
            <button
              onClick={() => handleNavigation('/nvc-transformation-results-screen')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-h-touch ${
                location.pathname === '/nvc-transformation-results-screen'
                  ? 'bg-primary-50 text-primary border border-primary-100' :'text-text-secondary hover:text-text-primary hover:bg-surface-100'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Icon name="FileText" size={16} />
                <span>Ergebnisse</span>
              </div>
            </button>
            
            <button
              onClick={() => handleNavigation('/ai-coach-chat-screen')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-h-touch ${
                location.pathname === '/ai-coach-chat-screen' ?'bg-primary-50 text-primary border border-primary-100' :'text-text-secondary hover:text-text-primary hover:bg-surface-100'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Icon name="Bot" size={16} />
                <span>Coach</span>
              </div>
            </button>
            
            {isAuthenticated && (
              <button
                onClick={() => handleNavigation('/message-history-screen')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-h-touch ${
                  location.pathname === '/message-history-screen' ?'bg-primary-50 text-primary border border-primary-100' :'text-text-secondary hover:text-text-primary hover:bg-surface-100'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon name="History" size={16} />
                  <span>Verlauf</span>
                </div>
              </button>
            )}
            
            <button
              onClick={() => handleNavigation('/contact-feedback-screen')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 min-h-touch ${
                location.pathname === '/contact-feedback-screen' ?'bg-primary-50 text-primary border border-primary-100' :'text-text-secondary hover:text-text-primary hover:bg-surface-100'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Icon name="Mail" size={16} />
                <span>Kontakt</span>
              </div>
            </button>
          </nav>

          {/* Right Side - Authentication Badge & User Menu */}
          <div className="flex items-center space-x-4">
            {/* Authentication Badge */}
            <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-surface rounded-lg border border-surface-200">
              <div className={`w-2 h-2 rounded-full ${isAuthenticated ? 'bg-success' : 'bg-warning'}`}></div>
              <span className="text-sm font-mono text-text-secondary">
                {isAuthenticated ? 'Unlimited' : `${remainingTransformations} übrig`}
              </span>
            </div>

            {/* Mobile Authentication Badge */}
            <div className="sm:hidden relative group">
              <div className={`w-3 h-3 rounded-full ${isAuthenticated ? 'bg-success' : 'bg-warning'} cursor-pointer`}></div>
              <div className="absolute right-0 top-6 bg-text-primary text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                {isAuthenticated ? 'Unlimited' : `${remainingTransformations} übrig`}
              </div>
            </div>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg hover:bg-surface-100 transition-all duration-200 min-h-touch min-w-touch"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center">
                  <Icon name="User" size={16} color="white" />
                </div>
                <Icon name="ChevronDown" size={16} className={`hidden sm:block transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* User Menu Dropdown */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-warm-lg border border-surface-200 py-2 z-50">
                  <div className="px-4 py-2 border-b border-surface-200">
                    <p className="text-sm font-medium text-text-primary">
                      {isAuthenticated ? 'Angemeldet' : 'Gast'}
                    </p>
                    <p className="text-xs text-text-secondary">
                      {isAuthenticated ? 'Premium Zugang' : 'Testmodus'}
                    </p>
                  </div>
                  
                  {!isAuthenticated ? (
                    <>
                      <button
                        onClick={handleAuthToggle}
                        className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-surface-100 transition-colors duration-200 flex items-center space-x-2"
                      >
                        <Icon name="LogIn" size={16} />
                        <span>Anmelden</span>
                      </button>
                      <button
                        onClick={handleAuthToggle}
                        className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-surface-100 transition-colors duration-200 flex items-center space-x-2"
                      >
                        <Icon name="UserPlus" size={16} />
                        <span>Registrieren</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setIsUserMenuOpen(false)}
                        className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-surface-100 transition-colors duration-200 flex items-center space-x-2"
                      >
                        <Icon name="Settings" size={16} />
                        <span>Einstellungen</span>
                      </button>
                      <button
                        onClick={() => setIsUserMenuOpen(false)}
                        className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-surface-100 transition-colors duration-200 flex items-center space-x-2"
                      >
                        <Icon name="User" size={16} />
                        <span>Profil</span>
                      </button>
                      <div className="border-t border-surface-200 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error-50 transition-colors duration-200 flex items-center space-x-2"
                        >
                          <Icon name="LogOut" size={16} />
                          <span>Abmelden</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Overlay */}
      <div className="md:hidden">
        {/* Mobile Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-surface-200 shadow-warm-lg">
          <div className="flex items-center justify-around py-2">
            <button
              onClick={() => handleNavigation('/dashboard-home-screen')}
              className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 min-h-touch min-w-touch ${
                location.pathname === '/dashboard-home-screen' ?'text-primary' :'text-text-secondary'
              }`}
            >
              <Icon name="Home" size={20} />
              <span className="text-xs font-medium">Transform</span>
            </button>
            
            <button
              onClick={() => handleNavigation('/nvc-transformation-results-screen')}
              className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 min-h-touch min-w-touch ${
                location.pathname === '/nvc-transformation-results-screen'
                  ? 'text-primary' :'text-text-secondary'
              }`}
            >
              <Icon name="FileText" size={20} />
              <span className="text-xs font-medium">Ergebnisse</span>
            </button>
            
            <button
              onClick={() => handleNavigation('/ai-coach-chat-screen')}
              className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 min-h-touch min-w-touch ${
                location.pathname === '/ai-coach-chat-screen' ?'text-primary' :'text-text-secondary'
              }`}
            >
              <Icon name="Bot" size={20} />
              <span className="text-xs font-medium">Coach</span>
            </button>
            
            {isAuthenticated && (
              <button
                onClick={() => handleNavigation('/message-history-screen')}
                className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 min-h-touch min-w-touch ${
                  location.pathname === '/message-history-screen' ?'text-primary' :'text-text-secondary'
                }`}
              >
                <Icon name="History" size={20} />
                <span className="text-xs font-medium">Verlauf</span>
              </button>
            )}
            
            <button
              onClick={() => handleNavigation('/contact-feedback-screen')}
              className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-all duration-200 min-h-touch min-w-touch ${
                location.pathname === '/contact-feedback-screen' ?'text-primary' :'text-text-secondary'
              }`}
            >
              <Icon name="Mail" size={20} />
              <span className="text-xs font-medium">Kontakt</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;