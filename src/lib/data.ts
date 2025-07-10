
import { Heart, Brain, Flower, Sparkles, Users, BookOpen } from "lucide-react";

export const serviceCategories = [
  {
    name: "Career Clarity & Direction",
    description: "Navigate your professional journey with confidence through personalized career guidance and goal-setting strategies.",
    icon: Flower,
    image: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    features: [
      "Career path assessment and planning",
      "Goal-setting and action planning", 
      "Decision-making support and clarity",
      "Professional confidence building"
    ],
    pricing: {
      session: "Free career clarity consultation",
      individual: "₹1,999 per career coaching session",
      package: "₹6,999 for 4-session career transformation package"
    }
  },
  {
    name: "Productivity & Time Management",
    description: "Master productivity without burnout through evidence-based strategies for managing overwhelm and creating balance.",
    icon: Sparkles,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    features: [
      "Time management and prioritization techniques",
      "Procrastination and overwhelm solutions",
      "Work-life balance strategies",
      "Habit formation and accountability"
    ],
    pricing: {
      consultation: "Free productivity assessment",
      coaching: "₹1,799 per productivity session",
      program: "₹7,999 for 6-week productivity mastery program"
    }
  },
  {
    name: "Stress & Anxiety Management",
    description: "Professional support for managing work stress, decision fatigue, and anxiety around career transitions and deadlines.",
    icon: Brain,
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
    features: [
      "Stress management and coping strategies",
      "Anxiety support for career decisions",
      "Burnout prevention and recovery",
      "Confidence building and self-doubt work"
    ],
    pricing: {
      assessment: "Free stress and anxiety screening",
      therapy: "₹2,199 per therapy session",
      support: "₹9,999 for ongoing monthly support package"
    }
  },
];

export const featuredConsultants = [
  {
    name: "Dr. Priya Sharma",
    expertise: "Career Psychologist & Leadership Coach",
    imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    rating: 4.9,
    reviews: 200,
    specialties: ["Career Transitions", "Goal Setting", "Professional Confidence"]
  },
  {
    name: "Arjun Mehta",
    expertise: "Productivity Coach & Time Management Expert",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    rating: 4.8,
    reviews: 150,
    specialties: ["Time Management", "Productivity", "Work-Life Balance"]
  },
  {
    name: "Dr. Ananya Gupta",
    expertise: "Stress Management & Performance Therapist",
    imageUrl: "https://images.unsplash.com/photo-1594824388853-c0c8cd6b8ca9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80",
    rating: 5.0,
    reviews: 180,
    specialties: ["Burnout Recovery", "Stress Management", "Peak Performance"]
  }
];
