import { NextResponse } from "next/server";
import { entityPrisma } from "@/lib/db";
import { auth } from "@/auth";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Get a specific book category
export async function GET( request: Request,
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

    if (!entityId) {
      return NextResponse.json(
        { error: "Entity ID not found in cookie" },
        { status: 400 }
      );
    }

    const category = await entityPrisma.bookCategory.findUnique({
      where: {
        id: id,
        entityId: entityId,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Book category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error fetching book category:", error);
    return NextResponse.json(
      { error: "Failed to fetch book category" },
      { status: 500 }
    );
  }
}

// Update a book category
export async function PATCH( request: Request,
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
    
    if (!entityId) {
      return NextResponse.json(
        { error: "Entity ID not found in cookie" },
        { status: 400 }
      );
    }

    if (!entityId) {
      return NextResponse.json(
        { error: "Entity ID not found in cookie" },
        { status: 400 }
      );
    }

    const updatedCategory = await entityPrisma.bookCategory.update({
      where: {
        id: id,
        entityId: entityId,
      },
      data: {
        name: body.name,
      },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("Error updating book category:", error);
    return NextResponse.json(
      { error: "Failed to update book category" },
      { status: 500 }
    );
  }
}

// Delete a book category
export async function DELETE( request: Request,
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

    if (!entityId) {
      return NextResponse.json(
        { error: "Entity ID not found in cookie" },
        { status: 400 }
      );
    }

    // Check if there are any books in this category
    const booksCount = await entityPrisma.book.count({
      where: {
        categoryId: id,
        entityId: entityId,
      },
    });

    if (booksCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete category with existing books" },
        { status: 400 }
      );
    }

    await entityPrisma.bookCategory.delete({
      where: {
        id: id,
        entityId: entityId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting book category:", error);
    return NextResponse.json(
      { error: "Failed to delete book category" },
      { status: 500 }
    );
  }
}