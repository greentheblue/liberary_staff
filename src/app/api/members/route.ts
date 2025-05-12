import { NextRequest, NextResponse } from 'next/server';
import {entityPrisma} from '@/lib/db';
import { z } from 'zod';

// Schema validation for member creation
const memberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  memberType: z.enum(["STUDENT", "YOUTH", "ADULT"]),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  phoneNumber: z.string().length(10, "Phone number must be exactly 10 digits"),
  address: z.string().min(1, "Address is required"),
  class: z.string().optional(),
  division: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = memberSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation error", details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    // Create member
    const member = await entityPrisma.member.create({
      data: validationResult.data,
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
    const members = await entityPrisma.member.findMany({
      orderBy: { createdAt: 'desc' },
    });
    
    return NextResponse.json(members);
  } catch (error) {
    console.error("Error fetching members:", error);
    return NextResponse.json(
      { error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}