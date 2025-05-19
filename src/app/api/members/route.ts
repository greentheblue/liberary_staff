import { NextRequest, NextResponse } from 'next/server';
import {entityPrisma} from '@/lib/db';
import { z } from 'zod';
import { auth } from '@/auth';

/**
 * Generates a unique 10-digit member ID that doesn't exist in the database
 * @returns Promise with the unique ID string
 */
async function generateUniqueId(): Promise<string> {
  let uniqueId: string = "";
  let isUnique = false;
  
  while (!isUnique) {
    // Generate random 10-digit number
    uniqueId = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    
    // Check if ID already exists
    const existingMember = await entityPrisma.member.findUnique({
      where: { id: uniqueId }
    });
    
    if (!existingMember) {
      isUnique = true;
    }
  }
  
  return uniqueId;
}

// Schema validation for member creation
const memberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  memberType: z.enum(["STUDENT", "YOUTH", "ADULT"]),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  phoneNumber: z.string().length(10, "Phone number must be exactly 10 digits"),
  address: z.string().min(1, "Address is required"),
  class: z.string().optional(),
  division: z.string().optional(),
  profileImage: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
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
        { error: "Entity ID not found in session" },
        { status: 400 }
      );
    }
    
    if (!staffId) {
      return NextResponse.json(
        { error: "Staff ID not found in session" },
        { status: 400 }
      );
    }
    
    // Validate request body
    const validationResult = memberSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation error", details: validationResult.error.format() },
        { status: 400 }
      );    }
      // Generate a unique ID for the new member
    const uniqueId = await generateUniqueId();
    
    // Create member with custom ID
    const member = await entityPrisma.member.create({
      data: {
        ...validationResult.data,
        id: uniqueId,
        entityId: entityId,
        createdBy: staffId
      },
    });
    
    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("Error creating member:", error);
    return NextResponse.json(
      { error: "Failed to create member" },
      { status: 500 }
    );
  }
}

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
        { error: "Entity ID not found in session" },
        { status: 400 }
      );
    }
    
    // Get the entity information first
    const entity = await entityPrisma.entity.findFirst({
      where: { id: entityId },
      select: { 
        type: true 
      }
    });

    // Get members for this entity only
    const members = await entityPrisma.member.findMany({
      where: { entityId: entityId },
      orderBy: { createdAt: 'desc' },
    });
    
    // Return both entity type info and members
    return NextResponse.json({
      entityType: entity?.type || "",
      members
    });
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}