"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, ShieldAlert, Inbox } from "lucide-react";
import api from "@/lib/axios";
import Card from "@/components/Card";

type Severity = "low" | "medium" | "high" | "critical";

interface SecurityEvent {
  _id: string;
  eventType: string;
  severity: Severity;
  userId?: string;
  ipAddress?: string;
  description: string;
  detectedAt: string;
}

const severityConfig: Record<Severity, { label: string; className: string }> = {
  low: { label: "Low", className: "bg-surface text-slate border border-border" },
  medium: { label: "Medium", className: "bg-warning-light text-warning" },
  high: { label: "High", className: "bg-danger-light text-danger" },
  critical: { label: "Critical", className: "bg-danger text-white" },
};

const severityTabs: { value: Severity | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "critical", label: "Critical" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export default function AdminSecurityEventsPage() {
  const [events, setEvents] = useState<SecurityEvent[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSeverity, setActiveSeverity] = useState<Severity | "all">("all");

  useEffect(() => {
    let isMounted = true;

    api
      .get("/admin/security-events")
      .then((res) => {
        if (isMounted) setEvents(res.data.events);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!events) return [];
    return [...events]
      .filter((e) => activeSeverity === "all" || e.severity === activeSeverity)
      // The backend sorts by a field that isn't on this model, so
      // re-sort here by the field that actually exists.
      .sort(
        (a, b) => new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
      );
  }, [events, activeSeverity]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">
          Security events
        </h1>
        <p className="mt-1 text-sm text-slate">
          Audit trail of security-relevant activity across the platform.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {severityTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveSeverity(tab.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              activeSeverity === tab.value
                ? "bg-signal text-white"
                : "bg-white text-slate hover:bg-surface"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <Card padding="sm">
        {isLoading ? (
          <div className="flex justify-center py-14">
            <Loader2 className="h-5 w-5 animate-spin text-signal" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-14 text-center">
            <Inbox className="mb-2 h-5 w-5 text-slate-light" />
            <p className="text-sm text-slate">No security events to show.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((event) => (
              <div key={event._id} className="flex gap-3 px-2 py-3.5">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface">
                  <ShieldAlert className="h-4 w-4 text-slate-light" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-ink">
                      {event.eventType}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        severityConfig[event.severity]?.className ??
                        severityConfig.low.className
                      }`}
                    >
                      {severityConfig[event.severity]?.label ?? event.severity}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate">{event.description}</p>
                  <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 font-mono text-xs text-slate-light">
                    <span>{new Date(event.detectedAt).toLocaleString()}</span>
                    {event.ipAddress && <span>{event.ipAddress}</span>}
                    {event.userId && <span>user: {event.userId}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}