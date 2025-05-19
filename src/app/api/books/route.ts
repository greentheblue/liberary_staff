import { NextResponse } from "next/server";
import { entityPrisma } from "@/lib/db";
import { auth } from "@/auth";

/**
 * Generates a unique 5-digit book ID that doesn't exist in the database
 * @returns Promise with the unique ID string
 */
async function generateUniqueBookId(): Promise<string> {
  let bookId: string = "";
  let isUnique = false;
  
  while (!isUnique) {
    // Generate random 5-digit number
    bookId = Math.floor(10000 + Math.random() * 90000).toString();
    
    // Check if ID already exists
    const existingBook = await entityPrisma.book.findUnique({
      where: { id: bookId }
    });
    
    if (!existingBook) {
      isUnique = true;
    }
  }
  
  return bookId;
}

// Get all books for the entity
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    // Get entityId from cookie
   
    const entityId = session.user.entityId;
    
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
    
    const session = await auth();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    // Get entityId from cookie
   
    const entityId = session.user.entityId;
    const staffId = session.user.id;

    if (!staffId) {
      return NextResponse.json(
        { error: "Staff ID not found in cookie" },
        { status: 400 }
      );
    }
    
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
    }    // Generate a unique ID for the new book
    const bookId = await generateUniqueBookId();

    const book = await entityPrisma.book.create({
      data: {
        id: bookId,
        title: body.title,
        author: body.author,
        copies: parseInt(body.copies),
        availableCopies: parseInt(body.copies), // Initially all copies are available
        categoryId: body.categoryId,
        entityId: entityId,
        createdBy: staffId,
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