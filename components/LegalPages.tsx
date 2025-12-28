
import React from 'react';
import { Shield, Scale, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LegalLayout: React.FC<{ children: React.ReactNode; title: string; icon: React.ReactNode }> = ({ children, title, icon }) => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-black">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => navigate(-1)} className="mb-8 flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-purple-600 uppercase tracking-widest transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-4 mb-10">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
            {icon}
          </div>
          <h1 className="text-4xl font-serif font-bold text-gray-900 dark:text-white">{title}</h1>
        </div>
        <div className="prose dark:prose-invert max-w-none space-y-8 text-gray-600 dark:text-gray-400 leading-relaxed font-sans">
          {children}
        </div>
      </div>
    </div>
  );
};

export const PrivacyPolicy: React.FC = () => (
  <LegalLayout title="Privacy Policy" icon={<Shield className="w-6 h-6" />}>
    <section>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">1. Data as a Mirror</h2>
      <p>Your privacy is the bedrock of our sanctuary. At Eunoia, we treat your self-discovery data as a reflection of your inner self—not a commodity to be sold. We collect profile information, temperament results, and reflection logs solely to personalize your growth journey.</p>
    </section>
    <section>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">2. AI & Data Processing</h2>
      <p>Eunoia utilizes Google Gemini API to provide psychological insights. When you interact with the "Mirror Chamber" or generate a "Soul Map," your input is processed by AI. This data is not used to train global models; it is used specifically to generate your unique results.</p>
    </section>
    <section>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">3. Security</h2>
      <p>We utilize Firebase's industry-standard encryption for data storage. While we take every precaution, the digital path is never without risk. We encourage users not to share sensitive medical records or extreme personal identifying information in free-text fields.</p>
    </section>
  </LegalLayout>
);

export const TermsOfService: React.FC = () => (
  <LegalLayout title="Terms of Service" icon={<Scale className="w-6 h-6" />}>
    <section>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">1. The Nature of Exploration</h2>
      <p>By entering Eunoia, you agree that this is a platform for self-exploration and creative life planning. You are responsible for the actions you take based on AI-generated insights.</p>
    </section>
    <section>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">2. AI Limitations</h2>
      <p>Our "Oracle" (AI) is advanced but not infallible. It may produce results that are metaphorical, symbolic, or occasionally inaccurate. These should be treated as prompts for reflection rather than absolute directives.</p>
    </section>
    <section>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">3. User Conduct</h2>
      <p>The Sanctuary is a place of peace. Users found attempting to exploit the AI or use the platform for harmful self-reflection or illegal activities will be barred from the hub.</p>
    </section>
  </LegalLayout>
);

export const Disclaimer: React.FC = () => (
  <LegalLayout title="Medical Disclaimer" icon={<AlertTriangle className="w-6 h-6" />}>
    <div className="p-8 bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-500 rounded-r-2xl">
      <h2 className="text-xl font-bold text-amber-800 dark:text-amber-400 mb-4 uppercase tracking-widest text-sm">Vital Notice</h2>
      <p className="text-amber-900 dark:text-amber-200 font-medium">Eunoia is an AI-driven self-discovery tool. It is NOT a medical device, a clinical diagnostic tool, or a substitute for professional psychiatric or therapeutic care.</p>
    </div>
    <section>
      <p>If you are experiencing a mental health crisis, severe depression, or thoughts of self-harm, please exit this application immediately and contact a local emergency service or a professional crisis hotline. Eunoia's AI is not equipped to handle acute psychological emergencies.</p>
    </section>
    <section>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Guidance vs. Therapy</h2>
      <p>Therapy involves a clinical relationship with a licensed human professional. Eunoia offers "Soul Guidance"—a data-driven, symbolic exploration of your personality. While beneficial for growth, it does not carry the medical weight of professional clinical treatment.</p>
    </section>
  </LegalLayout>
);
