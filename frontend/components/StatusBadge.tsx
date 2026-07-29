export type ApplicationStatus =
  | "draft"
  | "submitted"
  | "under_review"
  | "approved"
  | "rejected";

interface StatusConfigEntry {
  label: string;
  className: string;
}

const statusConfig: Record<ApplicationStatus, StatusConfigEntry> = {
  draft: { label: "Draft", className: "bg-surface text-slate border border-border" },
  submitted: { label: "Submitted", className: "bg-signal-light text-signal-dark" },
  under_review: { label: "Under review", className: "bg-warning-light text-warning" },
  approved: { label: "Approved", className: "bg-success-light text-success" },
  rejected: { label: "Rejected", className: "bg-danger-light text-danger" },
};

export default function StatusBadge({ status }: { status: ApplicationStatus }) {
  const config = statusConfig[status] ?? statusConfig.draft;

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}