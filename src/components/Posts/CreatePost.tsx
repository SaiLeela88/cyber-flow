import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { Image, Send, Sparkles } from 'lucide-react';

interface CreatePostProps {
  onPostCreated: () => void;
}

export const CreatePost = ({ onPostCreated }: CreatePostProps) => {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatingCaption, setGeneratingCaption] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('posts')
        .insert({
          content: content.trim(),
          user_id: user?.id,
        });

      if (error) throw error;

      toast({
        title: "Post created!",
        description: "Your post has been shared successfully.",
      });

      setContent('');
      onPostCreated();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create post. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCaption = async () => {
    if (!content.trim()) {
      toast({
        title: "Add some content first",
        description: "Write something to get AI suggestions.",
      });
      return;
    }

    setGeneratingCaption(true);
    try {
      // Call Gemini API via Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('generate-caption', {
        body: { content },
      });

      if (error) throw error;

      if (data?.suggestion) {
        setContent(data.suggestion);
        toast({
          title: "Caption generated!",
          description: "AI has enhanced your post content.",
        });
      }
    } catch (error) {
      console.error('Error generating caption:', error);
      toast({
        variant: "destructive",
        title: "AI feature unavailable",
        description: "Caption generation is temporarily unavailable.",
      });
    } finally {
      setGeneratingCaption(false);
    }
  };

  if (!user) return null;

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex space-x-3">
            <Avatar>
              <AvatarImage src={user.user_metadata?.avatar_url} />
              <AvatarFallback>
                {user.user_metadata?.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="What's on your mind?"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px] resize-none border-0 p-0 focus-visible:ring-0"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <div className="flex items-center space-x-2">
              <Button type="button" variant="ghost" size="sm">
                <Image className="h-4 w-4 mr-2" />
                Photo
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                size="sm"
                onClick={generateCaption}
                disabled={generatingCaption}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {generatingCaption ? "Generating..." : "AI Enhance"}
              </Button>
            </div>
            
            <Button 
              type="submit" 
              disabled={!content.trim() || loading}
              size="sm"
            >
              <Send className="h-4 w-4 mr-2" />
              {loading ? "Posting..." : "Post"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};