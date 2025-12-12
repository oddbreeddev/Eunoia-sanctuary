import React, { useState } from 'react';
import { Sparkles, Loader2, AlertTriangle } from 'lucide-react';
import { generateIkigaiInsight } from '../services/geminiService';
import { IkigaiResponse } from '../types';

const IkigaiTeaser: React.FC = () => {
  const [passions, setPassions] = useState('');
  const [skills, setSkills] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passions || !skills) return;

    setLoading(true);
    setResult(null);
    setError(null);
    
    // Pass empty strings for World Needs and Paid For to indicate inference mode
    const response = await generateIkigaiInsight(passions, skills, "", "");
    
    if (response.success && response.data) {
        setResult(response.data);
    } else {
        setError(response.error || "Unable to analyze. Please try again.");
    }
    
    setLoading(false);
  };

  return (
    <section id="ikigai" className="py-24 relative overflow-hidden transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="bg-white/80 dark:bg-slate-900/80 border border-gray-200 dark:border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl backdrop-blur-xl transition-colors duration-300">
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-200 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" /> Powered by Gemini
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">Quick Vibe Check</h2>
            <p className="text-gray-600 dark:text-gray-300">
              Not ready for the full test? Tell us what you love and what you're good at. 
              Let our AI guide give you a glimpse of your path.
            </p>
          </div>

          {!result ? (
            <form onSubmit={handleAnalyze} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-purple-600 dark:text-purple-300 uppercase tracking-wide">
                    What lights you up?
                  </label>
                  <input
                    type="text"
                    value={passions}
                    onChange={(e) => setPassions(e.target.value)}
                    placeholder="e.g., Gaming, drawing, helping friends..."
                    className="w-full bg-gray-50 dark:bg-black/30 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-cyan-600 dark:text-cyan-300 uppercase tracking-wide">
                    What comes naturally?
                  </label>
                  <input
                    type="text"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    placeholder="e.g., Coding, listening, strategy..."
                    className="w-full bg-gray-50 dark:bg-black/30 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                  />
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl flex items-center justify-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    <span>{error}</span>
                </div>
              )}

              <button
                disabled={loading || !passions || !skills}
                type="submit"
                className="w-full bg-gray-900 dark:bg-white text-white dark:text-indigo-900 font-bold text-lg py-4 rounded-xl hover:bg-gray-800 dark:hover:bg-indigo-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Reveal Insight'}
              </button>
            </form>
          ) : (
            <div className="animate-fade-in text-center space-y-8 py-4">
              <div>
                <h3 className="text-2xl font-serif italic text-purple-700 dark:text-purple-200 mb-4">"{result.title}"</h3>
                <p className="text-gray-900 dark:text-white text-lg mt-2 leading-relaxed">{result.insight}</p>
                <div className="mt-6 flex flex-wrap gap-2 justify-center">
                    {result.careers?.map((c: string, i: number) => (
                        <span key={i} className="px-3 py-1 bg-gray-100 dark:bg-white/10 rounded-full text-xs font-medium text-gray-700 dark:text-gray-300">
                            {c}
                        </span>
                    ))}
                </div>
              </div>
              
              <button
                onClick={() => {
                    setResult(null);
                    setError(null);
                }}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm underline underline-offset-4 transition-colors"
              >
                Analyze something else
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default IkigaiTeaser;