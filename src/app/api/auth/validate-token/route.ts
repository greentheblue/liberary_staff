import { NextRequest, NextResponse } from "next/server";
import { entityPrisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Token is required" },
        { status: 400 }
      );
    }

    // Find the token in the database
    const passwordReset = await entityPrisma.passwordReset.findUnique({
      where: { token }
    });

    if (!passwordReset) {
      return NextResponse.json(
        { success: false, message: "Invalid token" },
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
    }

    return NextResponse.json({
      success: true,
      message: "Token is valid"
    });
  } catch (error) {
    console.error("Validate token error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
