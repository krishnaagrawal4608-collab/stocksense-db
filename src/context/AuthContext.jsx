import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DEMO_USER } from '../lib/sampleData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Initialize session
  useEffect(() => {
    let mounted = true;

    async function initializeAuth() {
      // Check if user previously logged in via Demo Mode
      const storedDemo = localStorage.getItem('stocksense_demo_auth');
      if (storedDemo === 'true') {
        if (mounted) {
          setUser(DEMO_USER);
          setProfile({
            id: DEMO_USER.id,
            full_name: DEMO_USER.user_metadata.full_name,
            email: DEMO_USER.email,
            role: DEMO_USER.role
          });
          setIsDemoMode(true);
          setLoading(false);
        }
        return;
      }

      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user && mounted) {
            setUser(session.user);
            await loadProfile(session.user.id);
          }
        } catch (error) {
          console.error('Error fetching Supabase session:', error);
        }

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session?.user) {
            setUser(session.user);
            setIsDemoMode(false);
            localStorage.removeItem('stocksense_demo_auth');
            await loadProfile(session.user.id);
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setProfile(null);
            setIsDemoMode(false);
            localStorage.removeItem('stocksense_demo_auth');
          }
        });

        if (mounted) setLoading(false);
        return () => subscription.unsubscribe();
      } else {
        // If Supabase not yet configured, provide demo user so the app is immediately navigable
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initializeAuth();
    return () => { mounted = false; };
  }, []);

  async function loadProfile(userId) {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setProfile(data);
      } else {
        // Fallback profile if row hasn't populated yet
        setProfile({
          id: userId,
          full_name: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Inventory Manager',
          email: user?.email,
          role: 'inventory_manager'
        });
      }
    } catch (e) {
      console.warn('Failed to load user profile from profiles table:', e.message);
    }
  }

  // 1. Sign up
  async function signUp(email, password, fullName) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      if (error) throw error;
      return data;
    } else {
      // Local demo signup
      const newUser = {
        id: 'u_' + Date.now(),
        email,
        user_metadata: { full_name: fullName },
        role: 'inventory_manager'
      };
      setUser(newUser);
      setProfile({
        id: newUser.id,
        full_name: fullName,
        email: email,
        role: 'inventory_manager'
      });
      setIsDemoMode(true);
      localStorage.setItem('stocksense_demo_auth', 'true');
      return { user: newUser };
    }
  }

  // 2. Sign in
  async function signIn(email, password) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      setUser(data.user);
      setIsDemoMode(false);
      localStorage.removeItem('stocksense_demo_auth');
      await loadProfile(data.user.id);
      return data;
    } else {
      // Simulated sign in
      const demoUser = {
        ...DEMO_USER,
        email
      };
      setUser(demoUser);
      setProfile({
        id: demoUser.id,
        full_name: demoUser.user_metadata.full_name,
        email: demoUser.email,
        role: demoUser.role
      });
      setIsDemoMode(true);
      localStorage.setItem('stocksense_demo_auth', 'true');
      return { user: demoUser };
    }
  }

  // 3. Quick Demo Login (for college viva / evaluators)
  function enterDemoMode() {
    setUser(DEMO_USER);
    setProfile({
      id: DEMO_USER.id,
      full_name: 'DBMS Faculty / Evaluator',
      email: 'evaluator@college.edu',
      role: 'inventory_manager'
    });
    setIsDemoMode(true);
    localStorage.setItem('stocksense_demo_auth', 'true');
  }

  // 4. Sign out
  async function signOut() {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Sign out error:', e);
      }
    }
    setUser(null);
    setProfile(null);
    setIsDemoMode(false);
    localStorage.removeItem('stocksense_demo_auth');
  }

  // 5. Password Reset Request
  async function resetPassword(email) {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return data;
    }
    return { message: 'Password reset link simulated for demo environment.' };
  }

  // 6. Update user profile
  async function updateProfileData({ fullName, role }) {
    if (isSupabaseConfigured && supabase && user) {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          role: role,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      if (error) throw error;
    }
    setProfile(prev => ({ ...prev, full_name: fullName, role: role }));
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isDemoMode,
        isSupabaseConfigured,
        signUp,
        signIn,
        signOut,
        resetPassword,
        enterDemoMode,
        updateProfileData
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
