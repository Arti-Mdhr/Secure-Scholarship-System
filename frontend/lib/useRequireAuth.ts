"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccessToken } from "./auth";

/**
 * Gate for protected pages. Redirects to /login if there's no access
 * token at all. Token *expiry* is handled separately by the axios
 * interceptor (lib/axios.ts), which transparently refreshes on 401s
 * and redirects to /login if the refresh itself fails.
 */
export function useRequireAuth() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- token presence can only be known client-side, so this one-time check has to run in an effect
    setIsChecking(false);
  }, [router]);

  return { isChecking };
}