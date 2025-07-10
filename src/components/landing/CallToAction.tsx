
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { Heart, Shield, Sparkles, Users, Phone, Mail, MessageCircle } from "lucide-react";

export function CallToAction() {
  const location = useLocation();
  return (
    <section id="about" className="py-20 sm:py-32">
      <div className="container">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-4xl">💬</span>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-trust-navy font-serif">
              Real Stories, Real Impact
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
            <div className="bg-warm-sage/10 p-6 rounded-lg border border-calming-green/20 shadow-trust">
              <p className="text-muted-foreground italic mb-4">
                "My therapist helped me shift from chaos to clarity. I stopped procrastinating, found a direction, 
                and even landed the job I used to doubt I deserved."
              </p>
              <div className="text-sm text-trust-navy font-semibold">— Career Change Success</div>
            </div>
            <div className="bg-warm-sage/10 p-6 rounded-lg border border-calming-green/20 shadow-trust">
              <p className="text-muted-foreground italic mb-4">
                "I didn't know therapy could help me with time management. But now, I feel in control of my life again. 
                I highly recommend it to anyone feeling lost in their career."
              </p>
              <div className="text-sm text-trust-navy font-semibold">— Productivity Breakthrough</div>
            </div>
          </div>
        </div>
        
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold mb-6 text-trust-navy font-serif flex items-center justify-center gap-2">
            <span>📍</span>
            What to Expect in a Career Guidance Session
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <div className="text-center p-6 rounded-lg bg-warm-sage/10 border border-calming-green/20 shadow-trust">
              <div className="text-3xl mb-4">🔍</div>
              <h4 className="font-semibold mb-2 text-trust-navy">Discover Your Strengths & Blocks</h4>
              <p className="text-sm text-muted-foreground">
                Identify what's holding you back and your unique strengths
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-warm-sage/10 border border-calming-green/20 shadow-trust">
              <div className="text-3xl mb-4">🎯</div>
              <h4 className="font-semibold mb-2 text-trust-navy">Set Clear, Achievable Goals</h4>
              <p className="text-sm text-muted-foreground">
                Create meaningful career, academic, or personal objectives
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-warm-sage/10 border border-calming-green/20 shadow-trust">
              <div className="text-3xl mb-4">📋</div>
              <h4 className="font-semibold mb-2 text-trust-navy">Build Action Plans</h4>
              <p className="text-sm text-muted-foreground">
                Develop habits that stick and create lasting change
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-warm-sage/10 border border-calming-green/20 shadow-trust">
              <div className="text-3xl mb-4">⚖️</div>
              <h4 className="font-semibold mb-2 text-trust-navy">Learn to Prioritize</h4>
              <p className="text-sm text-muted-foreground">
                Master time management and create work-life balance
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-warm-sage/10 border border-calming-green/20 shadow-trust">
              <div className="text-3xl mb-4">📈</div>
              <h4 className="font-semibold mb-2 text-trust-navy">Track Your Progress</h4>
              <p className="text-sm text-muted-foreground">
                Monitor growth and celebrate achievements over time
              </p>
            </div>
            <div className="text-center p-6 rounded-lg bg-warm-sage/10 border border-calming-green/20 shadow-trust">
              <div className="text-3xl mb-4">🧘</div>
              <h4 className="font-semibold mb-2 text-trust-navy">Find Peace of Mind</h4>
              <p className="text-sm text-muted-foreground">
                Success with balance, not just doing more
              </p>
            </div>
          </div>
        </div>
        
        <div className="text-center mb-8">
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
            <Button asChild size="lg" className="text-lg px-8 py-6 bg-therapy-gradient hover:opacity-90 shadow-calming">
              <a href="https://wa.me/919092406569" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-5 w-5" />
                Book Now - Career Clarity Session
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-lg px-8 py-6 border-calming-green text-calming-green hover:bg-calming-green hover:text-white">
              <a href="mailto:hello@zenjourney.in">
                <Mail className="mr-2 h-5 w-5" />
                Free Assessment
              </a>
            </Button>
          </div>
          
          <div className="bg-healing-gradient rounded-lg p-6 max-w-md mx-auto text-white shadow-therapy">
            <h3 className="font-semibold mb-2 font-serif">💼 Career Coaching Meets Therapy</h3>
            <p className="text-sm opacity-90 mb-3">
              Because success is not just about doing more — it's about doing what matters with peace of mind.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <span>+91 9092406569</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Mail className="h-4 w-4" />
                <span>hello@zenjourney.in</span>
              </div>
              <div className="text-xs opacity-90 mt-3">
                ✅ Online & Flexible • ✅ Judgment-Free Zone • ✅ Confidential & Secure
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Free career assessment • Personalized sessions • Real strategies • Long-term growth
          </p>
        </div>
      </div>
    </section>
  );
}
