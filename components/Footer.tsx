import React from 'react';
import { Instagram, Twitter, MessageCircle, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="border-t border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-black/40 backdrop-blur-lg pt-16 pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div className="mb-8 md:mb-0 text-center md:text-left">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">EUNOIA</h2>
            <p className="text-gray-600 dark:text-gray-500 text-sm max-w-xs">
              Designing the future of self-discovery for the digital generation.
            </p>
          </div>
          
          <div className="flex space-x-6">
            <a href="https://eunoia.cc.cc" target="_blank" rel="noopener noreferrer" className="text-gray-400 dark:text-gray-500 hover:text-fuchsia-600 dark:hover:text-fuchsia-400 transition-colors">
              <Instagram className="w-6 h-6" />
            </a>
            <a href="https://eunoia.cc.cc" target="_blank" rel="noopener noreferrer" className="text-gray-400 dark:text-gray-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
              <Twitter className="w-6 h-6" />
            </a>
            <a href="https://eunoia.cc.cc" target="_blank" rel="noopener noreferrer" className="text-gray-400 dark:text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
              <MessageCircle className="w-6 h-6" />
            </a>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 dark:text-gray-600 text-sm">
            © {new Date().getFullYear()} Eunoia Inc. All rights reserved.
          </p>
          <button 
            onClick={() => navigate('/admin')}
            className="text-gray-300 dark:text-gray-800 hover:text-purple-500 dark:hover:text-purple-500 transition-colors flex items-center gap-1 text-xs"
          >
            <Lock className="w-3 h-3" /> Admin
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;