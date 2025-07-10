import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit, Trash2, Save } from "lucide-react";

interface LandingSection {
  id: string;
  section_type: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  metadata: any;
}

interface HeroVariation {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  is_active: boolean;
  sort_order: number;
}

export function LandingPageManager() {
  const [sections, setSections] = useState<LandingSection[]>([]);
  const [heroVariations, setHeroVariations] = useState<HeroVariation[]>([]);
  const [editingSection, setEditingSection] = useState<LandingSection | null>(null);
  const [editingHero, setEditingHero] = useState<HeroVariation | null>(null);

  useEffect(() => {
    fetchSections();
    fetchHeroVariations();
  }, []);

  const fetchSections = async () => {
    const { data, error } = await supabase
      .from('landing_page_sections')
      .select('*')
      .order('sort_order');

    if (error) {
      toast.error("Failed to fetch landing page sections");
    } else {
      setSections(data || []);
    }
  };

  const fetchHeroVariations = async () => {
    const { data, error } = await supabase
      .from('hero_variations')
      .select('*')
      .order('sort_order');

    if (error) {
      toast.error("Failed to fetch hero variations");
    } else {
      setHeroVariations(data || []);
    }
  };

  const saveSection = async (section: LandingSection) => {
    const { error } = await supabase
      .from('landing_page_sections')
      .upsert(section);

    if (error) {
      toast.error("Failed to save section");
    } else {
      toast.success("Section saved successfully");
      fetchSections();
      setEditingSection(null);
    }
  };

  const saveHeroVariation = async (hero: HeroVariation) => {
    const { error } = await supabase
      .from('hero_variations')
      .upsert(hero);

    if (error) {
      toast.error("Failed to save hero variation");
    } else {
      toast.success("Hero variation saved successfully");
      fetchHeroVariations();
      setEditingHero(null);
    }
  };

  const deleteSection = async (id: string) => {
    const { error } = await supabase
      .from('landing_page_sections')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Failed to delete section");
    } else {
      toast.success("Section deleted successfully");
      fetchSections();
    }
  };

  const toggleSectionStatus = async (section: LandingSection) => {
    const { error } = await supabase
      .from('landing_page_sections')
      .update({ is_active: !section.is_active })
      .eq('id', section.id);

    if (error) {
      toast.error("Failed to update section status");
    } else {
      fetchSections();
    }
  };

  const toggleHeroStatus = async (hero: HeroVariation) => {
    const { error } = await supabase
      .from('hero_variations')
      .update({ is_active: !hero.is_active })
      .eq('id', hero.id);

    if (error) {
      toast.error("Failed to update hero status");
    } else {
      fetchHeroVariations();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Landing Page Manager</h2>
      </div>

      <Tabs defaultValue="sections" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sections">Page Sections</TabsTrigger>
          <TabsTrigger value="hero">Hero Variations</TabsTrigger>
        </TabsList>

        <TabsContent value="sections" className="space-y-4">
          <div className="grid gap-4">
            {sections.map((section) => (
              <Card key={section.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-medium">
                      {section.section_type.toUpperCase()}
                    </CardTitle>
                    <Badge variant={section.is_active ? "default" : "secondary"}>
                      {section.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={section.is_active}
                      onCheckedChange={() => toggleSectionStatus(section)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingSection(section)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSection(section.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h3 className="font-semibold">{section.title}</h3>
                    <p className="text-sm text-muted-foreground">{section.subtitle}</p>
                    <p className="text-xs text-muted-foreground">Sort Order: {section.sort_order}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {editingSection && (
            <Card>
              <CardHeader>
                <CardTitle>Edit Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Title"
                  value={editingSection.title || ''}
                  onChange={(e) => setEditingSection({
                    ...editingSection,
                    title: e.target.value
                  })}
                />
                <Input
                  placeholder="Subtitle"
                  value={editingSection.subtitle || ''}
                  onChange={(e) => setEditingSection({
                    ...editingSection,
                    subtitle: e.target.value
                  })}
                />
                <Textarea
                  placeholder="Content"
                  value={editingSection.content || ''}
                  onChange={(e) => setEditingSection({
                    ...editingSection,
                    content: e.target.value
                  })}
                />
                <Input
                  placeholder="Image URL"
                  value={editingSection.image_url || ''}
                  onChange={(e) => setEditingSection({
                    ...editingSection,
                    image_url: e.target.value
                  })}
                />
                <Input
                  type="number"
                  placeholder="Sort Order"
                  value={editingSection.sort_order}
                  onChange={(e) => setEditingSection({
                    ...editingSection,
                    sort_order: parseInt(e.target.value)
                  })}
                />
                <div className="flex gap-2">
                  <Button onClick={() => saveSection(editingSection)}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setEditingSection(null)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="hero" className="space-y-4">
          <div className="grid gap-4">
            {heroVariations.map((hero) => (
              <Card key={hero.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-sm font-medium">Hero #{hero.sort_order}</CardTitle>
                    <Badge variant={hero.is_active ? "default" : "secondary"}>
                      {hero.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={hero.is_active}
                      onCheckedChange={() => toggleHeroStatus(hero)}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingHero(hero)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h3 className="font-semibold">{hero.title}</h3>
                    <p className="text-sm text-muted-foreground">{hero.subtitle}</p>
                    <p className="text-xs">{hero.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {editingHero && (
            <Card>
              <CardHeader>
                <CardTitle>Edit Hero Variation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Title"
                  value={editingHero.title}
                  onChange={(e) => setEditingHero({
                    ...editingHero,
                    title: e.target.value
                  })}
                />
                <Input
                  placeholder="Subtitle"
                  value={editingHero.subtitle}
                  onChange={(e) => setEditingHero({
                    ...editingHero,
                    subtitle: e.target.value
                  })}
                />
                <Textarea
                  placeholder="Description"
                  value={editingHero.description}
                  onChange={(e) => setEditingHero({
                    ...editingHero,
                    description: e.target.value
                  })}
                />
                <Input
                  type="number"
                  placeholder="Sort Order"
                  value={editingHero.sort_order}
                  onChange={(e) => setEditingHero({
                    ...editingHero,
                    sort_order: parseInt(e.target.value)
                  })}
                />
                <div className="flex gap-2">
                  <Button onClick={() => saveHeroVariation(editingHero)}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setEditingHero(null)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
