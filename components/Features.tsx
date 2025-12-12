import React, { useState } from 'react';
import { Brain, Compass, Users, Fingerprint, Activity, X, ArrowRight, CheckCircle2 } from 'lucide-react';
import { FeatureCardProps } from '../types';

// Extended data with details for the modal
const features: Omit<FeatureCardProps, 'onClick'>[] = [
  {
    title: "Personality Archetypes",
    description: "Dive deep into the cognitive functions that drive your decisions. Are you a Diplomat or an Analyst? Find out.",
    details: "Our comprehensive assessment analyzes 4 key dimensions of personality. We break down your cognitive stack (Introverted Thinking vs Extroverted Feeling, etc.) to give you a roadmap of your psyche. Understand your strengths, blind spots, and ideal growth path. We move beyond simple labels to help you understand the 'why' behind your actions.",
    icon: <Fingerprint className="w-8 h-8 text-fuchsia-600 dark:text-fuchsia-400" />,
  },
  {
    title: "Temperament Matrix",
    description: "Different from personality, your temperament is your biological rhythm. Discover if you are Sanguine, Choleric, Melancholic, or Phlegmatic.",
    details: "Based on the ancient 4 temperaments but modernized for the 21st century. This isn't just about 'types'—it's about energy management. Learn how to harness your natural rhythms, whether you're a high-energy Choleric or a steady Phlegmatic. We provide specific productivity schedules tailored to your biological wiring.",
    icon: <Activity className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />,
  },
  {
    title: "Ikigai Compass",
    description: "Align your passion, mission, vocation, and profession to find your true reason for being.",
    details: "Ikigai is the Japanese concept of 'a reason for being'. We guide you through the intersection of what you love, what you're good at, what the world needs, and what you can be paid for. It's the ultimate career and life purpose tool. Our interactive compass helps you map these out visually and tracks your progress towards alignment.",
    icon: <Compass className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />,
  },
  {
    title: "Mentorship Cycles",
    description: "Get paired with guides who have walked the path you are just discovering.",
    details: "Connect with mentors who match your specific archetype and goals. Our cycles are 6-week sprint-based programs designed to help you tackle a specific challenge—be it career transition, creative block, or personal leadership. We use AI matching to ensure you find a mentor whose experience perfectly complements your current journey.",
    icon: <Brain className="w-8 h-8 text-purple-600 dark:text-purple-400" />,
  },
];

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white/60 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 p-8 rounded-2xl hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-300 group cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-2 relative overflow-hidden"
  >
    <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
        <ArrowRight className="w-5 h-5 text-purple-500 dark:text-purple-400" />
    </div>
    <div className="bg-gray-100 dark:bg-gray-900/50 w-16 h-16 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-inner">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">{title}</h3>
    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{description}</p>
  </div>
);

interface FeatureModalProps {
  feature: FeatureCardProps;
  onClose: () => void;
}

const FeatureModal: React.FC<FeatureModalProps> = ({ feature, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      ></div>
      <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-3xl shadow-2xl p-8 md:p-12 animate-float transform transition-all">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-xl">
            {React.cloneElement(feature.icon as React.ReactElement, { className: "w-8 h-8 text-purple-600 dark:text-purple-400" })}
          </div>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{feature.title}</h3>
        </div>

        <div className="prose dark:prose-invert max-w-none">
          <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
            {feature.details || feature.description}
          </p>
          
          <div className="bg-gray-50 dark:bg-black/20 rounded-xl p-6 border border-gray-100 dark:border-white/5">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Key Benefits</h4>
            <ul className="space-y-3">
              {[1, 2, 3].map((_, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-600 dark:text-gray-400 text-sm">
                   <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                   <span>
                     {i === 0 && "Personalized insights based on your unique data."}
                     {i === 1 && "Actionable steps to improve your daily life."}
                     {i === 2 && "Integration with our community mentorship program."}
                   </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8 flex justify-end">
            <button 
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-medium hover:opacity-90 transition-opacity"
            >
              Got it
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Features: React.FC = () => {
  const [selectedFeature, setSelectedFeature] = useState<FeatureCardProps | null>(null);

  return (
    <section id="features" className="py-24 bg-gray-50/50 dark:bg-black/20 relative transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-sm font-semibold text-purple-600 dark:text-cyan-400 tracking-widest uppercase mb-3">The Blueprint</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Tools for the Modern Seeker</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index} 
              {...feature} 
              onClick={() => setSelectedFeature(feature)}
            />
          ))}
        </div>
      </div>

      {selectedFeature && (
        <FeatureModal 
          feature={selectedFeature} 
          onClose={() => setSelectedFeature(null)} 
        />
      )}
    </section>
  );
};

export default Features;