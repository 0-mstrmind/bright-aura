import { adminAuth } from "@/utils/firebaseAdmin";
import { NextResponse } from "next/server";

export async function POST(req) {
  const { uid } = await req.json();
  if (!uid) {
    return NextResponse.json({ message: "UID is required" }, { status: 400 });
  }
  try {
    await adminAuth.updateUser(uid, { disabled: true });
    return NextResponse.json({ message: "User has been disabled." }, { status: 200 });
  } catch (error) {
    if (error.code === "auth/user-not-found") {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}