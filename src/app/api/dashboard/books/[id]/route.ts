import { NextResponse } from "next/server";
import { entityPrisma } from "@/lib/db";
import { cookies } from "next/headers";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Get a specific book for dashboard use
export async function GET(request: Request, context: RouteContext) {
  try {
    const params = await context.params;

    // Get entityId from cookie
    const cookieStore = await cookies();
    const entityId = cookieStore.get("entityId")?.value;

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
