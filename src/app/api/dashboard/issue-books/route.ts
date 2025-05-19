import { NextRequest, NextResponse } from 'next/server';
import { entityPrisma } from '@/lib/db';
import { auth } from '@/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { memberId, bookIds } = body;
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
    
    if (!staffId) {
      return NextResponse.json(
        { error: "Staff ID not found in session" },
        { status: 400 }
      );
    }

    // Validate that the member exists
    const member = await entityPrisma.member.findUnique({
      where: { id: memberId }
    });

    if (!member) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }    // Check if the member has any uncollected books
    const uncollectedBooks = await entityPrisma.issuedBook.findMany({
      where: {
        memberId: memberId,
        entityId: entityId,
        items: {
          some: {
            collected: false,
          },
        },
      },
      include: {
        items: {
          where: {
            collected: false,
          },
          include: {
            book: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    // Return uncollected books information for frontend usage
    // Note: We're not blocking the API, as the frontend will handle this
    // This serves as an additional validation that can be enabled if needed
    if (uncollectedBooks.length > 0) {
      // Uncomment to enforce the policy at the API level
      // return NextResponse.json(
      //   { 
      //     error: "Member has uncollected books", 
      //     uncollectedBooks 
      //   },
      //   { status: 400 }
      // );
    }

    // Validate the books exist and have available copies
    for (const bookId of bookIds) {
      const book = await entityPrisma.book.findUnique({
        where: { 
          id: bookId,
          entityId: entityId
        }
      });

      if (!book) {
        return NextResponse.json(
          { error: `Book with ID ${bookId} not found` },
          { status: 404 }
        );
      }

      if (book.availableCopies <= 0) {
        return NextResponse.json(
          { error: `Book "${book.title}" has no available copies` },
          { status: 400 }
        );
      }
    }    // Create issued book record with related items (all initially uncollected)
    const issuedBook = await entityPrisma.issuedBook.create({
      data: {
        member: {
          connect: { id: memberId }
        },
        entity: {
          connect: { id: entityId }
        },
        creator: {
          connect: { id: staffId }
        },
        items: {
          create: bookIds.map((bookId: string) => ({
            book: {
              connect: { id: bookId }
            },
            collected: false // Each book starts as uncollected
          }))
        }
      },      include: {
        member: true,
        creator: true,
        items: {
          include: {
            book: {
              include: {
                category: true
              }
            }
          }
        }
      }
    });

    // Update the available copies for each book
    for (const bookId of bookIds) {
      await entityPrisma.book.update({
        where: { id: bookId },
        data: {
          availableCopies: {
            decrement: 1
          }
        }
      });
    }

    return NextResponse.json(issuedBook, { status: 201 });
  } catch (error) {
    console.error("Error issuing books:", error);
    return NextResponse.json(
      { error: "Failed to issue books" },
      { status: 500 }
    );
  }
}