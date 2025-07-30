import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { UserPlus, UserCheck, Settings, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface Profile {
  id: string;
  username: string;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  location?: string;
  website?: string;
  created_at: string;
}

interface ProfileHeaderProps {
  profile: Profile;
  isOwnProfile: boolean;
  onProfileUpdate: () => void;
}

export const ProfileHeader = ({ profile, isOwnProfile, onProfileUpdate }: ProfileHeaderProps) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    posts: 0,
    followers: 0,
    following: 0,
  });
  const { toast } = useToast();

  const handleFollow = async () => {
    if (!user || loading) return;

    setLoading(true);
    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', profile.id);

        if (error) throw error;
        setIsFollowing(false);
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: profile.id,
          });

        if (error) throw error;
        setIsFollowing(true);
      }

      toast({
        title: isFollowing ? "Unfollowed" : "Following",
        description: `You ${isFollowing ? 'unfollowed' : 'are now following'} ${profile.username}.`,
      });

      onProfileUpdate();
    } catch (error) {
      console.error('Error updating follow status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update follow status. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <Avatar className="h-24 w-24">
            <AvatarImage src={profile.avatar_url} />
            <AvatarFallback className="text-2xl">
              {profile.username?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold">
                  {profile.full_name || profile.username}
                </h1>
                <p className="text-muted-foreground">@{profile.username}</p>
              </div>
              
              <div className="flex space-x-2 mt-2 sm:mt-0">
                {isOwnProfile ? (
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : user ? (
                  <Button
                    variant={isFollowing ? "secondary" : "default"}
                    onClick={handleFollow}
                    disabled={loading}
                  >
                    {loading ? (
                      "..."
                    ) : isFollowing ? (
                      <>
                        <UserCheck className="h-4 w-4 mr-2" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Follow
                      </>
                    )}
                  </Button>
                ) : null}
              </div>
            </div>
            
            {profile.bio && (
              <p className="text-sm">{profile.bio}</p>
            )}
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {profile.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {profile.location}
                </div>
              )}
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Joined {format(new Date(profile.created_at), 'MMMM yyyy')}
              </div>
            </div>
            
            <div className="flex space-x-6">
              <div className="text-center">
                <p className="font-semibold">{stats.posts}</p>
                <p className="text-sm text-muted-foreground">Posts</p>
              </div>
              <div className="text-center">
                <p className="font-semibold">{stats.followers}</p>
                <p className="text-sm text-muted-foreground">Followers</p>
              </div>
              <div className="text-center">
                <p className="font-semibold">{stats.following}</p>
                <p className="text-sm text-muted-foreground">Following</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};