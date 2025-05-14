import { NextResponse } from "next/server";
import { entityPrisma } from "@/lib/db";
import { auth } from "@/auth";

// Get all book categories for the entity
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