"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, ClipboardList, Inbox, ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/lib/axios";
import Card from "@/components/Card";
import Button from "@/components/Button";

interface AuditLogUser {
  _id: string;
  fullName: string;
  email: string;
  role: "student" | "admin";
}

interface AuditLogEntry {
  _id: string;
  action: string;
  userId?: AuditLogUser | string;
  targetType?: string;
  targetId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Friendly labels for the AuditLog.action values your backend actually
// writes (verified against auth.controller.ts / application.controller.ts /
// admin.controller.ts / document.controller.ts). Anything not in this map
// just falls back to showing the raw action string.
const actionLabels: Record<string, string> = {
  USER_REGISTERED: "Account registered",
  LOGIN_SUCCESS: "Login",
  LOGIN_SUCCESS_MFA: "Login (MFA)",
  LOGOUT: "Logout",
  TOKEN_REFRESHED: "Session refreshed",
  MFA_ENABLED: "MFA enabled",
  EMAIL_VERIFIED: "Email verified",
  PASSWORD_CHANGED: "Password changed",
  PASSWORD_RESET_REQUEST: "Password reset requested",
  PASSWORD_RESET: "Password reset",
  APPLICATION_CREATED: "Application created",
  APPLICATION_UPDATED: "Application updated",
  APPLICATION_SUBMITTED: "Application submitted",
  APPLICATION_STATUS_UPDATED: "Application status changed",
  DOCUMENT_UPLOADED: "Document uploaded",
  DOCUMENT_DOWNLOADED: "Document downloaded",
  USER_DISABLED: "User disabled",
  USER_ENABLED: "User enabled",
};

function formatAction(action: string): string {
  return actionLabels[action] ?? action;
}

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[] | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState<string>("all");

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const params: Record<string, string | number> = { page, limit: 25 };
    if (actionFilter !== "all") params.action = actionFilter;

    api
      .get("/admin/audit-logs", { params })
      .then((res) => {
        if (!isMounted) return;
        setLogs(res.data.logs);
        setPagination(res.data.pagination);
      })
      .catch(() => {
        if (isMounted) setLogs([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [page, actionFilter]);

  const actionOptions = useMemo(
    () => ["all", ...Object.keys(actionLabels)],
    []
  );

  function handleFilterChange(value: string) {
    setActionFilter(value);
    setPage(1);
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">
          Audit logs
        </h1>
        <p className="mt-1 text-sm text-slate">
          Full record of account, application, and admin actions across the
          platform.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {actionOptions.map((value) => (
          <button
            key={value}
            onClick={() => handleFilterChange(value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              actionFilter === value
                ? "bg-signal text-white"
                : "bg-white text-slate hover:bg-surface"
            }`}
          >
            {value === "all" ? "All" : formatAction(value)}
          </button>
        ))}
      </div>

      <Card padding="sm">
        {isLoading ? (
          <div className="flex justify-center py-14">
            <Loader2 className="h-5 w-5 animate-spin text-signal" />
          </div>
        ) : !logs || logs.length === 0 ? (
          <div className="flex flex-col items-center py-14 text-center">
            <Inbox className="mb-2 h-5 w-5 text-slate-light" />
            <p className="text-sm text-slate">No audit log entries to show.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {logs.map((log) => {
              const user =
                typeof log.userId === "object" ? log.userId : undefined;
              return (
                <div key={log._id} className="flex gap-3 px-2 py-3.5">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface">
                    <ClipboardList className="h-4 w-4 text-slate-light" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-ink">
                        {formatAction(log.action)}
                      </span>
                      {log.targetType && (
                        <span className="rounded-full bg-surface px-2 py-0.5 text-xs text-slate">
                          {log.targetType}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-slate">
                      {user
                        ? `${user.fullName} (${user.email})`
                        : "Unauthenticated / system"}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-slate-light">
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                      {log.ipAddress && <span>{log.ipAddress}</span>}
                      {log.targetId && <span>target: {log.targetId}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-slate">
            Page {pagination.page} of {pagination.totalPages} ·{" "}
            {pagination.total} total entries
          </p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
