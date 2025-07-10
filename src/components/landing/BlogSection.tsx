
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, ArrowRight } from "lucide-react";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  tags: string[] | null;
  published_at: string | null;
  created_at: string;
}

interface BlogSectionProps {
  title?: string;
  subtitle?: string;
  showFeaturedOnly?: boolean;
  postsToShow?: number;
}

export function BlogSection({
  title = "Latest Insights",
  subtitle = "Expert advice and insights to help you on your professional journey",
  showFeaturedOnly = true,
  postsToShow = 3
}: BlogSectionProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, [showFeaturedOnly, postsToShow]);

  const fetchPosts = async () => {
    let query = supabase
      .from('blog_posts')
      .select('id, title, slug, excerpt, featured_image_url, tags, published_at, created_at')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(postsToShow);

    if (showFeaturedOnly) {
      query = query.eq('is_featured', true);
    }

    const { data, error } = await query;

    if (!error && data) {
      setPosts(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-br from-warm-sage/5 to-healing-teal/5">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-trust-navy font-serif mb-4">{title}</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(postsToShow)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-br from-warm-sage/5 to-healing-teal/5">
      <div className="container">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <span className="text-4xl">📚</span>
            <h2 className="text-3xl font-bold text-trust-navy font-serif">{title}</h2>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {posts.map((post) => (
            <Card key={post.id} className="group hover:shadow-therapy transition-all duration-300 overflow-hidden">
              {post.featured_image_url && (
                <div className="h-48 overflow-hidden">
                  <img
                    src={post.featured_image_url}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <Calendar className="h-4 w-4" />
                  {new Date(post.published_at || post.created_at).toLocaleDateString()}
                </div>
                <CardTitle className="text-xl group-hover:text-calming-green transition-colors">
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {post.excerpt && (
                  <p className="text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
                )}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                <Button variant="ghost" className="p-0 h-auto font-semibold text-calming-green hover:text-calming-green/80">
                  Read More
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" variant="outline" className="border-calming-green text-calming-green hover:bg-calming-green hover:text-white">
            View All Articles
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}
