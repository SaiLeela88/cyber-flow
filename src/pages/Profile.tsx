import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/Layout/Header';
import { ProfileHeader } from '@/components/Profile/ProfileHeader';
import { PostFeed } from '@/components/Posts/PostFeed';
import { supabase } from '@/lib/supabase';

const Profile = () => {
  const { username } = useParams();
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [username, user]);

  const fetchProfile = async () => {
    try {
      let targetUsername = username;
      
      if (!username && user) {
        // If no username in URL, show current user's profile
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', user.id)
          .single();
        
        targetUsername = userProfile?.username;
        setIsOwnProfile(true);
      }

      if (targetUsername) {
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', targetUsername)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);
        setIsOwnProfile(user?.id === profileData.id);

        // Fetch user's posts
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select(`
            *,
            profiles:user_id (username, avatar_url),
            post_likes (user_id),
            post_comments (*)
          `)
          .eq('user_id', profileData.id)
          .order('created_at', { ascending: false });

        if (postsError) throw postsError;
        setPosts(postsData || []);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-32 bg-muted rounded-lg"></div>
            <div className="h-20 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <h1 className="text-2xl font-bold">Profile not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-6">
        <ProfileHeader 
          profile={profile} 
          isOwnProfile={isOwnProfile}
          onProfileUpdate={fetchProfile}
        />
        <div className="mt-6">
          <PostFeed 
            posts={posts} 
            loading={false} 
            onPostUpdate={fetchProfile} 
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;