import React from 'react';

const About: React.FC = () => {
  return (
    <section id="about" className="py-24 relative overflow-hidden bg-white dark:bg-black transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-16">
        
        <div className="w-full md:w-1/2 relative">
          <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur-lg opacity-30 dark:opacity-40 animate-pulse"></div>
          <div className="relative bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 md:p-12 overflow-hidden">
             {/* Abstract Art Placeholder */}
             <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
             <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl"></div>
             
             <h3 className="text-2xl font-serif italic text-gray-800 dark:text-gray-200 mb-6 relative z-10">
               "We built what we needed but couldn't find."
             </h3>
             <div className="space-y-4 relative z-10">
               <div className="h-2 w-24 bg-purple-500 rounded-full"></div>
               <div className="h-2 w-32 bg-cyan-500 rounded-full opacity-70"></div>
               <div className="h-2 w-16 bg-pink-500 rounded-full opacity-50"></div>
             </div>
          </div>
        </div>

        <div className="w-full md:w-1/2">
          <h2 className="text-sm font-semibold text-purple-600 dark:text-purple-400 tracking-widest uppercase mb-4">Our Origins</h2>
          <h3 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">Born from the Restless Energy of Youth</h3>
          <div className="space-y-6 text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            <p>
              Eunoia wasn't forged in a corporate boardroom. It was born out of late-night dorm room debates, existential coffee shop scribbles, and the burning passion of young people refusing to settle for a "default" life path.
            </p>
            <p>
              We realized the old tests were dusty, and the advice was outdated. We wanted a sanctuary that felt like <em>us</em>.
            </p>
            <p>
              Interactive, beautiful, and deeply insightful—Eunoia is the bridge between who you are and who you are becoming.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};

export default About;
