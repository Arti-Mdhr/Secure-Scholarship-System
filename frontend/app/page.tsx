"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getAccessToken } from "@/lib/auth";

// Kept intentionally simple, matching lib/useRequireAuth.ts: only checks
// whether a token exists. Actual expiry/refresh is handled by the axios
// interceptor once a request is made — this route just decides which
// screen to send the user to first.
export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = getAccessToken();
    router.replace(token ? "/dashboard" : "/login");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-signal" />
    </main>
  );
}
