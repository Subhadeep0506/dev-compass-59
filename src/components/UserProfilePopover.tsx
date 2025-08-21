import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface UserProfilePopoverProps {
  children: React.ReactNode;
}

export const UserProfilePopover = ({ children }: UserProfilePopoverProps) => {
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: 'Error signing out',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Signed out',
        description: 'You have been successfully signed out.',
      });
    }
  };

  if (!user) return children;

  const displayName = profile?.full_name || profile?.username || user.email?.split('@')[0] || 'User';
  const username = profile?.username || user.email?.split('@')[0] || 'user';

  return (
    <Popover>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-64" align="end">
        <div className="space-y-4">
          {/* User Info */}
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback>
                {displayName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">@{username}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <User className="mr-2 h-4 w-4" />
              Profile Settings
            </Button>
            <Button 
              variant="ghost" 
              className="w-full justify-start text-destructive hover:text-destructive" 
              size="sm"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};