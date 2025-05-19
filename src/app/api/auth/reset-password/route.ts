import { NextRequest, NextResponse } from "next/server";
import { entityPrisma } from "@/lib/db";
import { hash } from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { success: false, message: "Token and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    // Find the token in the database
    const passwordReset = await entityPrisma.passwordReset.findUnique({
      where: { token }
    });

    if (!passwordReset) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (new Date() > passwordReset.expiresAt) {
      return NextResponse.json(
        { success: false, message: "Token has expired" },
        { status: 400 }
      );
    }

    // Check if token has already been used
    if (passwordReset.used) {
      return NextResponse.json(
        { success: false, message: "Token has already been used" },
        { status: 400 }
      );
    }    // Hash the new password
    const hashedPassword = await hash(password, 10);

    // Find the staff member by email
    const staff = await entityPrisma.staff.findFirst({
      where: { email: passwordReset.email }
    });

    if (!staff) {
      return NextResponse.json(
        { success: false, message: "Staff account not found" },
        { status: 404 }
      );
    }

    // Update the user's password
    await entityPrisma.staff.update({
      where: { id: staff.id },
      data: { pasword: hashedPassword }
    });

    // Mark the token as used
    await entityPrisma.passwordReset.update({
      where: { id: passwordReset.id },
      data: { used: true }
    });

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully"
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
