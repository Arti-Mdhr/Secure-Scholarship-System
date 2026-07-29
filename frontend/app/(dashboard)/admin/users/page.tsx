"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Search, ShieldCheck, UserX, UserCheck } from "lucide-react";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import api from "@/lib/axios";
import Card from "@/components/Card";
import Button from "@/components/Button";

interface AdminUser {
  _id: string;
  fullName: string;
  email: string;
  studentId: string;
  role: "student" | "admin";
  isActive: boolean;
  mfaEnabled: boolean;
  emailVerified: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    api
      .get("/admin/users")
      .then((res) => {
        if (isMounted) setUsers(res.data.users);
      })
      .catch(() => {
        if (isMounted) toast.error("Failed to load users");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!users) return [];
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.studentId.toLowerCase().includes(q)
    );
  }, [users, search]);

  async function handleToggleActive(user: AdminUser) {
    setPendingId(user._id);
    const action = user.isActive ? "disable" : "enable";

    try {
      await api.patch(`/admin/users/${user._id}/${action}`);
      setUsers((prev) =>
        prev
          ? prev.map((u) =>
              u._id === user._id ? { ...u, isActive: !u.isActive } : u
            )
          : prev
      );
      toast.success(`User ${action}d`);
    } catch (error) {
      if (isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(`Failed to ${action} user`);
      }
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Users</h1>
        <p className="mt-1 text-sm text-slate">
          Manage student and admin accounts.
        </p>
      </div>

      <div className="relative w-full sm:w-72">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-light" />
        <input
          type="text"
          placeholder="Search by name, email, or student ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-white py-2 pl-9 pr-3 text-sm text-ink placeholder:text-slate-light focus:outline-none focus:ring-2 focus:ring-signal/40 focus:border-signal"
        />
      </div>

      <Card padding="sm">
        {isLoading ? (
          <div className="flex justify-center py-14">
            <Loader2 className="h-5 w-5 animate-spin text-signal" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs text-slate-light">
                  <th className="px-3 py-2.5 font-medium">Name</th>
                  <th className="px-3 py-2.5 font-medium">Email</th>
                  <th className="px-3 py-2.5 font-medium">Student ID</th>
                  <th className="px-3 py-2.5 font-medium">Role</th>
                  <th className="px-3 py-2.5 font-medium">MFA</th>
                  <th className="px-3 py-2.5 font-medium">Status</th>
                  <th className="px-3 py-2.5 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map((u) => (
                  <tr key={u._id}>
                    <td className="px-3 py-3 font-medium text-ink">{u.fullName}</td>
                    <td className="px-3 py-3 font-mono text-xs text-slate">{u.email}</td>
                    <td className="px-3 py-3 font-mono text-xs text-slate">{u.studentId}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                          u.role === "admin"
                            ? "bg-signal-light text-signal-dark"
                            : "bg-surface text-slate border border-border"
                        }`}
                      >
                        {u.role === "admin" && <ShieldCheck className="h-3 w-3" />}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`text-xs ${
                          u.mfaEnabled ? "text-success" : "text-slate-light"
                        }`}
                      >
                        {u.mfaEnabled ? "Enabled" : "Off"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                          u.isActive
                            ? "bg-success-light text-success"
                            : "bg-danger-light text-danger"
                        }`}
                      >
                        {u.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <Button
                        size="sm"
                        variant={u.isActive ? "danger" : "secondary"}
                        isLoading={pendingId === u._id}
                        onClick={() => handleToggleActive(u)}
                      >
                        {u.isActive ? (
                          <>
                            <UserX className="h-3.5 w-3.5" />
                            Disable
                          </>
                        ) : (
                          <>
                            <UserCheck className="h-3.5 w-3.5" />
                            Enable
                          </>
                        )}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}