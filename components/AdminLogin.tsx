import React, { useState } from 'react';
import { Shield, Lock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminAuth } from '../services/adminService';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminAuth.login(email, password)) {
      localStorage.setItem('eunoia_admin_session', 'true');
      navigate('/admin/dashboard');
    } else {
      setError('Invalid Administrative Credentials');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-black/50 border border-gray-800 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center border border-red-900/50">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-center text-white mb-2">Restricted Access</h2>
        <p className="text-gray-500 text-center text-sm mb-8">Sanctuary Administration Node</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs font-mono text-gray-400 uppercase">Admin ID</label>
            <input 
              type="text" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-white focus:border-red-500 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="text-xs font-mono text-gray-400 uppercase">Passkey</label>
            <div className="relative">
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg p-3 text-white focus:border-red-500 focus:outline-none transition-colors"
              />
              <Lock className="absolute right-3 top-3.5 w-4 h-4 text-gray-600" />
            </div>
          </div>

          {error && <div className="text-red-500 text-xs text-center font-mono">{error}</div>}

          <button className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2">
            Authenticate <ChevronRight className="w-4 h-4" />
          </button>
        </form>
        
        <div className="mt-8 text-center">
            <button onClick={() => navigate('/')} className="text-gray-600 hover:text-gray-400 text-xs">Return to Sanctuary</button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;