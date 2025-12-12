import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';

const faqs = [
  {
    question: "How is the Temperament Test different from Personality?",
    answer: "Personality tests (like MBTI) often measure how you process information and make decisions. Temperament is more primal—it's your biological rhythm, emotional intensity, and energy levels (Sanguine, Choleric, etc.). We combine both for a full picture."
  },
  {
    question: "Is Eunoia free to use?",
    answer: "The Sanctuary basics, including the Mini Ikigai analysis and Community access, are free forever. Deep-dive mentorship cycles and advanced reports are part of our premium tier."
  },
  {
    question: "Who are the mentors?",
    answer: "Our mentors are a mix of AI-driven guides trained on psychological principles and verified human experts in various fields like creative arts, tech, and wellness."
  }
];

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 dark:border-white/10">
      <button 
        className="w-full py-6 flex justify-between items-center text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-medium text-gray-900 dark:text-white">{question}</span>
        {isOpen ? (
          <Minus className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        ) : (
          <Plus className="w-5 h-5 text-gray-400" />
        )}
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48 opacity-100 pb-6' : 'max-h-0 opacity-0'}`}
      >
        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
};

const FAQ: React.FC = () => {
  return (
    <section className="py-24 bg-white dark:bg-black transition-colors duration-300">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">Frequently Asked Questions</h2>
        <div className="space-y-2">
          {faqs.map((faq, index) => (
            <FAQItem key={index} {...faq} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;