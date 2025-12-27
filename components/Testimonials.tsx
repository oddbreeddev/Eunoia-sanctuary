
import React, { useEffect, useState } from 'react';
import { Quote, Loader2, MessageSquarePlus } from 'lucide-react';
import { fetchApprovedTestimonials, CommunityContribution as ContributionType } from '../services/adminService';

const Testimonials: React.FC = () => {
  const [dynamicTestimonials, setDynamicTestimonials] = useState<ContributionType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTestimonials = async () => {
      const approved = await fetchApprovedTestimonials();
      setDynamicTestimonials(approved);
      setLoading(false);
    };
    loadTestimonials();
  }, []);

  const scrollToContribute = () => {
    const element = document.getElementById('contribute');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="py-24 bg-gray-50/30 dark:bg-black/40 transition-colors duration-300 overflow-hidden border-y border-gray-100 dark:border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-xs font-bold text-purple-600 dark:text-cyan-400 tracking-[0.4em] uppercase mb-4">Real Journeys</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white font-serif">Community Voices</h3>
        </div>
        
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          </div>
        ) : dynamicTestimonials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {dynamicTestimonials.map((t) => (
              <div 
                key={t.id} 
                className="p-8 rounded-[2rem] border border-gray-200 dark:border-white/10 bg-white/50 dark:bg-white/5 backdrop-blur-sm relative animate-fade-in group hover:scale-[1.02] transition-all shadow-sm hover:shadow-xl"
              >
                <Quote className="w-10 h-10 text-purple-500/10 absolute top-6 right-6 group-hover:text-purple-500/20 transition-colors" />
                <p className="text-gray-700 dark:text-gray-300 text-lg mb-6 relative z-10 leading-relaxed italic">
                  "{t.content}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-100 to-cyan-100 dark:from-purple-900/30 dark:to-cyan-900/30 flex items-center justify-center font-bold text-purple-600 dark:text-purple-300 text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white text-sm">{t.name}</p>
                    <p className="text-[10px] text-gray-500 uppercase tracking-widest">Sanctuary Seeker</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="max-w-2xl mx-auto text-center py-16 px-8 bg-white dark:bg-white/5 rounded-[2.5rem] border border-dashed border-gray-200 dark:border-white/10">
            <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
              <MessageSquarePlus className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold dark:text-white mb-2">The Archive is Quiet</h4>
            <p className="text-gray-500 mb-8 text-sm">We are currently curating real stories from our community. Be one of the first to share your breakthrough.</p>
            <button 
              onClick={scrollToContribute}
              className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-sm hover:scale-105 transition-all shadow-lg"
            >
              Share Your Story
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
