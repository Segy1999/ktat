import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/types';

interface AdminUserData {
  email: string;
  password: string;
  username: string;
}

export async function createAdminUser(userData: AdminUserData) {
  try {
    console.log('Starting admin user creation...');
    
    // 1. Create the user in auth.users with auto confirmation
    console.log('Creating auth user...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          username: userData.username,
          role: 'admin'
        },
        emailRedirectTo: `${window.location.origin}/admin/login`,
        // Attempt to bypass email confirmation temporarily
        gotrue_meta_security: {
          captcha_token: null
        }
      }
    });

    if (authError) {
      // Check for specific email restriction error
      if (authError.message.includes('not authorized') || authError.message.includes('email domain')) {
        console.error('Email restriction error:', authError);
        throw new Error(
          'Email domain not authorized. Please contact your Supabase administrator to:\n' +
          '1. Add gmail.com to allowed domains, or\n' +
          '2. Temporarily disable email restrictions'
        );
      }
      console.error('Auth error:', authError);
      throw authError;
    }

    if (!authData.user) throw new Error('No user data returned');
    
    console.log('Auth user created successfully:', authData.user.id);

    // 2. Create the profile with admin role
    console.log('Creating profile...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        username: userData.username,
        email: userData.email,
        role: 'admin'
      } satisfies Omit<Profile, 'created_at' | 'updated_at' | 'first_name' | 'last_name'>)
      .select()
      .single();

    if (profileError) {
      console.error('Profile error:', profileError);
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw profileError;
    }

    console.log('Profile created successfully:', profileData);

    // 3. Set up any additional admin-specific data or permissions
    console.log('Setting up admin claims...');
    const { error: roleError } = await supabase.rpc('set_claim', {
      uid: authData.user.id,
      claim: 'role',
      value: 'admin'
    });

    if (roleError) {
      console.error('Role error:', roleError);
      throw roleError;
    }

    console.log('Admin setup completed successfully');
    
    return {
      success: true,
      user: authData.user,
      message: authData.user.email_confirmed_at
        ? 'Admin user created successfully. You can now log in.'
        : 'Admin user created successfully. Please check your email for confirmation.'
    };

  } catch (error: any) {
    console.error('Detailed error in admin user creation:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    
    return {
      success: false,
      error: error.message || 'Failed to create admin user'
    };
  }
}

export async function verifyAdminAccess(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error) throw error;

    return data?.role === 'admin';
  } catch (error) {
    console.error('Error verifying admin access:', error);
    return false;
  }
}
