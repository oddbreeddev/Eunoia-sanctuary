import React, { useState } from 'react';
import { Send, Mail, MapPin, CheckCircle } from 'lucide-react';
import { submitContactMessage } from '../services/adminService';

const Contact: React.FC = () => {
  const [formState, setFormState] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    await submitContactMessage(formState);
    
    setIsSubmitting(false);
    setIsSent(true);
    setFormState({ name: '', email: '', message: '' });
    
    // Reset success message after a few seconds
    setTimeout(() => setIsSent(false), 5000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  return (
    <section id="contact" className="py-24 bg-gray-50 dark:bg-black transition-colors duration-300 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-purple-100/50 to-transparent dark:from-purple-900/20 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Text Content */}
          <div>
            <h2 className="text-sm font-semibold text-purple-600 dark:text-purple-400 tracking-widest uppercase mb-3">Connect</h2>
            <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Send us a Message</h3>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Whether you have a question about your archetype, want to partner with us, or just want to share your story, we're listening.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4 group">
                <div className="p-3 bg-white dark:bg-white/10 rounded-lg shadow-sm group-hover:bg-purple-50 dark:group-hover:bg-white/20 transition-colors">
                  <Mail className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Email Us</h4>
                  <p className="text-gray-600 dark:text-gray-400">eunoia_app@yahoo.com</p>
                </div>
              </div>
              
              <div className="flex items-start gap-4 group">
                <div className="p-3 bg-white dark:bg-white/10 rounded-lg shadow-sm group-hover:bg-cyan-50 dark:group-hover:bg-white/20 transition-colors">
                  <MapPin className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">HQ</h4>
                  <p className="text-gray-600 dark:text-gray-400">Kaltungo, Gombe State, Nigeria</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-white/5 backdrop-blur-lg border border-gray-200 dark:border-white/10 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
             {isSent ? (
               <div className="text-center py-12 animate-fade-in flex flex-col items-center justify-center h-full min-h-[400px]">
                 <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mb-6">
                   <CheckCircle className="w-10 h-10" />
                 </div>
                 <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Message Sent!</h3>
                 <p className="text-gray-600 dark:text-gray-400">We'll get back to you shortly.</p>
               </div>
             ) : (
               <form onSubmit={handleSubmit} className="space-y-6">
                 <div>
                   <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
                   <input
                     type="text"
                     name="name"
                     id="name"
                     required
                     value={formState.name}
                     onChange={handleChange}
                     className="w-full bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                     placeholder="Your name"
                   />
                 </div>
                 <div>
                   <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
                   <input
                     type="email"
                     name="email"
                     id="email"
                     required
                     value={formState.email}
                     onChange={handleChange}
                     className="w-full bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                     placeholder="you@example.com"
                   />
                 </div>
                 <div>
                   <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message</label>
                   <textarea
                     name="message"
                     id="message"
                     rows={4}
                     required
                     value={formState.message}
                     onChange={handleChange}
                     className="w-full bg-gray-50 dark:bg-black/40 border border-gray-300 dark:border-white/10 rounded-xl px-4 py-3 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all resize-none"
                     placeholder="What's on your mind?"
                   ></textarea>
                 </div>
                 <button
                   type="submit"
                   disabled={isSubmitting}
                   className="w-full bg-gray-900 dark:bg-white text-white dark:text-black font-bold py-4 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                 >
                   {isSubmitting ? 'Sending...' : (
                    <>
                      Send Message <Send className="w-4 h-4" />
                    </>
                   )}
                 </button>
               </form>
             )}
          </div>

        </div>
      </div>
    </section>
  );
};

export default Contact;