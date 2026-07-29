"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Inbox, ChevronDown, Check, X, Clock3 } from "lucide-react";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import api from "@/lib/axios";
import Card from "@/components/Card";
import Button from "@/components/Button";
import Textarea from "@/components/Textarea";
import StatusBadge, { ApplicationStatus } from "@/components/StatusBadge";

interface AdminApplication {
  _id: string;
  scholarshipTitle: string;
  university: string;
  program: string;
  status: ApplicationStatus;
  reviewerComments?: string;
  updatedAt: string;
  applicant: {
    _id: string;
    fullName: string;
    email: string;
    studentId: string;
  } | null;
}

const filterTabs: { value: ApplicationStatus | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "draft", label: "Draft" },
];

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<AdminApplication[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<ApplicationStatus | "all">(
    "submitted"
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    api
      .get("/admin/applications")
      .then((res) => {
        if (isMounted) setApplications(res.data.applications);
      })
      .catch(() => {
        if (isMounted) toast.error("Failed to load applications");
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
    return applications.filter(
      (app) => activeFilter === "all" || app.status === activeFilter
    );
  }, [applications, activeFilter]);

  function toggleExpand(app: AdminApplication) {
    if (expandedId === app._id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(app._id);
    setComment(app.reviewerComments ?? "");
  }

  async function handleReview(
    app: AdminApplication,
    status: "under_review" | "approved" | "rejected"
  ) {
    setPendingAction(`${app._id}:${status}`);
    try {
      const res = await api.patch(`/admin/applications/${app._id}/status`, {
        status,
        reviewerComments: comment,
      });
      setApplications((prev) =>
        prev
          ? prev.map((a) => (a._id === app._id ? res.data.application : a))
          : prev
      );
      toast.success(`Marked as ${status.replace("_", " ")}`);
      setExpandedId(null);
    } catch (error) {
      if (isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Failed to update status");
      }
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">
          Applications
        </h1>
        <p className="mt-1 text-sm text-slate">
          Review submitted scholarship applications.
        </p>
      </div>

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
            <p className="text-sm text-slate">No applications in this view.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((app) => {
              const isExpanded = expandedId === app._id;
              const canReview = app.status !== "draft";

              return (
                <div key={app._id} className="px-2 py-1">
                  <button
                    onClick={() => canReview && toggleExpand(app)}
                    disabled={!canReview}
                    className={`flex w-full items-center justify-between gap-4 py-3 text-left ${
                      canReview ? "" : "cursor-default opacity-70"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">
                        {app.scholarshipTitle}
                      </p>
                      <p className="truncate text-xs text-slate">
                        {app.applicant?.fullName ?? "Unknown applicant"} ·{" "}
                        <span className="font-mono">
                          {app.applicant?.email ?? "—"}
                        </span>
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className="hidden font-mono text-xs text-slate-light sm:inline">
                        {new Date(app.updatedAt).toLocaleDateString()}
                      </span>
                      <StatusBadge status={app.status} />
                      {canReview && (
                        <ChevronDown
                          className={`h-4 w-4 text-slate-light transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="space-y-3 pb-4">
                      <Textarea
                        label="Reviewer comments"
                        placeholder="Optional notes for this decision..."
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          isLoading={pendingAction === `${app._id}:under_review`}
                          onClick={() => handleReview(app, "under_review")}
                        >
                          <Clock3 className="h-3.5 w-3.5" />
                          Mark under review
                        </Button>
                        <Button
                          size="sm"
                          isLoading={pendingAction === `${app._id}:approved`}
                          onClick={() => handleReview(app, "approved")}
                        >
                          <Check className="h-3.5 w-3.5" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          isLoading={pendingAction === `${app._id}:rejected`}
                          onClick={() => handleReview(app, "rejected")}
                        >
                          <X className="h-3.5 w-3.5" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}