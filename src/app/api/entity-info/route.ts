import { NextResponse } from "next/server";
import { entityPrisma } from "@/lib/db";
import { auth } from "@/auth";

// Get current entity information
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const entityId = session.user.entityId;
    
    if (!entityId) {
      return NextResponse.json(
        { error: "Entity ID not found in session" },
        { status: 400 }
      );
    }

    const entity = await entityPrisma.entity.findUnique({
      where: {
        id: entityId,
      },
      select: {
        id: true,
        name: true,
        address: true,
        type: true
      }
    });

    if (!entity) {
      return NextResponse.json(
        { error: "Entity not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(entity);
  } catch (error) {
    console.error("Error fetching entity information:", error);
    return NextResponse.json(
      { error: "Failed to fetch entity information" },
      { status: 500 }
    );
  }
}
