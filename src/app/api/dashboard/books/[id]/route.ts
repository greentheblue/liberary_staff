import { NextResponse } from "next/server";
import { entityPrisma } from "@/lib/db";
import { auth } from "@/auth";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Get a specific book for dashboard use
export async function GET(request: Request, context: RouteContext) {
  try {
    const params = await context.params;

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

    // Find the book with availability check
    const book = await entityPrisma.book.findUnique({
      where: {
        id: params.id,
        entityId: entityId,
      },
      include: {
        category: true,
      },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    if (book.availableCopies <= 0) {
      return NextResponse.json(
        { error: "Book has no available copies", book },
        { status: 400 }
      );
    }

    return NextResponse.json(book);
  } catch (error) {
    console.error("Error fetching book data:", error);
    return NextResponse.json(
      { error: "Failed to fetch book data" },
      { status: 500 }
    );
  }
}

// Update book information
export async function PUT(request: Request, context: RouteContext) {
  try {
    const params = await context.params;
    const body = await request.json();
    const { incrementAvailableCopies } = body;

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

    // Check if the book exists
    const existingBook = await entityPrisma.book.findUnique({
      where: {
        id: params.id,
        entityId: entityId,
      },
    });

    if (!existingBook) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Update logic for incrementing available copies
    if (incrementAvailableCopies) {
      const updatedBook = await entityPrisma.book.update({
        where: {
          id: params.id,
        },
        data: {
          availableCopies: {
            increment: incrementAvailableCopies
          }
        },
        include: {
          category: true,
        },
      });

      return NextResponse.json(updatedBook);
    }

    return NextResponse.json({ error: "No valid update parameters provided" }, { status: 400 });
  } catch (error) {
    console.error("Error updating book data:", error);
    return NextResponse.json(
      { error: "Failed to update book data" },
      { status: 500 }
    );
  }
}
