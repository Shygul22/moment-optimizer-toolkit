
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";

export function Hero() {
  const location = useLocation();
  return (
    <section className="relative w-full h-[80vh] min-h-[600px] flex items-center justify-center text-center text-white">
      <div className="absolute inset-0 bg-black/60 z-10" />
      <img
        src="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
        alt="ZenJourney - Your Career, Clarity, and Confidence Starts Here"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="relative z-20 container px-4 sm:px-6 lg:px-8 animate-fade-in-up">
        <div className="mb-4">
          <span className="text-2xl">🌟</span>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl mt-2">
            Your Career, Clarity, and Confidence — Starts Here
          </h1>
        </div>
        <p className="mt-6 max-w-3xl mx-auto text-lg sm:text-xl md:text-2xl text-gray-200 font-semibold">
          Therapy for Goal-Getters, Dreamers, and Professionals on the Rise
        </p>
        <p className="mt-4 max-w-2xl mx-auto text-base sm:text-lg text-gray-300">
          Feeling stuck, overwhelmed, or unsure about your next move? Whether you're facing burnout, 
          decision fatigue, or struggling with time management — we're here to help.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Button asChild size="lg" className="text-lg px-8 py-6 bg-therapy-gradient hover:opacity-90">
            <a href="/#services">📘 Book a Career Clarity Session</a>
          </Button>
          <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6 bg-white/20 backdrop-blur-sm hover:bg-white/30">
            <a href="https://wa.me/919092406569" target="_blank" rel="noopener noreferrer">
              🔍 Free Assessment
            </a>
          </Button>
        </div>
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto text-center">
          <div>
            <div className="text-3xl font-bold">500+</div>
            <div className="text-sm text-gray-300">Professionals Guided</div>
          </div>
          <div>
            <div className="text-3xl font-bold">✅</div>
            <div className="text-sm text-gray-300">Online & Flexible</div>
          </div>
          <div>
            <div className="text-3xl font-bold">Free</div>
            <div className="text-sm text-gray-300">Career Assessment</div>
          </div>
        </div>
      </div>
    </section>
  );
}
