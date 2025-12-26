
import React, { useState } from 'react';
import { Lightbulb, HelpCircle, MessageSquareQuote, CheckCircle2, Loader2, Send } from 'lucide-react';
import { submitContribution } from '../services/adminService';

type ContributionType = 'suggestion' | 'question' | 'testimonial';

const CommunityContribution: React.FC = () => {
  const [type, setType] = useState<ContributionType>('suggestion');
  const [formData, setFormData] = useState({ name: '', email: '', content: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content.trim()) return;
    
    setLoading(true);
    const success = await submitContribution({
      ...formData,
      type
    });
    
    if (success) {
      setSubmitted(true);
      setFormData({ name: '', email: '', content: '' });
      setTimeout(() => setSubmitted(false), 5000);
    }
    setLoading(false);
  };

  const contributionInfo = {
    suggestion: {
      title: "Shape the Sanctuary",
      desc: "Tell us how we can make Eunoia better for your journey.",
      icon: <Lightbulb className="w-6 h-6" />,
      color: "purple",
      placeholder: "I wish Eunoia had a module for..."
    },
    question: {
      title: "Ask the Oracle",
      desc: "Curious about archetypes or life mapping? We're here to help.",
      icon: <HelpCircle className="w-6 h-6" />,
      color: "cyan",
      placeholder: "What does it mean if my temperament is..."
    },
    testimonial: {
      title: "Share Your Light",
      desc: "How has Eunoia changed your perspective? Inspire others.",
      icon: <MessageSquareQuote className="w-6 h-6" />,
      color: "emerald",
      placeholder: "Eunoia helped me realize that..."
    }
  };

  return (
    <section id="contribute" className="py-24 relative overflow-hidden bg-slate-50 dark:bg-black/20 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-xs font-bold text-purple-600 dark:text-cyan-400 tracking-[0.4em] uppercase mb-4">Community Voice</h2>
          <h3 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white font-serif">Leave Your Mark</h3>
        </div>

        <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl p-8 md:p-12 overflow-hidden">
          {/* Type Selector */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
            {(['suggestion', 'question', 'testimonial'] as ContributionType[]).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                  type === t 
                    ? `bg-${contributionInfo[t].color}-500/10 border-${contributionInfo[t].color}-500 text-${contributionInfo[t].color}-600 dark:text-${contributionInfo[t].color}-400` 
                    : 'bg-transparent border-gray-200 dark:border-white/5 text-gray-500 hover:border-gray-300'
                }`}
              >
                <div className={`p-2 rounded-xl ${type === t ? `bg-${contributionInfo[t].color}-500 text-white` : 'bg-gray-100 dark:bg-white/10'}`}>
                  {contributionInfo[t].icon}
                </div>
                <div className="text-left">
                  <div className="text-sm font-bold capitalize">{t}</div>
                </div>
              </button>
            ))}
          </div>

          {submitted ? (
            <div className="text-center py-12 animate-fade-in flex flex-col items-center">
              <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-bold dark:text-white mb-2">Received with Gratitude</h4>
              <p className="text-gray-500 max-w-sm mx-auto">Your input helps the Sanctuary grow. Our team will review your {type} shortly.</p>
              <button 
                onClick={() => setSubmitted(false)}
                className="mt-8 text-sm font-bold text-purple-600 dark:text-purple-400 hover:underline"
              >
                Send another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in" key={type}>
              <div className="mb-8">
                <h4 className="text-xl font-bold dark:text-white mb-2">{contributionInfo[type].title}</h4>
                <p className="text-gray-500 text-sm leading-relaxed">{contributionInfo[type].desc}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">Your Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="E.g. Sage"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2 ml-1">Content</label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={4}
                  className="w-full bg-gray-50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                  placeholder={contributionInfo[type].placeholder}
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full bg-gray-900 dark:bg-white text-white dark:text-black font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                {loading ? <Loader2 className="animate-spin" /> : <><Send className="w-4 h-4" /> Submit {type}</>}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Decorative Blur */}
      <div className={`absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-${contributionInfo[type].color}-500/10 rounded-full blur-[100px] transition-colors duration-1000`}></div>
      <div className={`absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px]`}></div>
    </section>
  );
};

export default CommunityContribution;
