import React, { useState } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import DashboardPage from './components/Dashboard';
import ProfilePage from './components/ProfilePage';
import AdminLogin from './components/AdminLogin';
import AdminDashboard from './components/AdminDashboard';
import Footer from './components/Footer';

// Layout wrapper to conditionally hide Navbar/Footer for Admin pages
const AppLayout: React.FC<{ isDark: boolean; toggleTheme: () => void }> = ({ isDark, toggleTheme }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white selection:bg-purple-500 selection:text-white font-sans transition-colors duration-300 flex flex-col">
        {!isAdminRoute && <Navbar isDark={isDark} toggleTheme={toggleTheme} />}
        
        {/* Abstract Background Gradients fixed for the whole page (Dark Mode Only) */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-0 dark:opacity-100 transition-opacity duration-500">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,_#1e1b4b,transparent_50%)]"></div>
          <div className="absolute bottom-0 right-0 w-full h-[50%] bg-[radial-gradient(circle_at_100%_100%,_#312e81,transparent_40%)]"></div>
        </div>
        
        {/* Light Mode subtle background gradient */}
        <div className="fixed inset-0 z-0 pointer-events-none opacity-100 dark:opacity-0 transition-opacity duration-500">
              <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-purple-100/50 blur-[100px] rounded-full"></div>
              <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-cyan-100/50 blur-[100px] rounded-full"></div>
        </div>

        <main className="relative z-10 flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </main>

        {!isAdminRoute && <Footer />}
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(true);
  const toggleTheme = () => setIsDark(!isDark);

  return (
    <HashRouter>
      <AppLayout isDark={isDark} toggleTheme={toggleTheme} />
    </HashRouter>
  );
};

export default App;