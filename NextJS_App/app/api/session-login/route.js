import { adminAuth } from "@/utils/firebaseAdmin";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req) {
    try {
        const { idToken } = await req.json();
        if (!idToken) {
            return NextResponse.json({ message: "Missing token" }, { status: 400 });
        }

        const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
        const cookie = await cookies();
        const sessionCookie = await adminAuth.createSessionCookie(idToken, {
            expiresIn,
        });

        cookie.set({
            name: "session",
            value: sessionCookie,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: expiresIn / 1000,
            path: "/",
        });

        return NextResponse.json({ message: "success" }, { status: 200 });
    } catch (err) {
        return NextResponse.json({ message: err }, { status: 500 });
    }
}
