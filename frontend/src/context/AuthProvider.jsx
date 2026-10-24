import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '../services/supabaseClient';
import api from '../services/api';
import { AuthContext } from './authContext';

// Loads the logged-in user's profile (name, role, email, ...).
// Primary source is our API — the backend verifies the token and reads our
// database. The direct Supabase read is only a fallback so the app still
// warms up if the backend is restarting (RLS lets a user read their own row).
async function fetchProfile(userId) {
  try {
    const { data } = await api.get('/auth/me');
    return data ?? null;
  } catch {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return error ? null : data;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileFailed, setProfileFailed] = useState(false);
  const [loading, setLoading] = useState(true); // auth + profile not resolved yet
  const [recovery, setRecovery] = useState(false); // user opened a password-recovery link
  const loadedForRef = useRef(null);

  const hydrate = useCallback(async (user) => {
    if (loadedForRef.current === user.id) return; // already loaded for this user
    loadedForRef.current = user.id;
    setProfileFailed(false);
    const next = await fetchProfile(user.id);
    setProfile(next);
    if (!next) setProfileFailed(true);
    setLoading(false);
  }, []);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      setSession(nextSession);

      if (event === 'PASSWORD_RECOVERY') setRecovery(true);

      if (event === 'SIGNED_OUT') {
        loadedForRef.current = null;
        setProfile(null);
        setProfileFailed(false);
        setRecovery(false);
        setLoading(false);
        return;
      }

      const user = nextSession?.user;
      if (user) hydrate(user);
      else setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [hydrate]);

  const signIn = useCallback(async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error };

    // Load the profile right away so the page can route by role.
    loadedForRef.current = data.user.id;
    setSession(data.session);
    setProfileFailed(false);
    const next = await fetchProfile(data.user.id);
    setProfile(next);
    if (!next) setProfileFailed(true);
    setLoading(false);
    return { user: data.user, profile: next };
  }, []);

  const signUp = useCallback(async ({ email, password, full_name, student_id, username, program, year_section }) => {
    // Supabase Auth creates the auth user; the handle_new_user trigger in the
    // database copies the extra fields into a new profiles row (always role student).
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name, student_id, username, program, year_section },
      },
    });
    if (error) return { error };

    // data.session is null when "Confirm email" is ON — the user must click
    // the link in their email before they get a session.
    if (data.session?.user) {
      loadedForRef.current = data.user.id;
      setSession(data.session);
      setProfileFailed(false);
      const next = await fetchProfile(data.user.id);
      setProfile(next);
      if (!next) setProfileFailed(true);
    }
    setLoading(false);
    return { user: data.user, needsConfirmation: !data.session };
  }, []);

  const signOut = useCallback(async () => {
    loadedForRef.current = null;
    setProfile(null);
    setProfileFailed(false);
    setRecovery(false);
    setSession(null);
    await supabase.auth.signOut();
  }, []);

  const sendResetEmail = useCallback(async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error ?? null };
  }, []);

  const updatePassword = useCallback(async (password) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error ?? null };
  }, []);

  const refreshProfile = useCallback(async () => {
    const {
      data: { session: current },
    } = await supabase.auth.getSession();
    if (!current?.user) return null;
    loadedForRef.current = current.user.id;
    const next = await fetchProfile(current.user.id);
    setProfile(next ?? null);
    return next;
  }, []);

  const value = useMemo(
    () => ({
      session,
      profile,
      profileFailed,
      loading,
      recovery,
      signIn,
      signUp,
      signOut,
      sendResetEmail,
      updatePassword,
      refreshProfile,
    }),
    [session, profile, profileFailed, loading, recovery, signIn, signUp, signOut, sendResetEmail, updatePassword, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
