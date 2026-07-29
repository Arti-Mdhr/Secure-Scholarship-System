"use client";

import { useState, useRef, FormEvent } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldCheck, MailCheck, Check, X } from "lucide-react";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import ReCAPTCHA from "react-google-recaptcha";
import api from "@/lib/axios";
import Card, { CardHeader } from "@/components/Card";
import Input from "@/components/Input";
import Select from "@/components/Select";
import Button from "@/components/Button";
import Recaptcha from "@/components/Recaptcha";

interface FormState {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  studentId: string;
  university: string;
  program: string;
  academicLevel: string;
  phoneNumber: string;
  dateOfBirth: string;
  country: string;
  address: string;
}

const initialForm: FormState = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  studentId: "",
  university: "",
  program: "",
  academicLevel: "",
  phoneNumber: "",
  dateOfBirth: "",
  country: "",
  address: "",
};

const academicLevelOptions = [
  { value: "undergraduate", label: "Undergraduate" },
  { value: "graduate", label: "Graduate" },
  { value: "postgraduate", label: "Postgraduate" },
  { value: "doctorate", label: "Doctorate" },
];

const passwordRules = [
  { test: (v: string) => v.length >= 12, label: "At least 12 characters" },
  { test: (v: string) => /[A-Z]/.test(v), label: "One uppercase letter" },
  { test: (v: string) => /[a-z]/.test(v), label: "One lowercase letter" },
  { test: (v: string) => /[0-9]/.test(v), label: "One number" },
  { test: (v: string) => /[^A-Za-z0-9]/.test(v), label: "One special character" },
];

export default function RegisterPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [recaptchaError, setRecaptchaError] = useState<string | undefined>();
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};

    if (form.fullName.trim().length < 3) next.fullName = "Enter your full name (min 3 characters)";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = "Enter a valid email address";
    if (!passwordRules.every((rule) => rule.test(form.password)))
      next.password = "Password doesn't meet all requirements";
    if (form.confirmPassword !== form.password) next.confirmPassword = "Passwords do not match";
    if (form.studentId.trim().length < 3) next.studentId = "Enter a valid student ID";
    if (form.university.trim().length < 2) next.university = "Enter your university";
    if (form.program.trim().length < 2) next.program = "Enter your program";
    if (!form.academicLevel) next.academicLevel = "Select your academic level";
    if (form.phoneNumber.trim().length < 7) next.phoneNumber = "Enter a valid phone number";
    if (!form.dateOfBirth) next.dateOfBirth = "Enter your date of birth";
    if (!form.country.trim()) next.country = "Enter your country";
    if (form.address.trim().length < 5) next.address = "Enter your address";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    if (!recaptchaToken) {
      setRecaptchaError("Please complete the reCAPTCHA check");
      return;
    }
    setRecaptchaError(undefined);

    setIsSubmitting(true);
    try {
      await api.post("/auth/register", { ...form, recaptchaToken });
      setRegisteredEmail(form.email);
      toast.success("Account created — check your email");
    } catch (error) {
      recaptchaRef.current?.reset();
      setRecaptchaToken(null);

      if (isAxiosError(error)) {
        const status = error.response?.status;
        const data = error.response?.data;

        if (status === 400 && Array.isArray(data?.errors)) {
          const fieldErrors: Partial<Record<keyof FormState, string>> = {};
          for (const issue of data.errors) {
            const field = issue.path?.[0] as keyof FormState | undefined;
            if (field) fieldErrors[field] = issue.message;
          }
          setErrors(fieldErrors);
          toast.error("Please fix the highlighted fields");
        } else if (status === 409) {
          if (data?.message?.toLowerCase().includes("email")) {
            setErrors((prev) => ({ ...prev, email: data.message }));
          } else if (data?.message?.toLowerCase().includes("student id")) {
            setErrors((prev) => ({ ...prev, studentId: data.message }));
          }
          toast.error(data?.message || "Registration failed");
        } else if (status === 403) {
          toast.error(data?.message || "reCAPTCHA verification failed");
        } else {
          toast.error(data?.message || "Registration failed. Please try again.");
        }
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (registeredEmail) {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <Card padding="lg" className="text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-signal-light">
              <MailCheck className="h-7 w-7 text-signal" />
            </div>
            <h1 className="font-display text-xl font-semibold text-ink">
              Check your inbox
            </h1>
            <p className="mt-2 text-sm text-slate">
              We sent a verification link to
            </p>
            <p className="mt-1 font-mono text-sm text-ink">{registeredEmail}</p>
            <p className="mt-4 text-sm text-slate">
              Verify your email to activate your account, then sign in.
            </p>
            <Link href="/login" className="mt-6 block">
              <Button className="w-full">Go to login</Button>
            </Link>
          </Card>
        </motion.div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-2xl"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-signal text-white">
            <ShieldCheck className="h-5.5 w-5.5" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            Create your account
          </h1>
          <p className="mt-1.5 text-sm text-slate">
            Apply for scholarships with a secure, verified account.
          </p>
        </div>

        <Card padding="lg">
          <form onSubmit={handleSubmit} noValidate className="space-y-8">
            <section>
              <CardHeader title="Account details" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Input
                    label="Full name"
                    placeholder="Jane Doe"
                    value={form.fullName}
                    error={errors.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label="Email"
                    type="email"
                    placeholder="jane@university.edu"
                    value={form.email}
                    error={errors.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </div>
                <div>
                  <Input
                    label="Password"
                    type="password"
                    value={form.password}
                    error={errors.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                  />
                  {form.password.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {passwordRules.map((rule) => {
                        const passed = rule.test(form.password);
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
                  label="Confirm password"
                  type="password"
                  value={form.confirmPassword}
                  error={errors.confirmPassword}
                  onChange={(e) => handleChange("confirmPassword", e.target.value)}
                />
              </div>
            </section>

            <section>
              <CardHeader title="Academic details" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Student ID"
                  mono
                  value={form.studentId}
                  error={errors.studentId}
                  onChange={(e) => handleChange("studentId", e.target.value)}
                />
                <Select
                  label="Academic level"
                  placeholder="Select level"
                  options={academicLevelOptions}
                  value={form.academicLevel}
                  error={errors.academicLevel}
                  onChange={(e) => handleChange("academicLevel", e.target.value)}
                />
                <Input
                  label="University"
                  value={form.university}
                  error={errors.university}
                  onChange={(e) => handleChange("university", e.target.value)}
                />
                <Input
                  label="Program"
                  placeholder="e.g. Computer Science"
                  value={form.program}
                  error={errors.program}
                  onChange={(e) => handleChange("program", e.target.value)}
                />
              </div>
            </section>

            <section>
              <CardHeader title="Contact details" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label="Phone number"
                  type="tel"
                  value={form.phoneNumber}
                  error={errors.phoneNumber}
                  onChange={(e) => handleChange("phoneNumber", e.target.value)}
                />
                <Input
                  label="Date of birth"
                  type="date"
                  value={form.dateOfBirth}
                  error={errors.dateOfBirth}
                  onChange={(e) => handleChange("dateOfBirth", e.target.value)}
                />
                <Input
                  label="Country"
                  value={form.country}
                  error={errors.country}
                  onChange={(e) => handleChange("country", e.target.value)}
                />
                <Input
                  label="Address"
                  value={form.address}
                  error={errors.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                />
              </div>
            </section>

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
              Create account
            </Button>
          </form>
        </Card>

        <p className="mt-6 text-center text-sm text-slate">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-signal hover:text-signal-dark">
            Sign in
          </Link>
        </p>
      </motion.div>
    </main>
  );
}