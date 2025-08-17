import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

const Navigation = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/pizza', label: 'Pizza Calculator', icon: '🍕' },
    { path: '/beverages', label: 'Beverage Calculator', icon: '🥤' },
    { path: '/guests', label: 'Guest List', icon: '👥' },
    { path: '/timeline', label: 'Timeline', icon: '📅' },
    { path: '/todos', label: 'Todo Manager', icon: '✅' },
    { path: '/itinerary', label: 'Itinerary', icon: '⏰' },
    { path: '/data', label: 'Data Management', icon: '📁' },
  ];

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">🎉</span>
            <span className="text-xl font-bold text-gray-800">Party Planner</span>
          </Link>
          
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className="mr-1">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
          
          <div className="md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <span className="text-xl">{isMobileMenuOpen ? '✕' : '☰'}</span>
            </button>
          </div>
        </div>
        
        {/* Mobile menu - collapsible */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-3 py-2 rounded-md text-sm font-medium text-center transition-colors ${
                    location.pathname === item.path
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <div>{item.icon}</div>
                  <div className="text-xs">{item.label}</div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;