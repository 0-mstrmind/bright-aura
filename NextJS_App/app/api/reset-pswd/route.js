import { adminAuth } from "@/utils/firebaseAdmin";
import { NextResponse } from "next/server";
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { email, hostURL, role } = await req.json();

    if (!email || !hostURL || !role) {
      return NextResponse.json(
        { message: "Email is required!" },
        { status: 400 }
      );
    }
    const actionCodeSettings = {
      url: role === "partners" ? `${hostURL}/login` : `${hostURL}/admin-login`,
      handleCodeInApp: true,
    };

    const link = await adminAuth.generatePasswordResetLink(email, actionCodeSettings);
    const data = await resend.emails.send({
      from: "Bright Aura-SLM <onboarding@resend.dev>",
      to: [email],
      subject: "Reset your password",
      html: `
    <div style="font-family: Arial, Helvetica, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #111827;">
      
      <h2 style="color: #111827;">Reset your password</h2>

      <p>
        We received a request to reset the password for your SLM account.
        Click the button below to choose a new password.
      </p>

      <div style="margin: 32px 0;">
        <a
          href="${link}"
          style="
            background-color: #2563eb;
            color: #ffffff;
            padding: 12px 20px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            display: inline-block;
          "
        >
          Reset Password
        </a>
      </div>

      <p style="font-size: 14px; color: #374151;">
        This link will expire in <strong>60 minutes (1hr)</strong>.
        If you did not request a password reset, you can safely ignore this email.
      </p>

      <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e7eb;" />

      <p style="font-size: 12px; color: #6b7280;">
        If the button above does not work, copy and paste the following link into your browser:
      </p>

      <p style="font-size: 12px; color: #2563eb; word-break: break-all;">
        ${link}
      </p>

      <p style="font-size: 12px; color: #6b7280; margin-top: 24px;">
        © ${new Date().getFullYear()} Bright Aura. All rights reserved.
      </p>

    </div>
  `,
    });
    return NextResponse.json(
      { message: "Password reset link sent to email!" },
      { status: 200 }
    );

  } catch (error) {
    // Error handling
    const httpStatus = error?.httpErrorStatusCode || 500;
    const firebaseRes = error?.errorInfo?.code || error.code || "auth/internal-error";
    return NextResponse.json(
      { message: firebaseRes },
      { status: httpStatus }
    );
  }
}
