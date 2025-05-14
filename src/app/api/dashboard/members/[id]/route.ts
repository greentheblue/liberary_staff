import { NextResponse } from 'next/server';
import { entityPrisma } from '@/lib/db';
import { auth } from '@/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Get a specific member with their issued books
export async function GET(
  request: Request, context: RouteContext
) {
  try {
    const params = await context.params;
    // Get entityId from cookie
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

    // Find the member
    const member = await entityPrisma.member.findUnique({
      where: { id: params.id },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    // Find the issued books for this member with uncollected items
    const issuedBooks = await entityPrisma.issuedBook.findMany({
      where: {
        memberId: params.id,
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      member,
      issuedBooks
    });
  } catch (error) {
    console.error("Error fetching member data:", error);
    return NextResponse.json(
      { error: "Failed to fetch member data" },
      { status: 500 }
    );
  }
}