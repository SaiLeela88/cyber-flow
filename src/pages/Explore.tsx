import { useState, useEffect } from 'react';
import { Header } from '@/components/Layout/Header';
import { SearchBar } from '@/components/Search/SearchBar';
import { PostFeed } from '@/components/Posts/PostFeed';
import { UserList } from '@/components/Users/UserList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/lib/supabase';

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExploreData();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      handleSearch();
    } else {
      fetchExploreData();
    }
  }, [searchQuery]);

  const fetchExploreData = async () => {
    try {
      setLoading(true);

      // Fetch trending posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (username, avatar_url),
          post_likes (user_id),
          post_comments (*)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (postsError) throw postsError;
      setPosts(postsData || []);

      // Fetch suggested users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .limit(10);

      if (usersError) throw usersError;
      setUsers(usersData || []);
    } catch (error) {
      console.error('Error fetching explore data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);

      // Search posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (username, avatar_url),
          post_likes (user_id),
          post_comments (*)
        `)
        .ilike('content', `%${searchQuery}%`)
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;
      setPosts(postsData || []);

      // Search users
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${searchQuery}%,full_name.ilike.%${searchQuery}%`);

      if (usersError) throw usersError;
      setUsers(usersData || []);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <SearchBar 
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search posts, users, or hashtags..."
          />
        </div>

        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="mt-6">
            <PostFeed 
              posts={posts} 
              loading={loading} 
              onPostUpdate={fetchExploreData}
            />
          </TabsContent>
          
          <TabsContent value="users" className="mt-6">
            <UserList users={users} loading={loading} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Explore;