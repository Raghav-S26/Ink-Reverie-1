
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';

const profileFormSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters long.').max(50, 'Username cannot be longer than 50 characters.'),
  full_name: z.string().max(100, 'Full name cannot be longer than 100 characters.').optional().or(z.literal('')),
  avatar_file: z.instanceof(File).optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface ProfileFormProps {
  profile: Tables<'profiles'>;
}

const ProfileForm = ({ profile }: ProfileFormProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile.avatar_url);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: profile.username || '',
      full_name: profile.full_name || '',
    },
  });

  const { mutate: updateProfile, isPending } = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      if (!user) throw new Error('User not authenticated');

      let avatar_url = profile.avatar_url;

      if (values.avatar_file) {
        const file = values.avatar_file;
        const fileExt = file.name.split('.').pop();
        const filePath = `${user.id}/avatar.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
        
        // Add a timestamp to bust cache
        avatar_url = `${publicUrl}?t=${new Date().getTime()}`;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          username: values.username,
          full_name: values.full_name,
          avatar_url,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (updateError) throw updateError;
      
      return avatar_url;
    },
    onSuccess: (newAvatarUrl) => {
      toast.success('Profile updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      // We also need to update the user object in the auth context if the avatar changed.
      // This is a bit of a hack, but it's the easiest way to get the new avatar to show in the header.
      if (newAvatarUrl && user) {
          supabase.auth.updateUser({
              data: { avatar_url: newAvatarUrl }
          })
      }
    },
    onError: (error) => {
      toast.error(`Failed to update profile: ${error.message}`);
    },
  });

  const onSubmit = (data: ProfileFormValues) => {
    updateProfile(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="avatar_file"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Avatar</FormLabel>
              <FormControl>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarPreview || undefined} alt={profile.username || ''} />
                    <AvatarFallback>{profile.username?.[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <Input
                    type="file"
                    accept="image/png, image/jpeg, image/gif"
                    className="max-w-xs"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        field.onChange(file);
                        setAvatarPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Username</FormLabel>
              <FormControl>
                <Input placeholder="Your username" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="Your full name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Updating...' : 'Update Profile'}
        </Button>
      </form>
    </Form>
  );
};

export default ProfileForm;
