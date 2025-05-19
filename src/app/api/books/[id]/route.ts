import { NextResponse } from "next/server";
import { entityPrisma } from "@/lib/db";
import { auth } from "@/auth";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Get a specific book
export async function GET( 
  request: Request,
  context: RouteContext) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    const params = await context.params;

    const { id } = params;
    const entityId = session?.user.entityId;

    if (!entityId) {
      return NextResponse.json(
        { error: "Entity ID not found in cookie" },
        { status: 400 }
      );
    }

    const book = await entityPrisma.book.findUnique({
      where: {
        id: id,
        entityId: entityId,
      },
      include: {
        category: true,
      },
    });

    if (!book) {
      return NextResponse.json(
        { error: "Book not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(book);
  } catch (error) {
    console.error("Error fetching book:", error);
    return NextResponse.json(
      { error: "Failed to fetch book" },
      { status: 500 }
    );
  }
}

// Update a book
export async function PATCH( 
  request: Request,
  context: RouteContext) {
  try {
    const params = await context.params;

    const { id } = params;
    const body = await request.json();
   const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const entityId = session.user.entityId;
    const staffId = session.user.id;
    
    if (!entityId) {
      return NextResponse.json(
        { error: "Entity ID not found in cookie" },
        { status: 400 }
      );
    }

    // Validate category if it's being updated
    if (body.categoryId) {
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
    }

    // Get current book data to calculate available copies correctly
    const currentBook = await entityPrisma.book.findUnique({
      where: { 
        id: id,
        entityId: entityId
      }
    });

    if (!currentBook) {
      return NextResponse.json(
        { error: "Book not found" },
        { status: 404 }
      );
    }

    // Calculate new available copies if total copies is changing
    let availableCopies = currentBook.availableCopies;
    if (body.copies !== undefined) {
      const copiesDiff = parseInt(body.copies) - currentBook.copies;
      availableCopies = currentBook.availableCopies + copiesDiff;
      
      // Ensure availableCopies is not negative
      if (availableCopies < 0) {
        return NextResponse.json(
          { error: "Cannot reduce total copies below number currently loaned out" },
          { status: 400 }
        );
      }
    }

    const updatedBook = await entityPrisma.book.update({
      where: {
        id: id,
        entityId: entityId,
      },
      data: {
        title: body.title,
        author: body.author,
        lastEditedBy: staffId,
        copies: body.copies !== undefined ? parseInt(body.copies) : undefined,
        availableCopies: body.copies !== undefined ? availableCopies : undefined,
        categoryId: body.categoryId,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json(updatedBook);
  } catch (error) {
    console.error("Error updating book:", error);
    return NextResponse.json(
      { error: "Failed to update book" },
      { status: 500 }
    );
  }
}

// Delete a book
export async function DELETE(
  request: Request,
  context: RouteContext) {
  try {
    const params = await context.params;

    const { id } = params;
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

    // Check if all copies are available (none are loaned out)
    const book = await entityPrisma.book.findUnique({
      where: {
        id: id,
        entityId: entityId,
      }
    });

    if (!book) {
      return NextResponse.json(
        { error: "Book not found" },
        { status: 404 }
      );
    }

    if (book.availableCopies < book.copies) {
      return NextResponse.json(
        { error: "Cannot delete book with copies currently loaned out" },
        { status: 400 }
      );
    }

    await entityPrisma.book.delete({
      where: {
        id: id,
        entityId: entityId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting book:", error);
    return NextResponse.json(
      { error: "Failed to delete book" },
      { status: 500 }
    );
  }
}