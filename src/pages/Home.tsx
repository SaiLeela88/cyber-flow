import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Layout/Header';
import { CreatePost } from '@/components/Posts/CreatePost';
import { PostFeed } from '@/components/Posts/PostFeed';
import { Sidebar } from '@/components/Layout/SocialSidebar';
import { supabase } from '@/lib/supabase';

const Home = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (username, avatar_url),
          post_likes (user_id),
          post_comments (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = () => {
    fetchPosts();
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <Sidebar />
          </div>
          <div className="lg:col-span-2 space-y-6">
            {user && <CreatePost onPostCreated={handlePostCreated} />}
            <PostFeed posts={posts} loading={loading} onPostUpdate={fetchPosts} />
          </div>
          <div className="lg:col-span-1">
            {/* Suggested users or trending content */}
            <div className="bg-card rounded-lg p-4">
              <h3 className="font-semibold mb-4">Trending</h3>
              <p className="text-muted-foreground text-sm">Coming soon...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;