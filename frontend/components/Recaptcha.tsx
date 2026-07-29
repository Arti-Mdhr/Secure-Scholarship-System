"use client";

import ReCAPTCHA from "react-google-recaptcha";
import { forwardRef } from "react";

interface RecaptchaProps {
  onChange: (token: string | null) => void;
  error?: string;
}

const Recaptcha = forwardRef<ReCAPTCHA, RecaptchaProps>(
  ({ onChange, error }, ref) => {
    const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

    if (!siteKey) {
      return (
        <p className="rounded-lg bg-warning-light px-3 py-2 text-xs text-warning">
          Missing NEXT_PUBLIC_RECAPTCHA_SITE_KEY in .env.local
        </p>
      );
    }

    return (
      <div>
        <ReCAPTCHA ref={ref} sitekey={siteKey} onChange={onChange} />
        {error && <p className="mt-1.5 text-xs text-danger">{error}</p>}
      </div>
    );
  }
);

Recaptcha.displayName = "Recaptcha";

export default Recaptcha;