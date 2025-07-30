import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { UserPlus, UserCheck } from 'lucide-react';

interface User {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
}

interface UserListProps {
  users: User[];
  loading: boolean;
}

export const UserList = ({ users, loading }: UserListProps) => {
  const { user } = useAuth();
  const [followingUsers, setFollowingUsers] = useState<Set<string>>(new Set());
  const [loadingFollow, setLoadingFollow] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const handleFollow = async (targetUserId: string, isFollowing: boolean) => {
    if (!user || loadingFollow.has(targetUserId)) return;

    setLoadingFollow(prev => new Set(prev).add(targetUserId));

    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);

        if (error) throw error;

        setFollowingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(targetUserId);
          return newSet;
        });
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert({
            follower_id: user.id,
            following_id: targetUserId,
          });

        if (error) throw error;

        setFollowingUsers(prev => new Set(prev).add(targetUserId));
      }

      toast({
        title: isFollowing ? "Unfollowed" : "Following",
        description: `You ${isFollowing ? 'unfollowed' : 'are now following'} this user.`,
      });
    } catch (error) {
      console.error('Error updating follow status:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update follow status. Please try again.",
      });
    } finally {
      setLoadingFollow(prev => {
        const newSet = new Set(prev);
        newSet.delete(targetUserId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-32" />
                </div>
                <Skeleton className="h-8 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">No users found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((userItem) => {
        const isOwnProfile = userItem.id === user?.id;
        const isFollowing = followingUsers.has(userItem.id);
        const isLoadingThisUser = loadingFollow.has(userItem.id);

        return (
          <Card key={userItem.id}>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Link to={`/profile/${userItem.username}`}>
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={userItem.avatar_url} />
                    <AvatarFallback>
                      {userItem.username?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                
                <div className="flex-1 min-w-0">
                  <Link to={`/profile/${userItem.username}`}>
                    <p className="font-semibold hover:underline">
                      {userItem.full_name || userItem.username}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      @{userItem.username}
                    </p>
                  </Link>
                  {userItem.bio && (
                    <p className="text-sm text-muted-foreground mt-1 truncate">
                      {userItem.bio}
                    </p>
                  )}
                </div>
                
                {!isOwnProfile && user && (
                  <Button
                    variant={isFollowing ? "secondary" : "default"}
                    size="sm"
                    onClick={() => handleFollow(userItem.id, isFollowing)}
                    disabled={isLoadingThisUser}
                  >
                    {isLoadingThisUser ? (
                      "..."
                    ) : isFollowing ? (
                      <>
                        <UserCheck className="h-4 w-4 mr-1" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-1" />
                        Follow
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};