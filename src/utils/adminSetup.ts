import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/types';

interface AdminUserData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export async function createAdminUser(userData: AdminUserData) {
  try {
    // 1. Create the user in auth.users
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No user data returned');

    // 2. Create the profile with admin role
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: 'admin',
        email: userData.email,
      } satisfies Omit<Profile, 'created_at' | 'updated_at'>);

    if (profileError) throw profileError;

    // 3. Set up any additional admin-specific data or permissions
    const { error: roleError } = await supabase.rpc('set_claim', {
      uid: authData.user.id,
      claim: 'role',
      value: 'admin'
    });

    if (roleError) throw roleError;

    return {
      success: true,
      user: authData.user,
      message: 'Admin user created successfully'
    };

  } catch (error: any) {
    console.error('Error creating admin user:', error);
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
