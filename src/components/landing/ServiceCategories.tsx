
import { serviceCategories } from "@/lib/data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "../ui/button";
import { ArrowRight, Heart } from "lucide-react";

export function ServiceCategories() {
  return (
    <section id="services" className="py-20 sm:py-32 bg-gradient-to-br from-warm-sage/10 to-healing-teal/10">
      <div className="container">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-4xl">🧠</span>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-trust-navy font-serif">
              Specialized Therapy for
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8 text-left">
            <div className="flex items-center gap-3 p-4 bg-white/50 rounded-lg">
              <span className="text-2xl">🎓</span>
              <span className="text-trust-navy font-medium">Students confused about their career path</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white/50 rounded-lg">
              <span className="text-2xl">🧑‍💼</span>
              <span className="text-trust-navy font-medium">Working professionals juggling too much</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white/50 rounded-lg">
              <span className="text-2xl">🔁</span>
              <span className="text-trust-navy font-medium">Career changers facing uncertainty</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white/50 rounded-lg">
              <span className="text-2xl">📈</span>
              <span className="text-trust-navy font-medium">Entrepreneurs battling burnout</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white/50 rounded-lg md:col-span-2 lg:col-span-2">
              <span className="text-2xl">🕒</span>
              <span className="text-trust-navy font-medium">Anyone struggling with goal-setting & time management</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
          {serviceCategories.map((service) => (
            <Card key={service.name} className="flex flex-col overflow-hidden transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-therapy group bg-gradient-to-br from-card to-warm-sage/5">
              <div className="h-48 w-full overflow-hidden">
                <img 
                  src={service.image} 
                  alt={service.name} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <CardHeader className="flex flex-row items-center gap-4 pb-2">
                <div className="bg-therapy-gradient text-white p-3 rounded-full shadow-calming">
                  <service.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl text-trust-navy font-serif">{service.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-muted-foreground mb-4">{service.description}</p>
                <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                  {service.features?.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-calming-green rounded-full"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <div className="p-6 pt-0">
                <Button className="w-full group/btn bg-therapy-gradient hover:opacity-90 shadow-calming" asChild>
                  <a href="https://wa.me/919092406569" target="_blank" rel="noopener noreferrer">
                    Match Me with a Therapist
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/btn:translate-x-1" />
                  </a>
                </Button>
              </div>
            </Card>
          ))}
        </div>
        
        <div className="bg-healing-gradient rounded-2xl p-8 text-center text-white shadow-therapy">
          <h3 className="text-2xl font-bold mb-4 font-serif flex items-center justify-center gap-2">
            <span>💡</span>
            Why Therapy for Career Growth?
          </h3>
          <p className="mb-6 max-w-2xl mx-auto opacity-90">
            Sometimes, what holds us back isn't skill — it's self-doubt, stress, or lack of clarity. 
            Therapy helps you set realistic goals, master productivity without burnout, and build confidence in your choices.
          </p>
          <Button size="lg" variant="secondary" className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border-white/30" asChild>
            <a href="mailto:hello@zenjourney.in">
              Create My Personal Growth Plan
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
