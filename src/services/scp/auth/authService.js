import { supabase } from "../../../lib/supabase";

export const authService = {
  async signUp(email, password) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    return {
      data,
      error,
    };
  },

  async signIn(email, password) {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      });

    return {
      data,
      error,
    };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();

    return {
      error,
    };
  },

  async getCurrentUser() {
    const { data, error } =
      await supabase.auth.getUser();

    return {
      user: data?.user ?? null,
      error,
    };
  },
};