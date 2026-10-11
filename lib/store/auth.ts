"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { api } from "@/lib/api/client";
import { hasActiveSessionMarker, markSessionActive, markSessionCleared } from "@/lib/api/session-marker";

interface AdminLoginResult {
  mfaRequired: boolean;
  mfaToken?: string;
  user?: User;
}

interface AuthState {
  user: User | null;
  hydrated: boolean;
  /** Re-validates the session against the server (the httpOnly cookie is the real source of truth — this store just mirrors it for instant UI). Call once on app mount. */
  fetchMe: () => Promise<void>;
  loginCustomer: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string, phone?: string) => Promise<void>;
  loginRetailer: (email: string, password: string) => Promise<void>;
  loginAdmin: (email: string, password: string) => Promise<AdminLoginResult>;
  verifyAdminMfa: (mfaToken: string, code: string) => Promise<void>;
  updateProfile: (fullName: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
}

/**
 * Real session store. Login/signup/logout call the API, which sets/clears
 * httpOnly session cookies (`ilkal_at`/`ilkal_rt`) — this store only mirrors
 * the resulting `user` object for the UI. `proxy.ts` verifies the JWT in
 * `ilkal_at` directly rather than reading anything from this store.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      hydrated: false,

      fetchMe: async () => {
        // Nothing on this browser suggests a session was ever established
        // (no successful login/signup has run since localStorage was last
        // cleared) — skip the network call entirely rather than firing a
        // request that can only ever come back 401. This is the actual fix
        // for the console noise, not just explaining the noise away: a
        // browser that's never logged in now makes zero auth requests on
        // page load.
        if (!hasActiveSessionMarker()) {
          set({ user: null, hydrated: true });
          return;
        }
        try {
          const { user } = await api.get<{ user: User }>("/auth/me");
          markSessionActive();
          set({ user, hydrated: true });
        } catch {
          markSessionCleared();
          set({ user: null, hydrated: true });
        }
      },

      loginCustomer: async (email, password) => {
        const { user } = await api.post<{ user: User }>("/auth/login", { email, password });
        markSessionActive();
        set({ user });
      },

      signup: async (fullName, email, password, phone) => {
        const { user } = await api.post<{ user: User }>("/auth/signup", { fullName, email, password, phone });
        markSessionActive();
        set({ user });
      },

      loginRetailer: async (email, password) => {
        const { user } = await api.post<{ user: User }>("/auth/retailer/login", { email, password });
        markSessionActive();
        set({ user });
      },

      loginAdmin: async (email, password) => {
        const result = await api.post<AdminLoginResult>("/auth/admin/login", { email, password });
        if (!result.mfaRequired && result.user) {
          markSessionActive();
          set({ user: result.user });
        }
        return result;
      },

      verifyAdminMfa: async (mfaToken, code) => {
        const { user } = await api.post<{ user: User }>("/auth/admin/mfa/verify", { mfaToken, code });
        markSessionActive();
        set({ user });
      },

      updateProfile: async (fullName, phone) => {
        const { user } = await api.patch<{ user: User }>("/auth/me", { fullName, phone });
        set({ user });
      },

      logout: async () => {
        await api.post("/auth/logout").catch(() => undefined);
        markSessionCleared();
        set({ user: null });
      },
    }),
    { name: "ilkal-auth", partialize: (state) => ({ user: state.user }) },
  ),
);
