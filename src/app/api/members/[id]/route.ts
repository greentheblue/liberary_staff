"use server"

import { NextResponse } from 'next/server';
import {entityPrisma} from '@/lib/db';
import { z } from 'zod';

const memberSchema = z.object({
  name: z.string().min(1, "Name is required"),
  memberType: z.enum(["STUDENT", "YOUTH", "ADULT"]),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  phoneNumber: z.string().length(10, "Phone number must be exactly 10 digits"),
  address: z.string().min(1, "Address is required"),
  class: z.string().optional(),
  division: z.string().optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: Request, context: RouteContext
) {
  const params = await context.params;
  try {
    const member = await entityPrisma.member.findUnique({
      where: { id: params.id },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(member);
  } catch (error) {
    console.error("Error fetching member:", error);
    return NextResponse.json(
      { error: "Failed to fetch member" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request, context: RouteContext
) {
  try {
    const params = await context.params;
    const body = await request.json();
    
    const validationResult = memberSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation error", details: validationResult.error.format() },
        { status: 400 }
      );
    }
    
    const member = await entityPrisma.member.update({
      where: { id: params.id },
      data: validationResult.data,
    });
    
    return NextResponse.json(member);
  } catch (error) {
    console.error("Error updating member:", error);
    return NextResponse.json(
      { error: "Failed to update member" },
      { status: 500 }
    );
  }
}