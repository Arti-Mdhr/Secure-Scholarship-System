import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),

  secure: false,


  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function resolveAppBaseUrl(): string {
  const fallback = "https://localhost:3000";
  const candidate =
    process.env.FRONTEND_URL ||
    process.env.CLIENT_URL ||
    process.env.PUBLIC_FRONTEND_URL ||
    fallback;

  return trimTrailingSlash(candidate);
}

export const sendPasswordResetEmail = async (
  email: string,
  otp: string
): Promise<void> => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,

    to: email,

    subject: "Scholarship System Password Reset",

    html: `
      <h2>Password Reset Request</h2>

      <p>Your password reset OTP is:</p>

      <h1>${otp}</h1>

      <p>This OTP expires in 10 minutes.</p>

      <p>If you did not request a password reset, ignore this email.</p>
    `,
  });
};
