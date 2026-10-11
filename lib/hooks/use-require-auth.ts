"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth";

/** Returns a wrapper that runs `action` only when signed in — otherwise redirects to /login. Used to gate add-to-cart/wishlist so guests can't build local-only state that never reaches the account they eventually sign into. */
export function useRequireAuth() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  return (action: () => void) => {
    if (!user) {
      router.push("/login");
      return;
    }
    action();
  };
}
