import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero: React.FC = () => {
  const navigate = useNavigate();

  const scrollToFeatures = () => {
    const element = document.getElementById('features');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative pt-32 pb-20 sm:pt-40 sm:pb-24 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm font-semibold mb-8 animate-fade-in border border-purple-200 dark:border-purple-500/30">
          <Sparkles className="w-4 h-4" />
          <span>The Sanctuary is Open</span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-8 text-gray-900 dark:text-white">
          <span className="block mb-2">Discover Your</span>
          <span className="block bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-600 via-purple-600 to-cyan-600 dark:from-fuchsia-400 dark:via-purple-400 dark:to-cyan-400 animate-pulse">
            Inner Universe
          </span>
        </h1>
        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
          Welcome to <span className="text-purple-600 dark:text-white font-semibold">Eunoia</span>. 
          Unravel the layers of your personality, decode your temperament, and find your tribe in a world that often feels too loud.
        </p>
        
        <div className="flex flex-row justify-center gap-3 sm:gap-4 w-full">
          <button 
            onClick={() => navigate('/login')}
            className="flex-1 sm:flex-none px-4 sm:px-8 py-4 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-sm sm:text-lg shadow-xl shadow-purple-500/20 hover:shadow-purple-500/40 transform hover:-translate-y-1 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
          >
            Start Journey <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button 
            onClick={scrollToFeatures}
            className="flex-1 sm:flex-none px-4 sm:px-8 py-4 rounded-full bg-white dark:bg-transparent border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm sm:text-lg hover:bg-gray-50 dark:hover:bg-white/5 dark:hover:border-white transition-all whitespace-nowrap"
          >
            Explore Features
          </button>
        </div>
      </div>
      
      {/* Background Decorative Elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-300/30 dark:bg-purple-900/20 rounded-full blur-[100px] -z-10 pointer-events-none mix-blend-multiply dark:mix-blend-screen animate-float"></div>
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-cyan-200/40 dark:bg-cyan-900/20 rounded-full blur-[80px] -z-10 pointer-events-none mix-blend-multiply dark:mix-blend-screen"></div>
    </div>
  );
};

export default Hero;