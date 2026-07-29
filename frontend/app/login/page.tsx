"use client";

import { useState, useRef, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ShieldCheck, KeyRound, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import ReCAPTCHA from "react-google-recaptcha";
import api from "@/lib/axios";
import { setTokens,decodeAccessToken } from "@/lib/auth";
import Card from "@/components/Card";
import Input from "@/components/Input";
import Button from "@/components/Button";
import Recaptcha from "@/components/Recaptcha";


type Step = "credentials" | "mfa";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("credentials");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");

  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    mfaCode?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [recaptchaError, setRecaptchaError] = useState<string | undefined>();
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  function handleAuthSuccess(accessToken: string, refreshToken: string) {
    setTokens(accessToken, refreshToken);
    toast.success("Welcome back");
    
const payload = decodeAccessToken(accessToken);
    router.push(payload?.role === "admin" ? "/admin/applications" : "/dashboard");
  }

  async function handleCredentialsSubmit(e: FormEvent) {
    e.preventDefault();

    const nextErrors: typeof errors = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = "Enter a valid email address";
    if (!password) nextErrors.password = "Enter your password";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (!recaptchaToken) {
      setRecaptchaError("Please complete the reCAPTCHA check");
      return;
    }
    setRecaptchaError(undefined);

    setIsSubmitting(true);
    try {
      const res = await api.post("/auth/login", { email, password, recaptchaToken });

      if (res.data.mfaRequired) {
        setStep("mfa");
        return;
      }

      handleAuthSuccess(res.data.accessToken, res.data.refreshToken);
    } catch (error) {
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);

      if (isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message;

        if (status === 401) {
          setErrors({ password: "Incorrect email or password" });
        } else if (status === 403) {
          toast.error(message || "Your account can't sign in right now");
        } else if (status === 423) {
          toast.error(message || "Account temporarily locked. Try again later.");
        } else {
          toast.error(message || "Login failed. Please try again.");
        }
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleMfaSubmit(e: FormEvent) {
    e.preventDefault();

    if (mfaCode.trim().length !== 6) {
      setErrors({ mfaCode: "Enter the 6-digit code from your authenticator app" });
      return;
    }
    setErrors({});

    setIsSubmitting(true);
    try {
      const res = await api.post("/auth/mfa/login", {
        email,
        token: mfaCode.trim(),
      });

      handleAuthSuccess(res.data.accessToken, res.data.refreshToken);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 401) {
        setErrors({ mfaCode: "Invalid code. Please try again." });
      } else {
        toast.error("MFA verification failed. Please try again.");
      }
      setMfaCode("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-signal text-white">
            <ShieldCheck className="h-5.5 w-5.5" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            {step === "credentials" ? "Sign in" : "Two-factor verification"}
          </h1>
          <p className="mt-1.5 text-sm text-slate">
            {step === "credentials"
              ? "Welcome back to your scholarship account."
              : `Enter the 6-digit code for ${email}`}
          </p>
        </div>

        <Card padding="lg">
          <AnimatePresence mode="wait">
            {step === "credentials" ? (
              <motion.form
                key="credentials"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                onSubmit={handleCredentialsSubmit}
                noValidate
                className="space-y-4"
              >
                <Input
                  label="Email"
                  type="email"
                  placeholder="jane@university.edu"
                  value={email}
                  error={errors.email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  error={errors.password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <div className="flex justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-sm font-medium text-signal hover:text-signal-dark"
                  >
                    Forgot password?
                  </Link>
                </div>

                <div className="flex justify-center">
                  <Recaptcha
                    ref={recaptchaRef}
                    onChange={(token) => {
                      setRecaptchaToken(token);
                      if (token) setRecaptchaError(undefined);
                    }}
                    error={recaptchaError}
                  />
                </div>

                <Button type="submit" className="w-full" isLoading={isSubmitting}>
                  Sign in
                </Button>
              </motion.form>
            ) : (
              <motion.form
                key="mfa"
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                onSubmit={handleMfaSubmit}
                noValidate
                className="space-y-4"
              >
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-signal-light">
                  <KeyRound className="h-6 w-6 text-signal" />
                </div>

                <Input
                  label="Authentication code"
                  mono
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={mfaCode}
                  error={errors.mfaCode}
                  onChange={(e) =>
                    setMfaCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  className="text-center text-lg tracking-[0.5em]"
                />

                <Button type="submit" className="w-full" isLoading={isSubmitting}>
                  Verify
                </Button>

                <button
                  type="button"
                  onClick={() => {
                    setStep("credentials");
                    setMfaCode("");
                    setErrors({});
                  }}
                  className="flex w-full items-center justify-center gap-1.5 text-sm font-medium text-slate hover:text-ink"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to sign in
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </Card>

        {step === "credentials" && (
          <p className="mt-6 text-center text-sm text-slate">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-signal hover:text-signal-dark">
              Create one
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}