"use client";

import { useCallback, useEffect, useState } from "react";
import api from "./axios";

export interface User {
  _id: string;
  fullName: string;
  email: string;
  studentId: string;
  university: string;
  program: string;
  academicLevel: string;
  role: "student" | "admin";
  mfaEnabled: boolean;
  emailVerified: boolean;
  isActive: boolean;
}

/** Fetches the logged-in user's profile via GET /users/me. */
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await api.get("/users/me");
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount; fetchUser sets state once the request resolves
    fetchUser();
  }, [fetchUser]);

  return { user, isLoading, refetch: fetchUser };
}