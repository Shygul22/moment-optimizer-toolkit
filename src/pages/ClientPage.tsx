
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Calendar, MessageSquare, User, Clock, Shield, Award } from "lucide-react";

const ClientPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-trust-navy mb-4">
            Welcome to Your Therapy Journey
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Take the first step towards better mental health and career clarity. 
            Choose how you'd like to begin your personalized therapy experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <Card className="hover:shadow-lg transition-shadow border-calming-green/20">
            <CardHeader className="text-center">
              <Calendar className="h-12 w-12 text-calming-green mx-auto mb-4" />
              <CardTitle className="text-trust-navy">Book a Session</CardTitle>
              <CardDescription>
                Schedule your first therapy session with our qualified professionals
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild className="w-full bg-therapy-gradient hover:opacity-90">
                <Link to="/booking">Schedule Now</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-calming-green/20">
            <CardHeader className="text-center">
              <MessageSquare className="h-12 w-12 text-calming-green mx-auto mb-4" />
              <CardTitle className="text-trust-navy">Start Chat</CardTitle>
              <CardDescription>
                Begin an instant conversation with our therapy specialists
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild className="w-full bg-therapy-gradient hover:opacity-90">
                <Link to="/chat">Start Chatting</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-calming-green/20">
            <CardHeader className="text-center">
              <User className="h-12 w-12 text-calming-green mx-auto mb-4" />
              <CardTitle className="text-trust-navy">Complete Profile</CardTitle>
              <CardDescription>
                Tell us about yourself to get personalized recommendations
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild className="w-full bg-therapy-gradient hover:opacity-90">
                <Link to="/profile">Setup Profile</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="bg-warm-sage/20 rounded-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-trust-navy mb-6 text-center">
            Why Choose Our Therapy Services?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <Clock className="h-8 w-8 text-calming-green mx-auto mb-3" />
              <h3 className="font-semibold text-trust-navy mb-2">Flexible Scheduling</h3>
              <p className="text-sm text-muted-foreground">
                Book sessions that fit your busy schedule, with online and offline options
              </p>
            </div>
            <div className="text-center">
              <Shield className="h-8 w-8 text-calming-green mx-auto mb-3" />
              <h3 className="font-semibold text-trust-navy mb-2">Confidential & Secure</h3>
              <p className="text-sm text-muted-foreground">
                Your privacy is our priority with end-to-end encrypted sessions
              </p>
            </div>
            <div className="text-center">
              <Award className="h-8 w-8 text-calming-green mx-auto mb-3" />
              <h3 className="font-semibold text-trust-navy mb-2">Qualified Professionals</h3>
              <p className="text-sm text-muted-foreground">
                Work with licensed therapists specialized in career and life coaching
              </p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h3 className="text-xl font-semibold text-trust-navy mb-4">
            Not sure where to start?
          </h3>
          <p className="text-muted-foreground mb-6">
            Our team is here to help you choose the best path forward
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-therapy-gradient hover:opacity-90">
              <a href="https://wa.me/919092406569" target="_blank" rel="noopener noreferrer">
                Get Free Consultation
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-calming-green text-calming-green hover:bg-calming-green hover:text-white">
              <Link to="/auth">Create Account</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientPage;
