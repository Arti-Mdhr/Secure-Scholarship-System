"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Pencil,
  X,
  Upload,
  Download,
  FileText,
  GraduationCap,
  Award,
  IdCard,
  Send,
  Inbox,
} from "lucide-react";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";
import api from "@/lib/axios";
import Card, { CardHeader } from "@/components/Card";
import Input from "@/components/Input";
import Textarea from "@/components/Textarea";
import Select from "@/components/Select";
import Button from "@/components/Button";
import StatusBadge, { ApplicationStatus } from "@/components/StatusBadge";

interface ApplicationDetail {
  _id: string;
  scholarshipTitle: string;
  personalStatement: string;
  gpa: number;
  annualFamilyIncome: number;
  university: string;
  program: string;
  expectedGraduationDate: string;
  achievements: string;
  extracurricularActivities: string;
  status: ApplicationStatus;
  submittedAt?: string;
  createdAt: string;
}

interface DocumentItem {
  _id: string;
  documentType: "transcript" | "recommendation_letter" | "identity_document";
  originalName: string;
  fileSize: number;
  uploadedAt: string;
}

const documentTypeOptions = [
  { value: "transcript", label: "Transcript" },
  { value: "recommendation_letter", label: "Recommendation letter" },
  { value: "identity_document", label: "Identity document" },
];

const documentTypeIcons: Record<DocumentItem["documentType"], typeof FileText> = {
  transcript: GraduationCap,
  recommendation_letter: Award,
  identity_document: IdCard,
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Mirrors the backend's multer fileFilter in src/middleware/upload.ts —
// kept in sync so users get instant feedback instead of a round trip.
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png"];
const ACCEPT_ATTR = ALLOWED_EXTENSIONS.join(",");

function validateFile(file: File): string | null {
  const extension = file.name
    .slice(file.name.lastIndexOf("."))
    .toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return "Unsupported file extension. Allowed: PDF, JPG, PNG.";
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return "Unsupported file type. Allowed: PDF, JPG, PNG.";
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return `File is too large (${formatBytes(file.size)}). Max size is 5MB.`;
  }
  if (file.size === 0) {
    return "File is empty.";
  }
  return null;
}

type EditForm = {
  scholarshipTitle: string;
  personalStatement: string;
  gpa: string;
  annualFamilyIncome: string;
  university: string;
  program: string;
  expectedGraduationDate: string;
  achievements: string;
  extracurricularActivities: string;
};

