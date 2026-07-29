"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ShieldAlert,
  Copy,
  Check,
  X,
  Loader2,
  Download,
} from "lucide-react";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import api from "@/lib/axios";
import { useUser } from "@/lib/useUser";
import Card, { CardHeader } from "@/components/Card";
import Input from "@/components/Input";
import Button from "@/components/Button";
import StatusDot from "@/components/StatusDot";

type MfaStep = "idle" | "setup";

const passwordRules = [
  { test: (v: string) => v.length >= 12, label: "At least 12 characters" },
  { test: (v: string) => /[A-Z]/.test(v), label: "One uppercase letter" },
  { test: (v: string) => /[a-z]/.test(v), label: "One lowercase letter" },
  { test: (v: string) => /[0-9]/.test(v), label: "One number" },
  { test: (v: string) => /[^A-Za-z0-9]/.test(v), label: "One special character" },
];

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z
      .string()
      .min(12, "At least 12 characters")
      .regex(/[A-Z]/, "One uppercase letter")
      .regex(/[a-z]/, "One lowercase letter")
      .regex(/[0-9]/, "One number")
      .regex(/[^A-Za-z0-9]/, "One special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from your current password",
    path: ["newPassword"],
  });
type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export default function SettingsPage() {
  const { user, isLoading, refetch } = useUser();

  // --- MFA setup state (unchanged) ---
  const [mfaStep, setMfaStep] = useState<MfaStep>("idle");
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [isBusy, setIsBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  // --- Change password state ---
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const passwordForm = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });
  const watchedNewPassword = passwordForm.watch("newPassword");

  // --- Data export state ---
  const [isExporting, setIsExporting] = useState(false);

  async function handleStartSetup() {
    setIsBusy(true);
    try {
      const res = await api.post("/auth/mfa/setup");
      setQrCode(res.data.qrCode);
      setSecret(res.data.secret);
      setMfaStep("setup");
    } catch {
      toast.error("Couldn't start MFA setup. Please try again.");
    } finally {
      setIsBusy(false);
    }
  }

  async function handleVerify() {
    if (code.trim().length !== 6) {
      setError("Enter the 6-digit code from your authenticator app");
      return;
    }
    setError(undefined);
    setIsBusy(true);

    try {
      await api.post("/auth/mfa/verify", { token: code.trim() });
      toast.success("Two-factor authentication enabled");
      setMfaStep("idle");
      setCode("");
      setQrCode(null);
      setSecret(null);
      await refetch();
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 401) {
        setError("Invalid code. Please try again.");
      } else {
        toast.error("Verification failed. Please try again.");
      }
      setCode("");
    } finally {
      setIsBusy(false);
    }
  }

  function handleCopySecret() {
    if (!secret) return;
    navigator.clipboard.writeText(secret);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function onChangePassword(data: ChangePasswordForm) {
    setIsChangingPassword(true);
    try {
      await api.post("/auth/change-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      toast.success("Password changed successfully");
      passwordForm.reset();
    } catch (err) {
      if (isAxiosError(err)) {
        const status = err.response?.status;
        const message = err.response?.data?.message;

        if (status === 401) {
          passwordForm.setError("currentPassword", {
            message: "Current password is incorrect",
          });
        } else if (status === 400 && message?.toLowerCase().includes("reuse")) {
          passwordForm.setError("newPassword", { message });
        } else {
          toast.error(message || "Couldn't change password. Please try again.");
        }
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsChangingPassword(false);
    }
  }

  async function handleExportData() {
    setIsExporting(true);
    try {
      const res = await api.get("/users/me/export", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = `my-data-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Your data export has started downloading");
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 404) {
        toast.error("Data export isn't available yet. Please contact support.");
      } else {
        toast.error("Couldn't export your data. Please try again.");
      }
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">
          Settings
        </h1>
        <p className="mt-1 text-sm text-slate">
          Manage your account and security preferences.
        </p>
      </div>

      <Card>
        <CardHeader
          title="Account"
          description="Your registration details."
        />
        {isLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-signal" />
          </div>
        ) : user ? (
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-slate">Full name</dt>
              <dd className="mt-0.5 text-sm text-ink">{user.fullName}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate">Email</dt>
              <dd className="mt-0.5 font-mono text-sm text-ink">{user.email}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate">Student ID</dt>
              <dd className="mt-0.5 font-mono text-sm text-ink">{user.studentId}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate">Academic level</dt>
              <dd className="mt-0.5 text-sm capitalize text-ink">{user.academicLevel}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate">University</dt>
              <dd className="mt-0.5 text-sm text-ink">{user.university}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate">Program</dt>
              <dd className="mt-0.5 text-sm text-ink">{user.program}</dd>
            </div>
          </dl>
        ) : (
          <p className="text-sm text-slate">Couldn&apos;t load your profile.</p>
        )}
      </Card>

      <Card>
        <CardHeader
          title="Two-factor authentication"
          description="Add an extra layer of security to your account."
        />

        {user?.mfaEnabled ? (
          <div className="flex items-center gap-2.5 rounded-xl bg-success-light px-4 py-3">
            <StatusDot color="success" />
            <p className="text-sm font-medium text-success">
              Two-factor authentication is enabled
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {mfaStep === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between gap-4 rounded-xl bg-warning-light px-4 py-3"
              >
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="h-4 w-4 shrink-0 text-warning" />
                  <p className="text-sm text-warning">
                    Two-factor authentication is not enabled
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={handleStartSetup}
                  isLoading={isBusy}
                >
                  Enable
                </Button>
              </motion.div>
            )}

            {mfaStep === "setup" && (
              <motion.div
                key="setup"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                <div className="flex flex-col items-center gap-4 rounded-xl border border-border bg-surface p-6 sm:flex-row sm:items-start">
                  {qrCode && (
                    // eslint-disable-next-line @next/next/no-img-element -- data: URI from the backend, not an optimizable remote image
                    <img
                      src={qrCode}
                      alt="MFA QR code"
                      className="h-40 w-40 shrink-0 rounded-lg border border-border bg-white p-2"
                    />
                  )}
                  <div className="flex-1 text-sm text-slate">
                    <p className="font-medium text-ink">
                      1. Scan this QR code
                    </p>
                    <p className="mt-1">
                      Use Microsoft Authenticator, Google Authenticator, or
                      any TOTP app.
                    </p>

                    <p className="mt-3 font-medium text-ink">
                      Can&apos;t scan it?
                    </p>
                    <button
                      type="button"
                      onClick={handleCopySecret}
                      className="mt-1 flex items-center gap-1.5 rounded-lg border border-border bg-white px-2.5 py-1.5 font-mono text-xs text-ink transition-colors hover:bg-surface"
                    >
                      {secret}
                      {copied ? (
                        <Check className="h-3.5 w-3.5 text-success" />
                      ) : (
                        <Copy className="h-3.5 w-3.5 text-slate-light" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-ink">
                    2. Enter the 6-digit code
                  </p>
                  <div className="flex items-end gap-3">
                    <div className="flex-1">
                      <Input
                        mono
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="000000"
                        value={code}
                        error={error}
                        onChange={(e) =>
                          setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                        }
                        className="text-center text-lg tracking-[0.5em]"
                      />
                    </div>
                    <Button onClick={handleVerify} isLoading={isBusy}>
                      Verify & enable
                    </Button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setMfaStep("idle");
                    setQrCode(null);
                    setSecret(null);
                    setCode("");
                    setError(undefined);
                  }}
                  className="text-sm font-medium text-slate hover:text-ink"
                >
                  Cancel
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </Card>

      <Card>
        <CardHeader
          title="Change password"
          description="Choose a strong, unique password you haven't used before."
        />
        <form
          onSubmit={passwordForm.handleSubmit(onChangePassword)}
          noValidate
          className="space-y-4"
        >
          <Input
            label="Current password"
            type="password"
            error={passwordForm.formState.errors.currentPassword?.message}
            {...passwordForm.register("currentPassword")}
          />

          <div>
            <Input
              label="New password"
              type="password"
              error={passwordForm.formState.errors.newPassword?.message}
              {...passwordForm.register("newPassword")}
            />
            {watchedNewPassword?.length > 0 && (
              <ul className="mt-2 space-y-1">
                {passwordRules.map((rule) => {
                  const passed = rule.test(watchedNewPassword);
                  return (
                    <li
                      key={rule.label}
                      className={`flex items-center gap-1.5 text-xs ${
                        passed ? "text-success" : "text-slate-light"
                      }`}
                    >
                      {passed ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <X className="h-3 w-3" />
                      )}
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <Input
            label="Confirm new password"
            type="password"
            error={passwordForm.formState.errors.confirmPassword?.message}
            {...passwordForm.register("confirmPassword")}
          />

          <div className="flex justify-end">
            <Button type="submit" isLoading={isChangingPassword}>
              Update password
            </Button>
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader
          title="Data & privacy"
          description="Download a copy of your account, application, and document data."
        />
        <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-surface px-4 py-3">
          <p className="text-sm text-slate">
            Includes your profile, applications, and document metadata as a
            JSON file.
          </p>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportData}
            isLoading={isExporting}
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      </Card>
    </div>
  );
}
