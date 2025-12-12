import React from 'react';

const QuoteSection: React.FC = () => {
  return (
    <section className="py-32 relative overflow-hidden bg-black flex items-center justify-center">
      {/* Abstract Background Art */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_#4c1d95_0%,_#000_70%)] opacity-40"></div>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-fuchsia-600/30 rounded-full blur-[80px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-600/30 rounded-full blur-[100px]"></div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        <h2 className="font-serif text-4xl md:text-6xl italic text-white leading-tight mb-8">
          "Knowing yourself is the beginning of all wisdom."
        </h2>
        <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-cyan-500 mx-auto mb-6"></div>
        <p className="text-gray-400 uppercase tracking-[0.2em] text-sm">Aristotle • The First Step</p>
      </div>
    </section>
  );
};

export default QuoteSection;
