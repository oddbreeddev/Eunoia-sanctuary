import React from 'react';
import Hero from './Hero';
import Features from './Features';
import About from './About';
import Testimonials from './Testimonials';
import FAQ from './FAQ';
import QuoteSection from './QuoteSection';
import Contact from './Contact';
import IkigaiTeaser from './IkigaiTeaser';

const LandingPage: React.FC = () => {
  return (
    <>
      <Hero />
      <About />
      <Features />
      <Testimonials />
      <IkigaiTeaser />
      <FAQ />
      <QuoteSection />
      <Contact />
    </>
  );
};

export default LandingPage;
