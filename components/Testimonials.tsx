
import React, { useEffect, useState } from 'react';
import { Quote, Loader2 } from 'lucide-react';
import { fetchApprovedTestimonials, CommunityContribution } from '../services/adminService';

const defaultTestimonials = [
  {
    name: "Alex M.",
    role: "Visual Artist",
    quote: "The Temperament Matrix explained why I work in bursts. I finally stopped fighting my nature and started working with it.",
    color: "bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800",
  },
  {
    name: "Sarah Jenkins",
    role: "Student",
    quote: "I found my Ikigai in 5 minutes. The AI mentor didn't just give generic advice, it actually felt like it was listening.",
    color: "bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800",
  },
  {
    name: "David Chen",
    role: "Entrepreneur",
    quote: "The community here is different. No toxicity, just people genuinely trying to level up. It's my daily recharge.",
    color: "bg-cyan-50 dark:bg-cyan-900/10 border-cyan-200 dark:border-cyan-800",
  }
];

const Testimonials: React.FC = () => {
  const [dynamicTestimonials, setDynamicTestimonials] = useState<CommunityContribution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTestimonials = async () => {
      const approved = await fetchApprovedTestimonials();
      setDynamicTestimonials(approved);
      setLoading(false);
    };
    loadTestimonials();
  }, []);

  const allTestimonials = [
    ...defaultTestimonials,
    ...dynamicTestimonials.map(t => ({
      name: t.name,
      role: "Sanctuary Seeker",
      quote: t.content,
      color: "bg-white dark:bg-white/5 border-gray-200 dark:border-white/10"
    }))
  ];

  return (
    <section className="py-24 bg-gray-50 dark:bg-black/40 transition-colors duration-300 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-16">Voices of the Community</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allTestimonials.map((t, i) => (
            <div key={i} className={`p-8 rounded-2xl border ${t.color} backdrop-blur-sm relative animate-fade-in group hover:scale-[1.02] transition-all`}>
              <Quote className="w-10 h-10 text-gray-300 dark:text-white/10 absolute top-6 right-6 group-hover:text-purple-500/20 transition-colors" />
              <p className="text-gray-700 dark:text-gray-300 text-lg mb-6 relative z-10 leading-relaxed italic">"{t.quote}"</p>
              <div>
                <p className="font-bold text-gray-900 dark:text-white">{t.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">{t.role}</p>
              </div>
            </div>
          ))}
          
          {loading && dynamicTestimonials.length === 0 && (
            <div className="col-span-full flex justify-center py-10">
              <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
