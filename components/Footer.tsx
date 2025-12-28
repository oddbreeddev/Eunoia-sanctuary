
import React from 'react';
import { Instagram, Twitter, MessageCircle, Lock, Shield, Scale, AlertTriangle } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  return (
    <footer className="border-t border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-black/40 backdrop-blur-lg pt-16 pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Col */}
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 tracking-wider">EUNOIA</h2>
            <p className="text-gray-600 dark:text-gray-500 text-sm leading-relaxed mb-6">
              Designing the future of self-discovery for the digital generation. Depth psychology meets AI.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-purple-600 transition-colors"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="text-gray-400 hover:text-cyan-600 transition-colors"><Twitter className="w-5 h-5" /></a>
            </div>
          </div>
          
          {/* Legal Col */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-[0.2em] mb-6">Transparency</h3>
            <ul className="space-y-4">
              <li><Link to="/privacy" className="text-sm text-gray-500 hover:text-purple-600 flex items-center gap-2"><Shield className="w-3.5 h-3.5" /> Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm text-gray-500 hover:text-purple-600 flex items-center gap-2"><Scale className="w-3.5 h-3.5" /> Terms of Service</Link></li>
              <li><Link to="/disclaimer" className="text-sm text-gray-500 hover:text-purple-600 flex items-center gap-2"><AlertTriangle className="w-3.5 h-3.5" /> Medical Disclaimer</Link></li>
            </ul>
          </div>

          {/* Nav Col */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-[0.2em] mb-6">Sanctuary</h3>
            <ul className="space-y-4 text-sm text-gray-500">
              <li><button onClick={() => navigate('/dashboard')} className="hover:text-purple-600">The Journey</button></li>
              <li><button onClick={() => navigate('/profile')} className="hover:text-purple-600">Soul Archives</button></li>
              <li><button onClick={() => navigate('/login')} className="hover:text-purple-600">Join Us</button></li>
            </ul>
          </div>

          {/* Contact Col */}
          <div>
            <h3 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-[0.2em] mb-6">Connection</h3>
            <p className="text-sm text-gray-500 mb-2">eunoia_app@yahoo.com</p>
            <p className="text-sm text-gray-500">Kaltungo, Gombe State</p>
          </div>
        </div>
        
        <div className="border-t border-gray-200 dark:border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 dark:text-gray-600 text-xs">
            © {new Date().getFullYear()} Eunoia Sanctuary. Crafted for the modern seeker.
          </p>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/admin')}
              className="text-gray-300 dark:text-gray-800 hover:text-purple-500 dark:hover:text-purple-500 transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest"
            >
              <Lock className="w-3 h-3" /> System Admin
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
