"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { isAxiosError } from "axios";
import api from "@/lib/axios";
import Card from "@/components/Card";
import Button from "@/components/Button";

type Status = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const params = useParams<{ token: string }>();
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    let isMounted = true;

    api
      .get(`/auth/verify-email/${params.token}`)
      .then((res) => {
        if (!isMounted) return;
        setStatus("success");
        setMessage(res.data?.message || "Email verified successfully.");
      })
      .catch((error) => {
        if (!isMounted) return;
        setStatus("error");
        if (isAxiosError(error) && error.response?.data?.message) {
          setMessage(error.response.data.message);
        } else {
          setMessage("Something went wrong while verifying your email.");
        }
      });

    return () => {
      isMounted = false;
    };
  }, [params.token]);

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="w-full max-w-md"
      >
        <Card padding="lg" className="text-center">
          {status === "loading" && (
            <>
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-signal-light">
                <Loader2 className="h-7 w-7 animate-spin text-signal" />
              </div>
              <h1 className="font-display text-xl font-semibold text-ink">
                Verifying your email
              </h1>
              <p className="mt-2 text-sm text-slate">
                This will just take a moment.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-success-light">
                <CheckCircle2 className="h-7 w-7 text-success" />
              </div>
              <h1 className="font-display text-xl font-semibold text-ink">
                Email verified
              </h1>
              <p className="mt-2 text-sm text-slate">{message}</p>
              <Link href="/login" className="mt-6 block">
                <Button className="w-full">Continue to login</Button>
              </Link>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-danger-light">
                <XCircle className="h-7 w-7 text-danger" />
              </div>
              <h1 className="font-display text-xl font-semibold text-ink">
                Verification failed
              </h1>
              <p className="mt-2 text-sm text-slate">{message}</p>
              <Link href="/register" className="mt-6 block">
                <Button variant="secondary" className="w-full">
                  Back to registration
                </Button>
              </Link>
            </>
          )}
        </Card>
      </motion.div>
    </main>
  );
}