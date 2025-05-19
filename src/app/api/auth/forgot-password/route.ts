import { NextRequest, NextResponse } from "next/server";
import { entityPrisma } from "@/lib/db";
import crypto from "crypto";
import { sendEmail, getPasswordResetTemplate } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { emailOrPhone } = await request.json();

    if (!emailOrPhone) {
      return NextResponse.json(
        { success: false, message: "Email or phone is required" },
        { status: 400 }
      );
    }

    // Find the staff member by email or phone
    const user = await entityPrisma.staff.findFirst({
      where: {
        OR: [
          { email: emailOrPhone },
          { phone: emailOrPhone }
        ]
      }
    });

    if (!user || !user.email) {
      // For security reasons, we'll still return a success message
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email/phone, a password reset link has been sent"
      });
    }    // Clean up any old tokens for this user
    await entityPrisma.passwordReset.deleteMany({
      where: {
        email: user.email,
      },
    });

    // Generate a unique token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

    // Save the token in the database
    await entityPrisma.passwordReset.create({
      data: {
        email: user.email,
        token,
        expiresAt,
      }
    });    // Generate the reset link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.headers.get("origin") || "http://localhost:3000";
    const resetLink = `${baseUrl}/auth/reset-password/${token}`;

    // Send the email with the reset link
    const emailResult = await sendEmail({
      to: user.email,
      subject: "Reset Your Library Staff Password",
      html: getPasswordResetTemplate(resetLink, user.name),
    });

    if (!emailResult.success) {
      console.error("Failed to send email:", emailResult.error);
      return NextResponse.json(
        { success: false, message: "Failed to send reset email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email/phone, a password reset link has been sent"
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
