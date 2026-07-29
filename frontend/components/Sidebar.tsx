"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  FilePlus2,
  Settings,
  Users,
  BarChart3,
  ShieldAlert,
  ClipboardCheck,
  ClipboardList,
} from "lucide-react";
import { useUser } from "@/lib/useUser";

const studentLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/applications", label: "My Applications", icon: FileText },
  { href: "/applications/new", label: "New Application", icon: FilePlus2 },
  { href: "/settings", label: "Settings", icon: Settings },
];

const adminLinks = [
  { href: "/admin/applications", label: "Applications", icon: ClipboardCheck },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/stats", label: "Statistics", icon: BarChart3 },
  { href: "/admin/security-events", label: "Security Events", icon: ShieldAlert },
  { href: "/admin/audit-logs", label: "Audit Logs", icon: ClipboardList },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();

  const isAdmin = user?.role === "admin";
  const links = isAdmin ? adminLinks : studentLinks;

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-white px-3 py-6 md:block">
      <nav className="flex flex-col gap-1">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wide text-slate-light">
          {isAdmin ? "Admin" : "Menu"}
        </p>
        {links.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                ${
                  isActive
                    ? "bg-signal-light text-signal-dark"
                    : "text-slate hover:bg-surface hover:text-ink"
                }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}