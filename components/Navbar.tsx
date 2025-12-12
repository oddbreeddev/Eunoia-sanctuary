import React, { useState, useEffect } from 'react';
import { Menu, X, Sparkles, Sun, Moon, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThemeProps } from '../types';
import { auth } from '../services/firebaseConfig';

const Navbar: React.FC<ThemeProps> = ({ isDark, toggleTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check login status on mount and when location changes
  useEffect(() => {
    const checkLogin = () => {
        const localUser = localStorage.getItem('eunoia_user');
        const firebaseUser = auth?.currentUser;
        setIsLoggedIn(!!localUser || !!firebaseUser);
    };
    checkLogin();
    // In a real app we would subscribe to auth changes, but polling/checking on route change works for this structure
    const interval = setInterval(checkLogin, 1000);
    return () => clearInterval(interval);
  }, [location]);

  // Helper to handle hash navigation from different routes
  const handleNavClick = (hash: string) => {
    setIsOpen(false); // Close mobile menu if open
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(hash.replace('#', ''));
        if (element) element.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleActionClick = () => {
    setIsOpen(false);
    if (isLoggedIn) {
        navigate('/dashboard');
    } else {
        navigate('/login');
    }
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/70 dark:bg-black/10 backdrop-blur-lg border-b border-gray-200 dark:border-white/10 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <button onClick={() => navigate('/')} className="flex items-center gap-2 focus:outline-none">
            <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-cyan-600 dark:from-purple-400 dark:to-cyan-400 tracking-wider font-sans">
              EUNOIA
            </span>
          </button>
          
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-baseline space-x-8">
              <button onClick={() => handleNavClick('#about')} className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors bg-transparent border-none cursor-pointer">Origins</button>
              <button onClick={() => handleNavClick('#features')} className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors bg-transparent border-none cursor-pointer">Sanctuary</button>
              <button onClick={() => handleNavClick('#ikigai')} className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors bg-transparent border-none cursor-pointer">AI Mentor</button>
              <button onClick={() => handleNavClick('#contact')} className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors bg-transparent border-none cursor-pointer">Contact</button>
            </div>
            
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-yellow-300 transition-all"
              aria-label="Toggle Theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button 
              onClick={handleActionClick}
              className="bg-gray-900 dark:bg-white/10 hover:bg-gray-800 dark:hover:bg-white/20 text-white px-6 py-2 rounded-full text-sm font-medium border border-transparent dark:border-white/20 transition-all hover:scale-105"
            >
              {isLoggedIn ? 'Dashboard' : 'Join Community'}
            </button>

            {isLoggedIn && (
                <button 
                  onClick={() => navigate('/profile')}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-all"
                  aria-label="Profile"
                >
                   <User className="w-5 h-5" />
                </button>
            )}
          </div>
          
          <div className="-mr-2 flex md:hidden items-center gap-4">
             <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-600 dark:text-yellow-300 transition-all"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white dark:bg-black/90 backdrop-blur-xl border-t border-gray-200 dark:border-white/10">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <button onClick={() => handleNavClick('#about')} className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left">Origins</button>
            <button onClick={() => handleNavClick('#features')} className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left">Sanctuary</button>
            <button onClick={() => handleNavClick('#ikigai')} className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left">AI Mentor</button>
            <button onClick={() => handleNavClick('#contact')} className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left">Contact</button>
            <button onClick={handleActionClick} className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left">
                {isLoggedIn ? 'Dashboard' : 'Join Community'}
            </button>
             {isLoggedIn && (
                <button onClick={() => navigate('/profile')} className="text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left">
                    Profile
                </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;