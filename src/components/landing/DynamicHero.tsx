
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

interface HeroVariation {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  is_active: boolean;
  sort_order: number;
}

export function DynamicHero() {
  const [heroTexts, setHeroTexts] = useState<HeroVariation[]>([]);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    fetchHeroVariations();
  }, []);

  useEffect(() => {
    if (heroTexts.length <= 1) return;

    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentTextIndex((prev) => (prev + 1) % heroTexts.length);
        setIsVisible(true);
      }, 500);
    }, 6000);

    return () => clearInterval(interval);
  }, [heroTexts.length]);

  const fetchHeroVariations = async () => {
    const { data, error } = await supabase
      .from('hero_variations')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (!error && data && data.length > 0) {
      setHeroTexts(data);
    } else {
      // Fallback to default content if no data or error
      setHeroTexts([{
        id: 'default',
        title: "Your Career, Clarity, and Confidence — Starts Here",
        subtitle: "Therapy for Goal-Getters, Dreamers, and Professionals on the Rise",
        description: "Feeling stuck, overwhelmed, or unsure about your next move? Whether you're facing burnout, decision fatigue, or struggling with time management — we're here to help.",
        is_active: true,
        sort_order: 1
      }]);
    }
  };

  const scrollToServices = () => {
    document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' });
  };

  const currentText = heroTexts[currentTextIndex] || heroTexts[0];

  if (!currentText) return null;

  return (
    <section className="relative w-full h-[80vh] min-h-[600px] flex items-center justify-center text-center text-white overflow-hidden">
      <div className="absolute inset-0 bg-black/60 z-10" />
      <img
        src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
        alt="ZenJourney - Your Career, Clarity, and Confidence Starts Here"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="relative z-20 container px-4 sm:px-6 lg:px-8">
        <div 
          className={`mb-4 transition-all duration-500 ${
            isVisible ? 'animate-fade-in-up opacity-100' : 'opacity-0 translate-y-4'
          }`}
        >
          <span className="text-2xl animate-gentle-bounce">🌟</span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mt-2">
            {currentText.title}
          </h1>
        </div>
        
        <div 
          className={`transition-all duration-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          <p className="mt-6 max-w-3xl mx-auto text-lg sm:text-xl md:text-2xl text-gray-200 font-semibold">
            {currentText.subtitle}
          </p>
          <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-gray-300">
            {currentText.description}
          </p>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild size="lg" className="text-lg px-8 py-6 bg-therapy-gradient hover:opacity-90 transform hover:scale-105 transition-all duration-300">
            <Link to="/client">📘 Book a Career Clarity Session</Link>
          </Button>
          <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6 bg-white/20 backdrop-blur-sm hover:bg-white/30 transform hover:scale-105 transition-all duration-300">
            <a href="https://wa.me/919092406569" target="_blank" rel="noopener noreferrer">
              🔍 Free Assessment
            </a>
          </Button>
        </div>

        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto text-center">
          <div className="transform hover:scale-110 transition-transform duration-300">
            <div className="text-3xl font-bold animate-calm-pulse">500+</div>
            <div className="text-sm text-gray-300">Professionals Guided</div>
          </div>
          <div className="transform hover:scale-110 transition-transform duration-300">
            <div className="text-3xl font-bold">✅</div>
            <div className="text-sm text-gray-300">Online & Flexible</div>
          </div>
          <div className="transform hover:scale-110 transition-transform duration-300">
            <div className="text-3xl font-bold">Free</div>
            <div className="text-sm text-gray-300">Career Assessment</div>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={scrollToServices}
            className="text-white/80 hover:text-white transition-colors animate-gentle-bounce"
            aria-label="Scroll to services"
          >
            <ChevronDown className="h-8 w-8" />
          </button>
        </div>
      </div>
    </section>
  );
}
