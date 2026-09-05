import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { supabase } from "../lib/supabase";
import { authService } from "../services/scp/auth/authService";
import { personnelService } from "../services/personnel/personnelService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);

  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const [profile, setProfile] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState(null);

  /*
   * Tracks which authenticated user is CURRENTLY valid.
   *
   * This prevents an old profile request from overwriting
   * the profile of a newly logged-in account.
   */
  const activeUserIdRef = useRef(null);

  /*
   * Every profile request gets a sequence number.
   *
   * Only the newest request is allowed to update state.
   */
  const profileRequestRef = useRef(0);

  async function loadProfile(userId) {
    if (!userId) {
      profileRequestRef.current += 1;

      setProfile(null);
      setProfileError(null);
      setIsProfileLoading(false);

      return;
    }

    const requestId =
      ++profileRequestRef.current;

    /*
     * VERY IMPORTANT:
     * Remove the previous user's profile immediately.
     */
    setProfile(null);
    setProfileError(null);
    setIsProfileLoading(true);

    const { data, error } =
      await personnelService.getCurrentProfile(userId);

    /*
     * Ignore stale profile responses.
     *
     * Example:
     *
     * PERSONNEL request starts
     * ADMIN logs in
     * ADMIN request starts
     * PERSONNEL request finishes late
     *
     * Without this check:
     * PERSONNEL profile could overwrite ADMIN.
     */
    const isStaleRequest =
      requestId !== profileRequestRef.current;

    const userChanged =
      activeUserIdRef.current !== userId;

    if (isStaleRequest || userChanged) {
      console.warn(
        "[AUTH][PROFILE][STALE RESPONSE IGNORED]",
        {
          requestedUserId: userId,
          activeUserId:
            activeUserIdRef.current,
          requestId,
        }
      );

      return;
    }

    if (error) {
      console.error("[AUTH][PROFILE]", error);

      setProfile(null);
      setProfileError(error);
      setIsProfileLoading(false);

      return;
    }

    setProfile(data);
    setProfileError(null);
    setIsProfileLoading(false);
  }

  async function applySession(nextSession) {
    const nextUser =
      nextSession?.user ?? null;

    const nextUserId =
      nextUser?.id ?? null;

    /*
     * Mark this user as the currently authenticated identity
     * BEFORE loading their personnel profile.
     */
    activeUserIdRef.current =
      nextUserId;

    setSession(nextSession);
    setUser(nextUser);

    /*
     * Immediately clear previous authorization information.
     *
     * Never allow:
     *
     * new user
     * +
     * old user's role/clearance
     */
    setProfile(null);
    setProfileError(null);

    if (!nextUserId) {
      profileRequestRef.current += 1;

      setIsProfileLoading(false);
      return;
    }

    await loadProfile(nextUserId);
  }

  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      const {
        data: { session: initialSession },
        error,
      } = await supabase.auth.getSession();

      if (!isMounted) {
        return;
      }

      if (error) {
        console.error(
          "[AUTH][SESSION]",
          error
        );
      }

      await applySession(
        initialSession
      );

      if (isMounted) {
        setIsAuthLoading(false);
      }
    }

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        /*
         * We deliberately do not await this inside
         * the Supabase auth callback.
         */
        applySession(nextSession)
          .catch((error) => {
            console.error(
              "[AUTH][STATE CHANGE]",
              error
            );
          })
          .finally(() => {
            if (isMounted) {
              setIsAuthLoading(false);
            }
          });
      }
    );

    return () => {
      isMounted = false;

      /*
       * Invalidates any profile request
       * still running during unmount.
       */
      profileRequestRef.current += 1;

      subscription.unsubscribe();
    };
  }, []);

  async function logout() {
    const { error } =
      await authService.signOut();

    if (error) {
      console.error(
        "[AUTH][LOGOUT]",
        error
      );

      return {
        success: false,
        error,
      };
    }

    /*
     * Clear authorization state immediately.
     *
     * Don't wait exclusively for
     * onAuthStateChange().
     */
    activeUserIdRef.current = null;

    profileRequestRef.current += 1;

    setSession(null);
    setUser(null);

    setProfile(null);
    setProfileError(null);

    setIsProfileLoading(false);
    setIsAuthLoading(false);

    return {
      success: true,
      error: null,
    };
  }

  const value = {
    user,
    session,

    profile,
    isProfileLoading,
    profileError,

    role:
      profile?.role ?? null,

    clearanceLevel:
      profile?.clearanceLevel ?? 0,

    accountStatus:
      profile?.accountStatus ?? null,

    isAuthenticated:
      Boolean(user),

    isAuthLoading,

    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}