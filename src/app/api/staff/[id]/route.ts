import { NextRequest, NextResponse } from "next/server";
import { entityPrisma } from "@/lib/db";
import { auth } from "@/auth";
import { hash } from "bcryptjs";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Get staff details by ID
export async function GET(
 request: Request, context: RouteContext
) {
  try {
  const params = await context.params;

    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;

    // Find staff with matching ID and entity ID
    const staff = await entityPrisma.staff.findFirst({
      where: {
        id: id,
        entityId: session.user.entityId as string,
      },
    });    if (!staff) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    // Return staff details without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { pasword, ...staffWithoutPassword } = staff;
    return NextResponse.json(staffWithoutPassword);
  } catch (error) {
    console.error("Error fetching staff:", error);
    return NextResponse.json(
      { error: "Failed to fetch staff details" },
      { status: 500 }
    );
  }
}

// Update staff details
export async function PATCH(
  req: NextRequest, context: RouteContext
) {
  try {
    const params = await context.params;
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = params.id;
    const body = await req.json();

    // Validate that the staff belongs to the same entity
    const existingStaff = await entityPrisma.staff.findFirst({
      where: {
        id: id,
        entityId: session.user.entityId as string,
      },
    });    if (!existingStaff) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    // Prepare update data
    type StaffUpdateData = {
      name?: string;
      gender?: string;
      phone?: string;
      email?: string;
      address?: string;
      pasword?: string;
    };
    
    const updateData: StaffUpdateData = {};
    
    // Only update fields that are provided and different from existing
    if (body.name !== undefined) updateData.name = body.name;
    if (body.gender !== undefined) updateData.gender = body.gender;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.address !== undefined) updateData.address = body.address;
    
    // Hash password if provided
    if (body.password && body.password.trim() !== "") {
      updateData.pasword = await hash(body.password, 10);
    }    // Update staff
    const updatedStaff = await entityPrisma.staff.update({
      where: { id },
      data: updateData,
    });

    // Return updated staff without password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { pasword, ...staffWithoutPassword } = updatedStaff;
    return NextResponse.json(staffWithoutPassword);
  } catch (error) {
    console.error("Error updating staff:", error);
    return NextResponse.json(
      { error: "Failed to update staff details" },
      { status: 500 }
    );
  }
}
