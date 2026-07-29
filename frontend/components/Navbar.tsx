"use client";

import { ShieldCheck, LogOut, ShieldAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/axios";
import { clearTokens, getRefreshToken } from "@/lib/auth";
import { useUser } from "@/lib/useUser";
import StatusDot from "./StatusDot";

export default function Navbar() {
  const router = useRouter();
  const { user, isLoading } = useUser();

  async function handleLogout() {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
    } catch {
      // Even if the server call fails, log the user out locally.
    } finally {
      clearTokens();
      toast.success("Logged out successfully");
      router.push("/login");
    }
  }

  const initials = user?.fullName
    ? user.fullName
        .split(" ")
        .map((part) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-white/80 px-6 backdrop-blur-md">
      <div className="flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-signal text-white">
          <ShieldCheck className="h-4.5 w-4.5" />
        </div>
        <span className="font-display text-[15px] font-semibold text-ink">
          SecureScholar
        </span>
      </div>

      <div className="flex items-center gap-4">
        {!isLoading && user && (
          <div className="hidden items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 sm:flex">
            {user.mfaEnabled ? (
              <StatusDot color="success" />
            ) : (
              <ShieldAlert className="h-3.5 w-3.5 text-warning" />
            )}
            <span className="font-mono text-xs text-slate">
              {user.mfaEnabled ? "MFA active" : "MFA not enabled"}
            </span>
          </div>
        )}

        {!isLoading && user && (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-signal-light font-display text-xs font-semibold text-signal-dark">
              {initials}
            </div>
            <div className="hidden leading-tight sm:block">
              <p className="text-sm font-medium text-ink">{user.fullName}</p>
              <p className="text-xs capitalize text-slate">{user.role}</p>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-slate transition-colors hover:bg-surface hover:text-danger"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Log out</span>
        </button>
      </div>
    </header>
  );
}
