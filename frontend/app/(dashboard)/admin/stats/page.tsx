"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserCheck,
  UserX,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
} from "lucide-react";
import api from "@/lib/axios";
import Card from "@/components/Card";

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  disabledUsers: number;
  totalApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  pendingApplications: number;
}

export default function AdminStatsPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    api
      .get("/admin/stats")
      .then((res) => {
        if (isMounted) setStats(res.data.stats);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const userStats = [
    { label: "Total users", value: stats?.totalUsers, icon: Users },
    { label: "Active", value: stats?.activeUsers, icon: UserCheck },
    { label: "Disabled", value: stats?.disabledUsers, icon: UserX },
  ];

  const applicationStats = [
    { label: "Total applications", value: stats?.totalApplications, icon: FileText },
    { label: "Pending review", value: stats?.pendingApplications, icon: Clock },
    { label: "Approved", value: stats?.approvedApplications, icon: CheckCircle2 },
    { label: "Rejected", value: stats?.rejectedApplications, icon: XCircle },
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-signal" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">
          Statistics
        </h1>
        <p className="mt-1 text-sm text-slate">
          A snapshot of platform activity.
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-light">
          Users
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {userStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
            >
              <Card>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-signal-light text-signal">
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-display text-2xl font-semibold text-ink">
                      {stat.value ?? "—"}
                    </p>
                    <p className="text-xs text-slate">{stat.label}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-light">
          Applications
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {applicationStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: i * 0.05 }}
            >
              <Card padding="sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-signal-light text-signal">
                    <stat.icon className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <p className="font-display text-xl font-semibold text-ink">
                      {stat.value ?? "—"}
                    </p>
                    <p className="text-xs text-slate">{stat.label}</p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}