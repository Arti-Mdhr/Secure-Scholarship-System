"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "framer-motion";
import { KeyRound, ArrowLeft, Check, X, MailCheck } from "lucide-react";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import api from "@/lib/axios";
import Card from "@/components/Card";
import Input from "@/components/Input";
import Button from "@/components/Button";

type Step = "request" | "reset";

const requestSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});
type RequestForm = z.infer<typeof requestSchema>;

const resetSchema = z
  .object({
    otp: z.string().length(6, "Enter the 6-digit code from your email"),
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
  });
type ResetForm = z.infer<typeof resetSchema>;

const passwordRules = [
  { test: (v: string) => v.length >= 12, label: "At least 12 characters" },
  { test: (v: string) => /[A-Z]/.test(v), label: "One uppercase letter" },
  { test: (v: string) => /[a-z]/.test(v), label: "One lowercase letter" },
  { test: (v: string) => /[0-9]/.test(v), label: "One number" },
  { test: (v: string) => /[^A-Za-z0-9]/.test(v), label: "One special character" },
];

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("request");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requestForm = useForm<RequestForm>({
    resolver: zodResolver(requestSchema),
    defaultValues: { email: "" },
  });

  const resetForm = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
    defaultValues: { otp: "", newPassword: "", confirmPassword: "" },
  });

  const watchedPassword = resetForm.watch("newPassword");

  async function onRequestSubmit(data: RequestForm) {
    setIsSubmitting(true);
    try {
      // Backend always returns 200 here regardless of whether the account
      // exists, to avoid leaking which emails are registered.
      await api.post("/auth/request-password-reset", { email: data.email });
      setEmail(data.email);
      setStep("reset");
      toast.success("If that account exists, a code has been sent");
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 429) {
        toast.error("Too many requests. Please wait before trying again.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onResetSubmit(data: ResetForm) {
    setIsSubmitting(true);
    try {
      await api.post("/auth/reset-password", {
        email,
        otp: data.otp,
        newPassword: data.newPassword,
      });
      toast.success("Password reset — sign in with your new password");
      router.push("/login");
    } catch (error) {
      if (isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message;

        if (status === 400 && message?.toLowerCase().includes("otp")) {
          resetForm.setError("otp", { message });
        } else if (status === 429) {
          toast.error("Too many attempts. Please wait before trying again.");
        } else {
          toast.error(message || "Password reset failed. Please try again.");
        }
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-signal text-white">
            {step === "request" ? (
              <MailCheck className="h-5.5 w-5.5" />
            ) : (
              <KeyRound className="h-5.5 w-5.5" />
            )}
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            {step === "request" ? "Reset your password" : "Enter reset code"}
          </h1>
          <p className="mt-1.5 text-sm text-slate">
            {step === "request"
              ? "We'll email you a 6-digit code to reset your password."
              : `Enter the code sent to ${email} and choose a new password.`}
          </p>
        </div>

        <Card padding="lg">
          <AnimatePresence mode="wait">
            {step === "request" ? (
              <motion.form
                key="request"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                onSubmit={requestForm.handleSubmit(onRequestSubmit)}
                noValidate
                className="space-y-4"
              >
                <Input
                  label="Email"
                  type="email"
                  placeholder="jane@university.edu"
                  error={requestForm.formState.errors.email?.message}
                  {...requestForm.register("email")}
                />

                <Button type="submit" className="w-full" isLoading={isSubmitting}>
                  Send reset code
                </Button>
              </motion.form>
            ) : (
              <motion.form
                key="reset"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                onSubmit={resetForm.handleSubmit(onResetSubmit)}
                noValidate
                className="space-y-4"
              >
                <Input
                  label="Reset code"
                  mono
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  error={resetForm.formState.errors.otp?.message}
                  className="text-center text-lg tracking-[0.5em]"
                  {...resetForm.register("otp", {
                    onChange: (e) => {
                      e.target.value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    },
                  })}
                />

                <div>
                  <Input
                    label="New password"
                    type="password"
                    error={resetForm.formState.errors.newPassword?.message}
                    {...resetForm.register("newPassword")}
                  />
                  {watchedPassword?.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {passwordRules.map((rule) => {
                        const passed = rule.test(watchedPassword);
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
                  error={resetForm.formState.errors.confirmPassword?.message}
                  {...resetForm.register("confirmPassword")}
                />

                <Button type="submit" className="w-full" isLoading={isSubmitting}>
                  Reset password
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setStep("request");
                    resetForm.reset();
                  }}
                  className="flex w-full items-center justify-center gap-1.5 text-sm font-medium text-slate hover:text-ink"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Use a different email
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </Card>

        <p className="mt-6 text-center text-sm text-slate">
          Remembered your password?{" "}
          <Link href="/login" className="font-medium text-signal hover:text-signal-dark">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
