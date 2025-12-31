import { adminAuth } from "@/utils/firebaseAdmin";
import { addIdToVerify } from "@/utils/firebaseUtils";
import { Resend } from "resend";
import { NextResponse } from "next/server";
const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(req) {
    try {
        const authHeader = req.headers.get("authorization") || "";
        const token = authHeader.replace("Bearer ", "");
        if (!token) return NextResponse.json({ message: "forbidden!" }, { status: 403 });
        const decoded = await adminAuth.verifyIdToken(token);
        const uid = decoded.uid;
        await adminAuth.updateUser(uid, {
            emailVerified: true,
        })
        return NextResponse.json({ message: "Account Verified!" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: "Failed verifying user account!" }, { status: error?.httpErrorStatusCode || 500 })
    }
};

export async function POST(req) {
    try {
        const { name, mobile, email, hostURL, token, role } = await req.json();
        if (!name || !mobile || !email || !hostURL || !token || !role) return NextResponse.json({ message: "missing required headers!" }, { status: 400 });

        const actionCodeSettings = {
            // Where user should be redirected after clicking the link
            url: `${hostURL}/verify-signup?token=${token}&role=${role}`,
            handleCodeInApp: false,
        };
        const verificationLink = await adminAuth.generateSignInWithEmailLink(email, actionCodeSettings);

        const data = await resend.emails.send({
            from: "Bright Aura-SLM <onboarding@resend.dev>",
            to: [email],
            subject: "Verify your email to activate your Bright Aura - SLM dashboard account",
            html: `
    <div style="font-family: Arial, Helvetica, sans-serif; background-color: #f9fafb; padding: 24px;">
      <div style="max-width: 560px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 32px; box-shadow: 0 4px 10px rgba(0,0,0,0.05);">
        
        <h2 style="margin-top: 0; color: #111827;">
          Verify your email address
        </h2>

        <p style="color: #374151; font-size: 14px; line-height: 1.6;">
          You’re almost ready to start using <strong>SLM</strong>.
          Please confirm your email address to activate your account and set your password.
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a
            href="${verificationLink}"
            style="
              background-color: #2563eb;
              color: #ffffff;
              text-decoration: none;
              padding: 12px 24px;
              border-radius: 6px;
              font-size: 14px;
              font-weight: 600;
              display: inline-block;
            "
          >
            Verify Email & Activate Account
          </a>
        </div>

        <p style="color: #6b7280; font-size: 13px; line-height: 1.5;">
          This link will expire in <strong>1 hour</strong>.
          If you did not request this account, you can safely ignore this email.
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />

        <p style="color: #9ca3af; font-size: 12px; line-height: 1.5;">
          If the button above doesn’t work, copy and paste the following URL into your browser:
        </p>

        <p style="word-break: break-all; font-size: 12px; color: #2563eb;">
          ${verificationLink}
        </p>

        <p style="margin-top: 24px; color: #9ca3af; font-size: 12px;">
          — Bright Aura Security Team
        </p>
      </div>
    </div>
  `,
        });

        await addIdToVerify(name, email, mobile, role, token);
        return NextResponse.json({ message: "Account added Successfully!" }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: error?.message || error?.code || error || "Failed adding user account!" }, { status: error?.httpErrorStatusCode || 500 });
    }
};