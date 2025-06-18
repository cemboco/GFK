import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';

const BreadcrumbTrail = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const routeMap = {
    '/dashboard-home-screen': {
      title: 'Dashboard',
      icon: 'Home',
      description: 'Transformation erstellen'
    },
    '/nvc-transformation-results-screen': {
      title: 'Ergebnisse',
      icon: 'FileText',
      description: 'Transformation anzeigen',
      parent: '/dashboard-home-screen'
    },
    '/ai-coach-chat-screen': {
      title: 'AI Coach',
      icon: 'Bot',
      description: 'Coaching-Gespräch',
      parent: '/nvc-transformation-results-screen'
    },
    '/message-history-screen': {
      title: 'Verlauf',
      icon: 'History',
      description: 'Nachrichten-Historie'
    },
    '/contact-feedback-screen': {
      title: 'Kontakt',
      icon: 'Mail',
      description: 'Feedback senden'
    }
  };

  const currentRoute = routeMap[location.pathname];
  
  if (!currentRoute) return null;

  const buildBreadcrumbPath = (pathname) => {
    const path = [];
    let current = routeMap[pathname];
    
    while (current) {
      path.unshift({ pathname: Object.keys(routeMap).find(key => routeMap[key] === current), ...current });
      current = current.parent ? routeMap[current.parent] : null;
    }
    
    return path;
  };

  const breadcrumbPath = buildBreadcrumbPath(location.pathname);

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleBack = () => {
    if (currentRoute.parent) {
      navigate(currentRoute.parent);
    } else {
      window.history.back();
    }
  };

  return (
    <div className="bg-surface border-b border-surface-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          {/* Mobile: Back button + Current page */}
          <div className="flex items-center space-x-3 md:hidden">
            <button
              onClick={handleBack}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-200 transition-colors duration-200"
              aria-label="Zurück"
            >
              <Icon name="ArrowLeft" size={18} className="text-text-secondary" />
            </button>
            <div className="flex items-center space-x-2">
              <Icon name={currentRoute.icon} size={16} className="text-primary" />
              <div>
                <h2 className="text-sm font-medium text-text-primary">{currentRoute.title}</h2>
                <p className="text-xs text-text-secondary">{currentRoute.description}</p>
              </div>
            </div>
          </div>

          {/* Desktop: Full breadcrumb trail */}
          <nav className="hidden md:flex items-center space-x-2" aria-label="Breadcrumb">
            {breadcrumbPath.map((item, index) => (
              <div key={item.pathname} className="flex items-center space-x-2">
                {index > 0 && (
                  <Icon name="ChevronRight" size={14} className="text-text-tertiary" />
                )}
                <button
                  onClick={() => handleNavigation(item.pathname)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all duration-200 ${
                    index === breadcrumbPath.length - 1
                      ? 'bg-primary-50 text-primary cursor-default' :'text-text-secondary hover:text-text-primary hover:bg-surface-100'
                  }`}
                  disabled={index === breadcrumbPath.length - 1}
                >
                  <Icon name={item.icon} size={14} />
                  <span className="text-sm font-medium">{item.title}</span>
                </button>
              </div>
            ))}
          </nav>

          {/* Current page description */}
          <div className="hidden md:block">
            <p className="text-sm text-text-secondary">{currentRoute.description}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreadcrumbTrail;