import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/sonner";
import { Plus, Edit, Trash2, Save, Eye } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  featured_image_url: string | null;
  author_id: string | null;
  is_published: boolean;
  is_featured: boolean;
  tags: string[] | null;
  meta_description: string | null;
  published_at: string | null;
  created_at: string;
}

export function BlogManager() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error("Failed to fetch blog posts");
    } else {
      setPosts(data || []);
    }
  };

  const createNewPost = () => {
    const newPost: BlogPost = {
      id: '',
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      featured_image_url: '',
      author_id: user?.id || null,
      is_published: false,
      is_featured: false,
      tags: [],
      meta_description: '',
      published_at: null,
      created_at: new Date().toISOString(),
    };
    setEditingPost(newPost);
    setIsCreating(true);
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const savePost = async (post: BlogPost) => {
    const postData = {
      ...post,
      slug: post.slug || generateSlug(post.title),
      published_at: post.is_published && !post.published_at ? new Date().toISOString() : post.published_at,
    };

    const { error } = isCreating
      ? await supabase.from('blog_posts').insert(postData)
      : await supabase.from('blog_posts').update(postData).eq('id', post.id);

    if (error) {
      toast.error("Failed to save blog post");
    } else {
      toast.success(`Blog post ${isCreating ? 'created' : 'updated'} successfully`);
      fetchPosts();
      setEditingPost(null);
      setIsCreating(false);
    }
  };

  const deletePost = async (id: string) => {
    const { error } = await supabase
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (error) {
      toast.error("Failed to delete blog post");
    } else {
      toast.success("Blog post deleted successfully");
      fetchPosts();
    }
  };

  const togglePostStatus = async (post: BlogPost, field: 'is_published' | 'is_featured') => {
    const updateData: any = { [field]: !post[field] };
    if (field === 'is_published' && !post.is_published) {
      updateData.published_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('blog_posts')
      .update(updateData)
      .eq('id', post.id);

    if (error) {
      toast.error("Failed to update post status");
    } else {
      fetchPosts();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Blog Manager</h2>
        <Button onClick={createNewPost}>
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>

      <div className="grid gap-4">
        {posts.map((post) => (
          <Card key={post.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-medium">{post.title}</CardTitle>
                <Badge variant={post.is_published ? "default" : "secondary"}>
                  {post.is_published ? "Published" : "Draft"}
                </Badge>
                {post.is_featured && (
                  <Badge variant="outline">Featured</Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-xs">
                  <span>Published:</span>
                  <Switch
                    checked={post.is_published}
                    onCheckedChange={() => togglePostStatus(post, 'is_published')}
                  />
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <span>Featured:</span>
                  <Switch
                    checked={post.is_featured}
                    onCheckedChange={() => togglePostStatus(post, 'is_featured')}
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingPost(post)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deletePost(post.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{post.excerpt}</p>
                <p className="text-xs text-muted-foreground">
                  Slug: /{post.slug} | Created: {new Date(post.created_at).toLocaleDateString()}
                </p>
                {post.tags && post.tags.length > 0 && (
                  <div className="flex gap-1">
                    {post.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingPost && (
        <Card>
          <CardHeader>
            <CardTitle>{isCreating ? 'Create New Post' : 'Edit Post'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Post Title"
              value={editingPost.title}
              onChange={(e) => setEditingPost({
                ...editingPost,
                title: e.target.value,
                slug: generateSlug(e.target.value)
              })}
            />
            <Input
              placeholder="Slug"
              value={editingPost.slug}
              onChange={(e) => setEditingPost({
                ...editingPost,
                slug: e.target.value
              })}
            />
            <Textarea
              placeholder="Excerpt"
              value={editingPost.excerpt || ''}
              onChange={(e) => setEditingPost({
                ...editingPost,
                excerpt: e.target.value
              })}
            />
            <Textarea
              placeholder="Content (Markdown supported)"
              className="min-h-[200px]"
              value={editingPost.content}
              onChange={(e) => setEditingPost({
                ...editingPost,
                content: e.target.value
              })}
            />
            <Input
              placeholder="Featured Image URL"
              value={editingPost.featured_image_url || ''}
              onChange={(e) => setEditingPost({
                ...editingPost,
                featured_image_url: e.target.value
              })}
            />
            <Input
              placeholder="Tags (comma separated)"
              value={editingPost.tags?.join(', ') || ''}
              onChange={(e) => setEditingPost({
                ...editingPost,
                tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag)
              })}
            />
            <Input
              placeholder="Meta Description"
              value={editingPost.meta_description || ''}
              onChange={(e) => setEditingPost({
                ...editingPost,
                meta_description: e.target.value
              })}
            />
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={editingPost.is_published}
                  onCheckedChange={(checked) => setEditingPost({
                    ...editingPost,
                    is_published: checked
                  })}
                />
                <span className="text-sm">Published</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editingPost.is_featured}
                  onCheckedChange={(checked) => setEditingPost({
                    ...editingPost,
                    is_featured: checked
                  })}
                />
                <span className="text-sm">Featured</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => savePost(editingPost)}>
                <Save className="h-4 w-4 mr-2" />
                {isCreating ? 'Create' : 'Save'}
              </Button>
              <Button variant="outline" onClick={() => {
                setEditingPost(null);
                setIsCreating(false);
              }}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
