
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface StatItem {
  number: number;
  suffix: string;
  label: string;
  description: string;
  icon: string;
}

interface StatsSection {
  title: string;
  subtitle: string;
  stats: StatItem[];
}

interface StatsMetadata {
  stats: StatItem[];
}

function AnimatedNumber({ target, suffix }: { target: number; suffix: string }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const increment = target / 50;
    const timer = setInterval(() => {
      setCurrent((prev) => {
        if (prev < target) {
          return Math.min(prev + increment, target);
        }
        clearInterval(timer);
        return target;
      });
    }, 40);

    return () => clearInterval(timer);
  }, [target]);

  return (
    <span>
      {Math.floor(current)}{suffix}
    </span>
  );
}

export function InteractiveStats() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [statsData, setStatsData] = useState<StatsSection | null>(null);

  useEffect(() => {
    fetchStatsData();
  }, []);

  const fetchStatsData = async () => {
    const { data, error } = await supabase
      .from('landing_page_sections')
      .select('*')
      .eq('section_type', 'stats')
      .eq('is_active', true)
      .single();

    if (!error && data && data.metadata) {
      try {
        // Safely parse the metadata JSON with proper type checking
        const metadata = data.metadata as unknown;
        if (metadata && typeof metadata === 'object' && 'stats' in metadata) {
          const typedMetadata = metadata as StatsMetadata;
          setStatsData({
            title: data.title || "Why Thousands Trust ZenJourney",
            subtitle: data.subtitle || "Real results from real people who've transformed their careers and found inner peace",
            stats: typedMetadata.stats
          });
        } else {
          // Fallback to default stats
          setStatsData(getDefaultStats());
        }
      } catch (parseError) {
        console.error('Error parsing stats metadata:', parseError);
        setStatsData(getDefaultStats());
      }
    } else {
      // Fallback to default stats
      setStatsData(getDefaultStats());
    }
  };

  const getDefaultStats = (): StatsSection => ({
    title: "Why Thousands Trust ZenJourney",
    subtitle: "Real results from real people who've transformed their careers and found inner peace",
    stats: [
      {
        number: 500,
        suffix: "+",
        label: "Professionals Helped",
        description: "Successfully guided career transitions",
        icon: "👥"
      },
      {
        number: 98,
        suffix: "%",
        label: "Success Rate",
        description: "Clients report positive outcomes",
        icon: "📈"
      },
      {
        number: 4.9,
        suffix: "/5",
        label: "Average Rating",
        description: "Based on client reviews",
        icon: "⭐"
      },
      {
        number: 24,
        suffix: "h",
        label: "Response Time",
        description: "Average response to inquiries",
        icon: "⚡"
      }
    ]
  });

  if (!statsData) return null;

  return (
    <section className="py-16 bg-warm-sage/5">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-trust-navy font-serif mb-4">
            {statsData.title}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {statsData.subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.stats.map((stat, index) => (
            <Card
              key={index}
              className={`text-center cursor-pointer transition-all duration-300 transform ${
                hoveredIndex === index
                  ? 'scale-105 shadow-therapy bg-therapy-gradient text-white'
                  : 'hover:scale-102 hover:shadow-calming'
              }`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <CardContent className="p-6">
                <div className="text-4xl mb-4">{stat.icon}</div>
                <div 
                  className={`text-3xl font-bold mb-2 ${
                    hoveredIndex === index ? 'text-white' : 'text-trust-navy'
                  }`}
                >
                  <AnimatedNumber target={stat.number} suffix={stat.suffix} />
                </div>
                <div 
                  className={`font-semibold mb-2 ${
                    hoveredIndex === index ? 'text-white' : 'text-trust-navy'
                  }`}
                >
                  {stat.label}
                </div>
                <div 
                  className={`text-sm ${
                    hoveredIndex === index ? 'text-white/90' : 'text-muted-foreground'
                  }`}
                >
                  {stat.description}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
