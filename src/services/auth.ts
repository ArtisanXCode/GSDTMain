import { supabase } from '../lib/supabase';

export interface SignUpData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface SignInData {
  email: string;
  password: string;
}

export const authService = {
  async signUp(data: SignUpData) {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard?from=auth&new=true`,
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
        }
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    // Send welcome email if signup successful
    if (authData.user && !error) {
      try {
        await fetch('/api/send-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to: data.email,
            type: 'welcome',
            data: {
              firstName: data.firstName || 'User',
              kycUrl: `${window.location.origin}/dashboard`
            }
          })
        });
      } catch (emailError) {
        console.warn('Failed to send welcome email:', emailError);
        // Don't throw error as signup was successful
      }
    }

    return authData;
  },

  async signIn(data: SignInData) {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return authData;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }
  },

  async getCurrentUser() {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      throw new Error(error.message);
    }

    return user;
  }
};

export const signInWithWallet = async (address: string): Promise<void> => {
  try {
    // Create a deterministic password from the wallet address
    const password = `wallet_${address.toLowerCase()}`;

    // Try to sign in first
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: `${address.toLowerCase()}@wallet.local`,
      password: password,
    });

    if (signInError) {
      // If sign in fails, try to sign up
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: `${address.toLowerCase()}@wallet.local`,
        password: password,
        options: {
          data: {
            wallet_address: address.toLowerCase()
          }
        }
      });

      if (signUpError) {
        throw signUpError;
      }
    } else {
      // Update user metadata with wallet address if not present
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          wallet_address: address.toLowerCase()
        }
      });

      if (updateError) {
        console.warn('Could not update user metadata:', updateError);
      }
    }
  } catch (error) {
    console.error('Error signing in with wallet:', error);
    throw error;
  }
};