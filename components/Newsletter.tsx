
import React, { useState } from 'react';
import { Send, Loader2, CheckCircle2, Sparkles } from 'lucide-react';

const Newsletter: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call for marketing signup
    setTimeout(() => {
      setLoading(false);
      setDone(true);
      setEmail('');
    }, 1500);
  };

  return (
    <section className="py-24 bg-purple-600 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_white_0%,_transparent_70%)]"></div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1 bg-white/10 rounded-full text-white text-[10px] font-bold uppercase tracking-widest mb-6 border border-white/20">
          <Sparkles className="w-3 h-3" /> The Weekly Insight
        </div>
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 font-serif">Stay Connected to Your Growth</h2>
        <p className="text-purple-100 text-lg mb-10 max-w-xl mx-auto">Join 5,000+ seekers. Receive weekly psychology insights and sanctuary updates directly in your inbox.</p>
        
        {done ? (
          <div className="animate-fade-in flex flex-col items-center gap-4 text-white">
            <CheckCircle2 className="w-12 h-12 text-emerald-300" />
            <div className="text-xl font-bold">You're on the list!</div>
            <p className="text-purple-200">Watch your inbox for your first insight.</p>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-purple-200 outline-none focus:ring-2 ring-white/50 transition-all backdrop-blur-md"
            />
            <button 
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-white text-purple-600 rounded-2xl font-bold shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Send className="w-4 h-4" /> Subscribe</>}
            </button>
          </form>
        )}
        <p className="mt-6 text-[10px] text-purple-300 uppercase tracking-widest">No spam. Just soul. Unsubscribe anytime.</p>
      </div>
    </section>
  );
};

export default Newsletter;
