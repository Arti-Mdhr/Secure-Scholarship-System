"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FileText,
  Clock,
  CheckCircle2,
  FilePlus2,
  Loader2,
  Inbox,
  ArrowRight,
} from "lucide-react";
import api from "@/lib/axios";
import { useUser } from "@/lib/useUser";
import Card from "@/components/Card";
import Button from "@/components/Button";
import StatusBadge, { ApplicationStatus } from "@/components/StatusBadge";
import { useRouter } from "next/navigation";

interface Application {
  _id: string;
  scholarshipTitle: string;
  university: string;
  status: ApplicationStatus;
  updatedAt: string;
}

export default function DashboardPage() {
  const { user } = useUser();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.role === "admin") {
      router.replace("/admin/applications");
    }
  }, [user, router]);

  useEffect(() => {
    let isMounted = true;

    api
      .get("/applications")
      .then((res) => {
        if (isMounted) setApplications(res.data.applications);
      })
      .catch(() => {
        if (isMounted) setApplications([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const total = applications?.length ?? 0;
  const drafts = applications?.filter((a) => a.status === "draft").length ?? 0;
  const inReview =
    applications?.filter(
      (a) => a.status === "submitted" || a.status === "under_review"
    ).length ?? 0;
  const approved = applications?.filter((a) => a.status === "approved").length ?? 0;

  const recent = [...(applications ?? [])]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);

  const stats = [
    { label: "Total applications", value: total, icon: FileText },
    { label: "Drafts", value: drafts, icon: FilePlus2 },
    { label: "In review", value: inReview, icon: Clock },
    { label: "Approved", value: approved, icon: CheckCircle2 },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            Welcome back{user?.fullName ? `, ${user.fullName.split(" ")[0]}` : ""}
          </h1>
          <p className="mt-1 text-sm text-slate">
            Here&apos;s where your scholarship applications stand.
          </p>
        </div>
        <Link href="/applications/new">
          <Button>
            <FilePlus2 className="h-4 w-4" />
            New application
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat, i) => (
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
                    {isLoading ? "—" : stat.value}
                  </p>
                  <p className="text-xs text-slate">{stat.label}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card>
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-ink">
            Recent applications
          </h2>
          {total > 0 && (
            <Link
              href="/applications"
              className="flex items-center gap-1 text-sm font-medium text-signal hover:text-signal-dark"
            >
              View all
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-signal" />
          </div>
        ) : recent.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface">
              <Inbox className="h-5 w-5 text-slate-light" />
            </div>
            <p className="text-sm font-medium text-ink">No applications yet</p>
            <p className="mt-1 text-sm text-slate">
              Start your first scholarship application to see it here.
            </p>
            <Link href="/applications/new" className="mt-4">
              <Button size="sm">
                <FilePlus2 className="h-4 w-4" />
                Start an application
              </Button>
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recent.map((app) => (
              <Link
                key={app._id}
                href={`/applications/${app._id}`}
                className="flex items-center justify-between gap-4 py-3.5 transition-colors hover:bg-surface"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">
                    {app.scholarshipTitle}
                  </p>
                  <p className="truncate text-xs text-slate">{app.university}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="hidden font-mono text-xs text-slate-light sm:inline">
                    {new Date(app.updatedAt).toLocaleDateString()}
                  </span>
                  <StatusBadge status={app.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}