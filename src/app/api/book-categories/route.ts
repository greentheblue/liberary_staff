import { NextResponse } from "next/server";
import { entityPrisma } from "@/lib/db";
import { cookies } from "next/headers";

// Get all book categories for the entity
export async function GET() {
  try {
    // Get entityId from cookie
    const cookieStore = await cookies();
    const entityId = cookieStore.get("entityId")?.value;
    
    if (!entityId) {
      return NextResponse.json(
        { error: "Entity ID not found in cookie" },
        { status: 400 }
      );
    }

    const categories = await entityPrisma.bookCategory.findMany({
      where: {
        entityId: entityId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ categories }, { status: 200 });
  } catch (error) {
    console.error("Error fetching book categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch book categories" },
      { status: 500 }
    );
  }
}

// Create a new book category
export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Get entityId from cookie
    const cookieStore = await cookies();
    const entityId = cookieStore.get("entityId")?.value;
    
    if (!entityId) {
      return NextResponse.json(
        { error: "Entity ID not found in cookie" },
        { status: 400 }
      );
    }

    const category = await entityPrisma.bookCategory.create({
      data: {
        name: body.name,
        entityId: entityId,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error creating book category:", error);
    return NextResponse.json(
      { error: "Failed to create book category" },
      { status: 500 }
    );
  }
}