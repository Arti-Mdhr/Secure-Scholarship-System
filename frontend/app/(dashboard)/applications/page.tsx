"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Inbox, FilePlus2, Search } from "lucide-react";
import api from "@/lib/axios";
import Card from "@/components/Card";
import Button from "@/components/Button";
import StatusBadge, { ApplicationStatus } from "@/components/StatusBadge";

interface Application {
  _id: string;
  scholarshipTitle: string;
  university: string;
  program: string;
  status: ApplicationStatus;
  updatedAt: string;
}

const filterTabs: { value: ApplicationStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function ApplicationsListPage() {
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<ApplicationStatus | "all">("all");
  const [search, setSearch] = useState("");

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

  const filtered = useMemo(() => {
    if (!applications) return [];
    return applications
      .filter((app) => activeFilter === "all" || app.status === activeFilter)
      .filter((app) =>
        app.scholarshipTitle.toLowerCase().includes(search.trim().toLowerCase())
      )
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [applications, activeFilter, search]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: applications?.length ?? 0 };
    for (const app of applications ?? []) {
      map[app.status] = (map[app.status] ?? 0) + 1;
    }
    return map;
  }, [applications]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            My applications
          </h1>
          <p className="mt-1 text-sm text-slate">
            All your scholarship applications in one place.
          </p>
        </div>
        <Link href="/applications/new">
          <Button>
            <FilePlus2 className="h-4 w-4" />
            New application
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveFilter(tab.value)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                activeFilter === tab.value
                  ? "bg-signal text-white"
                  : "bg-white text-slate hover:bg-surface"
              }`}
            >
              {tab.label}
              {counts[tab.value] ? (
                <span
                  className={`ml-1.5 ${
                    activeFilter === tab.value ? "text-white/80" : "text-slate-light"
                  }`}
                >
                  {counts[tab.value]}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-56">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-light" />
          <input
            type="text"
            placeholder="Search by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-white py-2 pl-9 pr-3 text-sm text-ink placeholder:text-slate-light focus:outline-none focus:ring-2 focus:ring-signal/40 focus:border-signal"
          />
        </div>
      </div>

      <Card>
        {isLoading ? (
          <div className="flex justify-center py-14">
            <Loader2 className="h-5 w-5 animate-spin text-signal" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center py-14 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface">
              <Inbox className="h-5 w-5 text-slate-light" />
            </div>
            <p className="text-sm font-medium text-ink">
              {applications && applications.length > 0
                ? "No applications match this filter"
                : "No applications yet"}
            </p>
            {(!applications || applications.length === 0) && (
              <>
                <p className="mt-1 text-sm text-slate">
                  Start your first scholarship application to see it here.
                </p>
                <Link href="/applications/new" className="mt-4">
                  <Button size="sm">
                    <FilePlus2 className="h-4 w-4" />
                    Start an application
                  </Button>
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((app) => (
              <Link
                key={app._id}
                href={`/applications/${app._id}`}
                className="flex items-center justify-between gap-4 py-4 transition-colors hover:bg-surface"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">
                    {app.scholarshipTitle}
                  </p>
                  <p className="truncate text-xs text-slate">
                    {app.university} · {app.program}
                  </p>
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