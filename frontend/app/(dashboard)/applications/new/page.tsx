"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import api from "@/lib/axios";
import { useUser } from "@/lib/useUser";
import Card, { CardHeader } from "@/components/Card";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import Button from "@/components/Button";

interface FormState {
  scholarshipTitle: string;
  personalStatement: string;
  gpa: string;
  annualFamilyIncome: string;
  university: string;
  program: string;
  expectedGraduationDate: string;
  achievements: string;
  extracurricularActivities: string;
}

export default function NewApplicationPage() {
  const router = useRouter();
  const { user } = useUser();

  const [form, setForm] = useState<FormState>({
    scholarshipTitle: "",
    personalStatement: "",
    gpa: "",
    annualFamilyIncome: "",
    university: user?.university ?? "",
    program: user?.program ?? "",
    expectedGraduationDate: "",
    achievements: "",
    extracurricularActivities: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};

    if (form.scholarshipTitle.trim().length < 3)
      next.scholarshipTitle = "Enter a title (min 3 characters)";
    if (form.personalStatement.trim().length < 50)
      next.personalStatement = `Write at least 50 characters (${form.personalStatement.trim().length}/50)`;

    const gpaNum = Number(form.gpa);
    if (form.gpa === "" || Number.isNaN(gpaNum) || gpaNum < 0 || gpaNum > 4)
      next.gpa = "Enter a GPA between 0 and 4";

    const incomeNum = Number(form.annualFamilyIncome);
    if (form.annualFamilyIncome === "" || Number.isNaN(incomeNum) || incomeNum < 0)
      next.annualFamilyIncome = "Enter a valid amount";

    if (form.university.trim().length < 2) next.university = "Enter your university";
    if (form.program.trim().length < 2) next.program = "Enter your program";
    if (!form.expectedGraduationDate) next.expectedGraduationDate = "Select an expected graduation date";
    if (form.achievements.trim().length < 5) next.achievements = "Enter at least 5 characters";
    if (form.extracurricularActivities.trim().length < 5)
      next.extracurricularActivities = "Enter at least 5 characters";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const res = await api.post("/applications", {
        scholarshipTitle: form.scholarshipTitle,
        personalStatement: form.personalStatement,
        gpa: Number(form.gpa),
        annualFamilyIncome: Number(form.annualFamilyIncome),
        university: form.university,
        program: form.program,
        expectedGraduationDate: form.expectedGraduationDate,
        achievements: form.achievements,
        extracurricularActivities: form.extracurricularActivities,
      });

      toast.success("Draft application created");
      router.push(`/applications/${res.data.application._id}`);
    } catch (error) {
      if (isAxiosError(error)) {
        const data = error.response?.data;
        if (error.response?.status === 400 && Array.isArray(data?.errors)) {
          const fieldErrors: Partial<Record<keyof FormState, string>> = {};
          for (const issue of data.errors) {
            const field = issue.path?.[0] as keyof FormState | undefined;
            if (field) fieldErrors[field] = issue.message;
          }
          setErrors(fieldErrors);
          toast.error("Please fix the highlighted fields");
        } else {
          toast.error(data?.message || "Failed to create application");
        }
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link
          href="/applications"
          className="mb-3 flex items-center gap-1.5 text-sm font-medium text-slate hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to applications
        </Link>
        <h1 className="font-display text-2xl font-semibold text-ink">
          New scholarship application
        </h1>
        <p className="mt-1 text-sm text-slate">
          This saves as a draft — you can review and submit it afterward.
        </p>
      </div>

      <Card padding="lg">
        <form onSubmit={handleSubmit} noValidate className="space-y-8">
          <section>
            <CardHeader
              title="Scholarship"
              description="What are you applying for?"
            />
            <div className="space-y-4">
              <Input
                label="Scholarship title"
                placeholder="e.g. Merit-Based Excellence Scholarship"
                value={form.scholarshipTitle}
                error={errors.scholarshipTitle}
                onChange={(e) => handleChange("scholarshipTitle", e.target.value)}
              />
              <Textarea
                label="Personal statement"
                rows={6}
                placeholder="Tell us about yourself and why you're applying..."
                value={form.personalStatement}
                error={errors.personalStatement}
                hint={`${form.personalStatement.trim().length} characters (minimum 50)`}
                onChange={(e) => handleChange("personalStatement", e.target.value)}
              />
            </div>
          </section>

          <section>
            <CardHeader title="Academic details" />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="GPA"
                type="number"
                min={0}
                max={4}
                step={0.01}
                placeholder="3.75"
                value={form.gpa}
                error={errors.gpa}
                onChange={(e) => handleChange("gpa", e.target.value)}
              />
              <Input
                label="Annual family income (USD)"
                type="number"
                min={0}
                placeholder="45000"
                value={form.annualFamilyIncome}
                error={errors.annualFamilyIncome}
                onChange={(e) => handleChange("annualFamilyIncome", e.target.value)}
              />
              <Input
                label="University"
                value={form.university}
                error={errors.university}
                onChange={(e) => handleChange("university", e.target.value)}
              />
              <Input
                label="Program"
                value={form.program}
                error={errors.program}
                onChange={(e) => handleChange("program", e.target.value)}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Expected graduation date"
                  type="date"
                  value={form.expectedGraduationDate}
                  error={errors.expectedGraduationDate}
                  onChange={(e) => handleChange("expectedGraduationDate", e.target.value)}
                />
              </div>
            </div>
          </section>

          <section>
            <CardHeader
              title="Achievements & activities"
              description="Highlight what makes your application stand out."
            />
            <div className="space-y-4">
              <Textarea
                label="Achievements"
                placeholder="Awards, honors, notable accomplishments..."
                value={form.achievements}
                error={errors.achievements}
                onChange={(e) => handleChange("achievements", e.target.value)}
              />
              <Textarea
                label="Extracurricular activities"
                placeholder="Clubs, volunteering, sports, leadership roles..."
                value={form.extracurricularActivities}
                error={errors.extracurricularActivities}
                onChange={(e) => handleChange("extracurricularActivities", e.target.value)}
              />
            </div>
          </section>

          <Button type="submit" className="w-full" isLoading={isSubmitting}>
            <FileText className="h-4 w-4" />
            Save as draft
          </Button>
        </form>
      </Card>
    </div>
  );
}