import { NextResponse } from 'next/server';
import { entityPrisma } from '@/lib/db';
import { cookies } from 'next/headers';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Update a specific issued book item (mark as collected)
export async function PUT(
  request: Request, context: RouteContext
) {
  const params = await context.params;
  try {
    const body = await request.json();
    const { collected } = body;
    
    // Get entityId from cookie
    const cookieStore = await cookies();
    const entityId = cookieStore.get("entityId")?.value;
    
    if (!entityId) {
      return NextResponse.json(
        { error: "Entity ID not found in cookie" },
        { status: 400 }
      );
    }

    // Find the issued book item
    const issuedBookItem = await entityPrisma.issuedBookItem.findUnique({
      where: {
        id: params.id,
      },
      include: {
        issuedBook: true,
      }
    });

    if (!issuedBookItem) {
      return NextResponse.json(
        { error: "Issued book item not found" },
        { status: 404 }
      );
    }

    // Verify the issued book belongs to this entity
    if (issuedBookItem.issuedBook.entityId !== entityId) {
      return NextResponse.json(
        { error: "Issued book item not found in this entity" },
        { status: 404 }
      );
    }

    // If marking as collected and it was previously not collected
    if (collected === true && !issuedBookItem.collected) {
      // Update the issuedBookItem status
      const updatedItem = await entityPrisma.issuedBookItem.update({
        where: {
          id: params.id,
        },
        data: {
          collected: true
        },
        include: {
          book: {
            include: {
              category: true,
            }
          },
          issuedBook: {
            include: {
              member: true,
            }
          }
        }
      });
      
      return NextResponse.json(updatedItem);
    } 
    // If marking as not collected and it was previously collected
    else if (collected === false && issuedBookItem.collected) {
      // Update the issuedBookItem status
      const updatedItem = await entityPrisma.issuedBookItem.update({
        where: {
          id: params.id,
        },
        data: {
          collected: false
        },
        include: {
          book: {
            include: {
              category: true,
            }
          },
          issuedBook: {
            include: {
              member: true,
            }
          }
        }
      });
      
      return NextResponse.json(updatedItem);
    } 
    // No change needed
    else {
      return NextResponse.json({ 
        message: "No change in collection status" 
      });
    }
  } catch (error) {
    console.error("Error updating issued book item:", error);
    return NextResponse.json(
      { error: "Failed to update issued book item" },
      { status: 500 }
    );
  }
}

// Delete a specific issued book item (return the book)
export async function DELETE(
  request: Request, context: RouteContext
) {
  const params = await context.params;
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

    // Find the issued book item with book info
    const issuedBookItem = await entityPrisma.issuedBookItem.findUnique({
      where: {
        id: params.id,
      },
      include: {
        book: true,
        issuedBook: true,
      }
    });

    if (!issuedBookItem) {
      return NextResponse.json(
        { error: "Issued book item not found" },
        { status: 404 }
      );
    }

    // Verify the issued book belongs to this entity
    if (issuedBookItem.issuedBook.entityId !== entityId) {
      return NextResponse.json(
        { error: "Issued book item not found in this entity" },
        { status: 404 }
      );
    }

    // Get the book ID for later update
    const bookId = issuedBookItem.bookId;
    
    // Delete the issued book item
    await entityPrisma.issuedBookItem.delete({
      where: {
        id: params.id,
      }
    });

    // If the book wasn't collected (still on loan), update the book availability
    if (!issuedBookItem.collected) {
      // Return book to inventory by incrementing available copies
      await entityPrisma.book.update({
        where: { id: bookId },
        data: {
          availableCopies: {
            increment: 1
          }
        }
      });
    }

    return NextResponse.json({ 
      success: true,
      message: "Book returned successfully" 
    });
  } catch (error) {
    console.error("Error returning book:", error);
    return NextResponse.json(
      { error: "Failed to return book" },
      { status: 500 }
    );
  }
}