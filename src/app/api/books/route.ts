import { NextResponse } from "next/server";
import { entityPrisma } from "@/lib/db";
import { cookies } from "next/headers";

// Get all books for the entity
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

    const books = await entityPrisma.book.findMany({
      where: {
        entityId: entityId,
      },
      include: {
        category: {
          select: { name: true }
        }
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ books }, { status: 200 });
  } catch (error) {
    console.error("Error fetching books:", error);
    return NextResponse.json(
      { error: "Failed to fetch books" },
      { status: 500 }
    );
  }
}

// Create a new book
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

    // Validate the category exists
    const categoryExists = await entityPrisma.bookCategory.findUnique({
      where: {
        id: body.categoryId,
        entityId: entityId,
      }
    });

    if (!categoryExists) {
      return NextResponse.json(
        { error: "Invalid category" },
        { status: 400 }
      );
    }

    const book = await entityPrisma.book.create({
      data: {
        title: body.title,
        author: body.author,
        copies: parseInt(body.copies),
        availableCopies: parseInt(body.copies), // Initially all copies are available
        categoryId: body.categoryId,
        entityId: entityId,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(book);
  } catch (error) {
    console.error("Error creating book:", error);
    return NextResponse.json(
      { error: "Failed to create book" },
      { status: 500 }
    );
  }
}