export default function ApplicationDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [editErrors, setEditErrors] = useState<Partial<Record<keyof EditForm, string>>>({});
  const [isSaving, setIsSaving] = useState(false);

  const [uploadType, setUploadType] = useState("transcript");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadFileError, setUploadFileError] = useState<string | undefined>();
  const [isUploading, setIsUploading] = useState(false);

  const [confirmingSubmit, setConfirmingSubmit] = useState(false);
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [appRes, docsRes] = await Promise.all([
        api.get(`/applications/${params.id}`),
        api.get(`/applications/${params.id}/documents`),
      ]);
      setApplication(appRes.data.application);
      setDocuments(docsRes.data.documents);
    } catch (error) {
      if (isAxiosError(error) && error.response?.status === 404) {
        setLoadError("Application not found.");
      } else if (isAxiosError(error) && error.response?.status === 403) {
        setLoadError("You don't have access to this application.");
      } else {
        setLoadError("Couldn't load this application.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard fetch-on-mount; loadData sets state once both requests resolve
    loadData();
  }, [loadData]);

  function startEditing() {
    if (!application) return;
    setEditForm({
      scholarshipTitle: application.scholarshipTitle,
      personalStatement: application.personalStatement,
      gpa: String(application.gpa),
      annualFamilyIncome: String(application.annualFamilyIncome),
      university: application.university,
      program: application.program,
      expectedGraduationDate: application.expectedGraduationDate,
      achievements: application.achievements,
      extracurricularActivities: application.extracurricularActivities,
    });
    setEditErrors({});
    setIsEditing(true);
  }

  function handleEditChange(field: keyof EditForm, value: string) {
    setEditForm((prev) => (prev ? { ...prev, [field]: value } : prev));
    if (editErrors[field]) setEditErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validateEdit(form: EditForm): boolean {
    const next: Partial<Record<keyof EditForm, string>> = {};

    if (form.scholarshipTitle.trim().length < 3) next.scholarshipTitle = "Min 3 characters";
    if (form.personalStatement.trim().length < 50) next.personalStatement = "Min 50 characters";

    const gpaNum = Number(form.gpa);
    if (form.gpa === "" || Number.isNaN(gpaNum) || gpaNum < 0 || gpaNum > 4)
      next.gpa = "GPA must be between 0 and 4";

    const incomeNum = Number(form.annualFamilyIncome);
    if (form.annualFamilyIncome === "" || Number.isNaN(incomeNum) || incomeNum < 0)
      next.annualFamilyIncome = "Enter a valid amount";

    if (form.university.trim().length < 2) next.university = "Enter your university";
    if (form.program.trim().length < 2) next.program = "Enter your program";
    if (!form.expectedGraduationDate) next.expectedGraduationDate = "Required";
    if (form.achievements.trim().length < 5) next.achievements = "Min 5 characters";
    if (form.extracurricularActivities.trim().length < 5)
      next.extracurricularActivities = "Min 5 characters";

    setEditErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSaveEdit() {
    if (!editForm || !validateEdit(editForm)) return;

    setIsSaving(true);
    try {
      const res = await api.put(`/applications/${params.id}`, {
        ...editForm,
        gpa: Number(editForm.gpa),
        annualFamilyIncome: Number(editForm.annualFamilyIncome),
      });
      setApplication(res.data.application);
      setIsEditing(false);
      toast.success("Application updated");
    } catch {
      toast.error("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleFileSelect(file: File | null) {
    if (!file) {
      setUploadFile(null);
      setUploadFileError(undefined);
      return;
    }

    const validationError = validateFile(file);
    if (validationError) {
      setUploadFile(null);
      setUploadFileError(validationError);
      return;
    }

    setUploadFile(file);
    setUploadFileError(undefined);
  }

  async function handleUpload() {
    if (!uploadFile) return;

    // Defense in depth: re-check right before the request, in case the
    // File object was swapped out from under us between select and click.
    const validationError = validateFile(uploadFile);
    if (validationError) {
      setUploadFileError(validationError);
      setUploadFile(null);
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", uploadFile);
      formData.append("documentType", uploadType);

      await api.post(`/applications/${params.id}/documents`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Document uploaded");
      setUploadFile(null);
      setUploadFileError(undefined);
      const docsRes = await api.get(`/applications/${params.id}/documents`);
      setDocuments(docsRes.data.documents);
    } catch (error) {
      if (isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Upload failed. Please try again.");
      }
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDownload(doc: DocumentItem) {
    try {
      const res = await api.get(`/documents/${doc._id}/download`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = doc.originalName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Download failed. Please try again.");
    }
  }

  async function handleSubmitApplication() {
    setIsSubmittingApp(true);
    try {
      await api.post(`/applications/${params.id}/submit`);
      toast.success("Application submitted");
      setConfirmingSubmit(false);
      await loadData();
    } catch (error) {
      if (isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Submission failed. Please try again.");
      }
    } finally {
      setIsSubmittingApp(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-signal" />
      </div>
    );
  }

  if (loadError || !application) {
    return (
      <div className="mx-auto max-w-2xl">
        <Card padding="lg" className="text-center">
          <p className="text-sm text-slate">{loadError}</p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => router.push("/applications")}
          >
            Back to applications
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href="/applications"
          className="mb-3 flex items-center gap-1.5 text-sm font-medium text-slate hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to applications
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-semibold text-ink">
            {application.scholarshipTitle}
          </h1>
          <StatusBadge status={application.status} />
        </div>
        <p className="mt-1 text-sm text-slate">
          {application.university} · {application.program}
        </p>
      </div>

      <Card padding="lg">
        <CardHeader
          title="Application details"
          action={
            application.status === "draft" && !isEditing ? (
              <Button variant="secondary" size="sm" onClick={startEditing}>
                <Pencil className="h-3.5 w-3.5" />
                Edit
              </Button>
            ) : undefined
          }
        />

        {isEditing && editForm ? (
          <div className="space-y-4">
            <Input
              label="Scholarship title"
              value={editForm.scholarshipTitle}
              error={editErrors.scholarshipTitle}
              onChange={(e) => handleEditChange("scholarshipTitle", e.target.value)}
            />
            <Textarea
              label="Personal statement"
              rows={6}
              value={editForm.personalStatement}
              error={editErrors.personalStatement}
              onChange={(e) => handleEditChange("personalStatement", e.target.value)}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label="GPA"
                type="number"
                min={0}
                max={4}
                step={0.01}
                value={editForm.gpa}
                error={editErrors.gpa}
                onChange={(e) => handleEditChange("gpa", e.target.value)}
              />
              <Input
                label="Annual family income (USD)"
                type="number"
                min={0}
                value={editForm.annualFamilyIncome}
                error={editErrors.annualFamilyIncome}
                onChange={(e) => handleEditChange("annualFamilyIncome", e.target.value)}
              />
              <Input
                label="University"
                value={editForm.university}
                error={editErrors.university}
                onChange={(e) => handleEditChange("university", e.target.value)}
              />
              <Input
                label="Program"
                value={editForm.program}
                error={editErrors.program}
                onChange={(e) => handleEditChange("program", e.target.value)}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Expected graduation date"
                  type="date"
                  value={editForm.expectedGraduationDate}
                  error={editErrors.expectedGraduationDate}
                  onChange={(e) =>
                    handleEditChange("expectedGraduationDate", e.target.value)
                  }
                />
              </div>
            </div>
            <Textarea
              label="Achievements"
              value={editForm.achievements}
              error={editErrors.achievements}
              onChange={(e) => handleEditChange("achievements", e.target.value)}
            />
            <Textarea
              label="Extracurricular activities"
              value={editForm.extracurricularActivities}
              error={editErrors.extracurricularActivities}
              onChange={(e) =>
                handleEditChange("extracurricularActivities", e.target.value)
              }
            />

            <div className="flex gap-3">
              <Button onClick={handleSaveEdit} isLoading={isSaving}>
                Save changes
              </Button>
              <Button variant="ghost" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <dl className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-xs text-slate">Personal statement</dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm text-ink">
                {application.personalStatement}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate">GPA</dt>
              <dd className="mt-0.5 font-mono text-sm text-ink">{application.gpa}</dd>
            </div>
            <div>
              <dt className="text-xs text-slate">Annual family income</dt>
              <dd className="mt-0.5 font-mono text-sm text-ink">
                ${application.annualFamilyIncome.toLocaleString()}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate">Expected graduation</dt>
              <dd className="mt-0.5 text-sm text-ink">
                {new Date(application.expectedGraduationDate).toLocaleDateString()}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate">Submitted</dt>
              <dd className="mt-0.5 text-sm text-ink">
                {application.submittedAt
                  ? new Date(application.submittedAt).toLocaleDateString()
                  : "Not yet submitted"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-slate">Achievements</dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm text-ink">
                {application.achievements}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs text-slate">Extracurricular activities</dt>
              <dd className="mt-1 whitespace-pre-wrap text-sm text-ink">
                {application.extracurricularActivities}
              </dd>
            </div>
          </dl>
        )}
      </Card>

      <Card padding="lg">
        <CardHeader
          title="Documents"
          description="Upload supporting documents for this application."
        />

        <div className="mb-5 flex flex-col gap-3 rounded-xl border border-dashed border-border bg-surface p-4 sm:flex-row sm:items-end">
          <div className="w-full sm:w-56">
            <Select
              label="Document type"
              options={documentTypeOptions}
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="mb-1.5 block text-sm font-medium text-ink">
              File
            </label>
            <input
              type="file"
              accept={ACCEPT_ATTR}
              onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-slate file:mr-3 file:rounded-lg file:border-0 file:bg-signal-light file:px-3 file:py-2 file:text-xs file:font-medium file:text-signal-dark hover:file:bg-signal/20"
            />
            {uploadFileError ? (
              <p className="mt-1.5 text-xs text-danger">{uploadFileError}</p>
            ) : (
              <p className="mt-1.5 text-xs text-slate">
                PDF, JPG, or PNG. Max 5MB.
              </p>
            )}
          </div>
          <Button
            onClick={handleUpload}
            disabled={!uploadFile || !!uploadFileError}
            isLoading={isUploading}
          >
            <Upload className="h-4 w-4" />
            Upload
          </Button>
        </div>

        {documents.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-center">
            <Inbox className="mb-2 h-5 w-5 text-slate-light" />
            <p className="text-sm text-slate">No documents uploaded yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {documents.map((doc) => {
              const Icon = documentTypeIcons[doc.documentType];
              return (
                <div
                  key={doc._id}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-signal-light text-signal">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">
                        {doc.originalName}
                      </p>
                      <p className="text-xs text-slate">
                        {documentTypeOptions.find((o) => o.value === doc.documentType)
                          ?.label}{" "}
                        · {formatBytes(doc.fileSize)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(doc)}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-signal hover:bg-signal-light"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {application.status === "draft" && (
        <Card padding="lg">
          {!confirmingSubmit ? (
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-medium text-ink">Ready to submit?</p>
                <p className="mt-0.5 text-sm text-slate">
                  Once submitted, this application can no longer be edited.
                </p>
              </div>
              <Button onClick={() => setConfirmingSubmit(true)}>
                <Send className="h-4 w-4" />
                Submit application
              </Button>
            </div>
          ) : (
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <p className="text-sm font-medium text-ink">
                Submit now? This can&apos;t be undone.
              </p>
              <div className="flex gap-3">
                <Button
                  variant="danger"
                  onClick={handleSubmitApplication}
                  isLoading={isSubmittingApp}
                >
                  Yes, submit
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setConfirmingSubmit(false)}
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}